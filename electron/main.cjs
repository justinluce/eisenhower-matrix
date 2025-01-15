const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
    },
  });

  const startUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, '../dist/index.html')}`;
  mainWindow.loadURL(startUrl);
});

ipcMain.handle('save-tasks', async (_, data) => {
  const { filePath } = await dialog.showSaveDialog({
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
    defaultPath: 'tasks.json',
  });

  if (filePath) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return { success: true };
    } catch (error) { 
      console.log("error saving tasks: ", error);
      return { success: false };
    }
  }
  return { success: false };
});

ipcMain.handle('auto-save', (_, data) => {
  const filePath = path.join(app.getPath('userData'), 'tasks.json');
  
  if (filePath) {
    fs.writeFileSync(filePath, JSON.stringify(data));
    return { success: true }
  }
  return { success: false }; 
});

ipcMain.handle('load-tasks', async () => {
  const { filePaths } = await dialog.showOpenDialog({
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
    properties: ['openFile'],
  });

  if (filePaths.length > 0) {
    const data = fs.readFileSync(filePaths[0], 'utf-8');
    return JSON.parse(data);
  }
  return null;
});

ipcMain.handle('auto-load', () => {
  const filePath = path.join(app.getPath('userData'), 'tasks.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return { doTasks: [], scheduleTasks: [], delegateTasks: [], deleteTasks: [] };
});