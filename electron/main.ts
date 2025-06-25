import { app, BrowserWindow, screen, ipcMain, dialog } from "electron";
import path from "path";
import Store from "electron-store";
import * as XLSX from "xlsx";
import * as url from "url";

let win: BrowserWindow | null = null;
const store = new Store();
console.log("🗂 Store path:", store.path);

const isDev = !app.isPackaged;

const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const preloadPath = path.join(__dirname, "preload.js");
  console.log("🧠 Preload path:", preloadPath);

  win = new BrowserWindow({
    width: 550,
    height: height,
    x: width - 550,
    y: 0,
    icon: path.join(__dirname, "../public/icon.ico"), // Windows icon
    frame: false,
    resizable: false,
    movable: false,
    alwaysOnTop: false,
    webPreferences: {
      contextIsolation: true,
      preload: preloadPath,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, "../dist/index.html"),
        protocol: "file:",
        slashes: true,
      })
    );
  }

  // IPC: Get tasks
  ipcMain.handle("get-tasks", (_event, section) => {
    const result = store.get(section, []);
    console.log("📤 Fetching tasks from section:", section, result);
    return result;
  });

  // IPC: Set tasks
  ipcMain.handle("set-tasks", (_event, section, tasks) => {
    console.log("📝 Saving tasks to section:", section, tasks);
    store.set(section, tasks);
  });

  // IPC: Resize window
  ipcMain.on("resize-window", (_event, width) => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      const bounds = win.getBounds();
      win.setBounds({ x: bounds.x, y: bounds.y, width, height: bounds.height });
    }
  });

  // IPC: Export tasks to Excel
  ipcMain.handle("export-to-excel", async () => {
    const sections = ["Today", "Tomorrow", "Postponed/Backlog"];
    const workbook = XLSX.utils.book_new();

    const sanitizeSheetName = (name: string) =>
      name.replace(/[:\\/?*[\]]/g, "_").substring(0, 31);

    sections.forEach((section) => {
      const data = store.get(section, []) as {
        text: string;
        finished: boolean;
      }[];
      const sheetData = data.map((task) => ({
        Task: task.text,
        Finished: task.finished ? "Yes" : "No",
      }));
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        sanitizeSheetName(section)
      );
    });

    const { filePath } = await dialog.showSaveDialog({
      title: "Save Task Report",
      defaultPath: "tasks.xlsx",
      filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
    });

    if (filePath) {
      XLSX.writeFile(workbook, filePath);
    }
  });
};

// App lifecycle
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
