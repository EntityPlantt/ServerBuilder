const { BrowserWindow, app } = require("electron");
const { join } = require("path");
var window = null;
function createWindow() {
	if (window != null) {
		window.destroy();
	}
	window = new BrowserWindow({
		width: 600,
		height: 400,
		show: false,
		autoHideMenuBar: true,
		webPreferences: {
			preload: join(__dirname, "main.js")
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
})