const { app, BrowserWindow } = require('electron');
const path = require('path');
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false,
      sandbox: false,
       preload: path.join(__dirname, 'preload.cjs')
    },
    autoHideMenuBar: true
  });
  
  if (!app.isPackaged) {
    win.webContents.openDevTools();
  }
  
  win.loadURL('http://localhost:5173').catch(() => {
    console.log("Vite 还没准备好，5秒后重试...");
    setTimeout(() => win.loadURL('http://localhost:5173'), 5000);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();

});