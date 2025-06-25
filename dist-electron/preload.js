// electron/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  getTasks: (section) => import_electron.ipcRenderer.invoke("get-tasks", section),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setTasks: (section, tasks) => import_electron.ipcRenderer.invoke("set-tasks", section, tasks),
  exportToExcel: () => import_electron.ipcRenderer.invoke("export-to-excel")
});
