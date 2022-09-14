const { BrowserWindow, app, ipcMain, dialog: { showOpenDialogSync, showSaveDialogSync } } = require("electron");
const { join } = require("path");
var window = null;
function createWindow() {
	if (window != null) {
		window.destroy();
	}
	window = new BrowserWindow({
		width: 1000,
		height: 750,
		show: false,
		autoHideMenuBar: true,
		center: true,
		fullscreenable: false,
		title: "ServerBuilder",
		acceptFirstMouse: true,
		disableAutoHideCursor: true,
		backgroundColor: "#0d6efd",
		titleBarOverlay: {
			color: "#0d6efd",
			symbolColor: "white",
			height: 5
        },
		webPreferences: {
			preload: join(__dirname, "main.js"),
			sandbox: false,
			nodeIntegration: true
		}
	});
	window.loadFile(join(__dirname, "index.html"));
	window.once("ready-to-show", () => {
		window.maximize();
		window.show();
	});
	return window;
}
app.whenReady().then(() => {
	createWindow();
	ipcMain.on("open-dialog", (event, options) => {
		event.reply("path-dialog-finish", showOpenDialogSync(window, options));
	});
	ipcMain.on("save-dialog", (event, options) => {
		event.reply("path-dialog-finish", showSaveDialogSync(window, options));
	});
	app.on("activate", () => {
		if (!BrowserWindow.getAllWindows().length) {
			createWindow();
		}
	});
});
app.on("window-all-closed", () => {
	if (process.platform != "darwin") {
		process.exit();
	}
});