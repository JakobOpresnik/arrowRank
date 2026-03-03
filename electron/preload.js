const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronApi', {
  isElectron: true,
  platform: process.platform,
  env: process.env.NODE_ENV,
});
