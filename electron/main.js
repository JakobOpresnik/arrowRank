const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, spawnSync } = require('child_process');
const axios = require('axios');
const url = require('url');

let backendProcess = null;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForBackend(url, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await axios.get(url);
      return true;
    } catch {
      await wait(500);
    }
  }
  throw new Error('Backend did not start in time');
}

function stopBackend() {
  if (!backendProcess) return;
  // PyInstaller onefile runs the server as a child process, so kill the whole tree
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(backendProcess.pid), '/T', '/F']);
  } else {
    backendProcess.kill();
  }
  backendProcess = null;
}

// keeps the database and logos outside the install folder so reinstalls don't wipe them
function prepareDataDir() {
  const dataDir = app.getPath('userData');
  const logosDir = path.join(dataDir, 'uploaded_logos');
  fs.mkdirSync(logosDir, { recursive: true });
  const legacyDir = path.join(process.resourcesPath, 'backend');
  const dbPath = path.join(dataDir, 'default.db');
  const legacyDb = path.join(legacyDir, 'default.db');
  if (!fs.existsSync(dbPath) && fs.existsSync(legacyDb)) {
    fs.copyFileSync(legacyDb, dbPath);
    const legacyLogos = path.join(legacyDir, 'uploaded_logos');
    if (fs.existsSync(legacyLogos)) {
      fs.cpSync(legacyLogos, logosDir, { recursive: true });
    }
  }
  return {
    DATABASE_URL: `sqlite:///${dbPath.replace(/\\/g, '/')}`,
    UPLOAD_DIR: logosDir,
  };
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    icon: path.join(__dirname, 'desktop_icon.ico'),
    autoHideMenuBar: false, // hides menu bar
    frame: true, // removes title bar
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // allowRunningInsecureContent: false,
    },
  });

  // maximize window
  win.maximize();

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, '../frontend/index.html'),
      protocol: 'file:',
      slashes: true,
    }),
  );

  win.on('closed', stopBackend);
}

ipcMain.handle('save-excel-file', async (_event, buffer, filename, labels) => {
  const defaultDir = path.join(app.getPath('documents'), 'ArrowRank');
  if (!fs.existsSync(defaultDir)) {
    fs.mkdirSync(defaultDir, { recursive: true });
  }
  const { filePath, canceled } = await dialog.showSaveDialog({
    title: labels?.title ?? 'Save report',
    defaultPath: path.join(defaultDir, filename),
    filters: [{ name: labels?.filterName ?? 'Excel files', extensions: ['xlsx'] }],
  });
  if (canceled || !filePath) return null;
  fs.writeFileSync(filePath, Buffer.from(buffer));
  return filePath;
});

ipcMain.handle('open-file-location', (_event, filePath) => {
  shell.showItemInFolder(filePath);
});

ipcMain.handle('open-file', (_event, filePath) => {
  shell.openPath(filePath);
});

ipcMain.handle('open-external-url', (_event, url) => {
  shell.openExternal(url);
});

ipcMain.handle('close-app', () => {
  app.quit();
});

app.whenReady().then(async () => {
  // pick backend path depending on dev or packaged build
  const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, 'backend', 'backend.exe')
    : path.join(__dirname, '../backend/dist/backend.exe');

  console.log('Spawning backend from:', backendPath);

  // spawn backend and log errors
  backendProcess = spawn(backendPath, [], {
    stdio: ['pipe', 'pipe', 'pipe'], // stdin pipe lets the backend exit when Electron dies
    cwd: path.dirname(backendPath),
    env: {
      ...process.env,
      EXIT_ON_STDIN_EOF: '1',
      ...(app.isPackaged ? prepareDataDir() : {}),
    },
  });

  backendProcess.stdout.on('data', (data) =>
    console.log(`backend stdout: ${data}`),
  );
  backendProcess.stderr.on('data', (data) =>
    console.error(`backend stderr: ${data}`),
  );
  backendProcess.on('exit', (code) =>
    console.log(`backend exited with code ${code}`),
  );

  try {
    await waitForBackend('http://127.0.0.1:8000/health'); // FastAPI root URL
    createWindow();
  } catch (err) {
    console.error(err);
    stopBackend();
    app.quit();
  }
});

app.on('will-quit', stopBackend);

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') app.quit();
});
