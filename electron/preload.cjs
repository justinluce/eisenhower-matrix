const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveTasks: (tasks) => ipcRenderer.invoke('save-tasks', tasks),
  loadTasks: () => ipcRenderer.invoke('load-tasks'),
  autoSave: (tasks) => ipcRenderer.invoke('auto-save', tasks),
  autoLoad: () => ipcRenderer.invoke('auto-load'),
});