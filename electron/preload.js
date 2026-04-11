const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronApi', {
  isElectron: true,
  platform: process.platform,
  env: process.env.NODE_ENV,
  saveExcelFile: (buffer, filename) =>
    ipcRenderer.invoke('save-excel-file', buffer, filename),
  openFileLocation: (filePath) =>
    ipcRenderer.invoke('open-file-location', filePath),
  openFile: (filePath) =>
    ipcRenderer.invoke('open-file', filePath),
  openExternalUrl: (url) =>
    ipcRenderer.invoke('open-external-url', url),
  closeApp: () =>
    ipcRenderer.invoke('close-app'),
});
