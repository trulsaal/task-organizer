import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getTasks: (section: string) => ipcRenderer.invoke("get-tasks", section),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setTasks: (section: string, tasks: any[]) =>
    ipcRenderer.invoke("set-tasks", section, tasks),
  exportToExcel: () => ipcRenderer.invoke("export-to-excel"),
});
