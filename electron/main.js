const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
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
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
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

ipcMain.handle('save-excel-file', async (_event, buffer, filename) => {
  const defaultDir = path.join(app.getPath('documents'), 'ArrowRank');
  if (!fs.existsSync(defaultDir)) {
    fs.mkdirSync(defaultDir, { recursive: true });
  }
  const { filePath, canceled } = await dialog.showSaveDialog({
    title: 'Save Report',
    defaultPath: path.join(defaultDir, filename),
    filters: [{ name: 'Excel Files', extensions: ['xlsx'] }],
  });
  if (canceled || !filePath) return null;
  fs.writeFileSync(filePath, Buffer.from(buffer));
  return filePath;
});

ipcMain.handle('open-file-location', (_event, filePath) => {
  shell.showItemInFolder(filePath);
});

app.whenReady().then(async () => {
  // pick backend path depending on dev or packaged build
  const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, 'backend', 'backend.exe')
    : path.join(__dirname, '../backend/dist/backend.exe');

  console.log('Spawning backend from:', backendPath);

  // spawn backend and log errors
  backendProcess = spawn(backendPath, [], {
    stdio: ['ignore', 'pipe', 'pipe'], // capture stdout/stderr
    cwd: path.dirname(backendPath),
    /* env: {
      ...process.env,
      UPLOAD_DIR: path.join(app.getPath('userData'), 'logos'),
    }, */
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

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') app.quit();
});
