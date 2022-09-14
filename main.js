const { contextBridge: { exposeInMainWorld }, ipcRenderer } = require("electron");
const { getMaterialFileIcon } = require("file-extension-icon-js");
const { createServer } = require("http");
const Blockly = require("blockly");

const server = {
	online: false,
	server: null,
	port: parseInt(localStorage.getItem("port") ?? "80"),
	requests: JSON.parse(localStorage.getItem("requests")) ?? [],
	paths: JSON.parse(localStorage.getItem("paths")) ?? []
};
onhashchange = () => {
	if (window.location.hash) {
		document.querySelectorAll("[id^=menu-]").forEach(elm => elm.classList.add("d-none"));
		document.getElementById("menu-" + window.location.hash.substr(1)).classList.remove("d-none");
	}
	else {
		window.location.hash = "#server";
	}
};
document.reques
function frame() {
	requestAnimationFrame(frame);
	if (server.online == true) {
		document.querySelector("#show-status .text-success").classList.remove("d-none");
		document.querySelector("#show-status .text-danger").classList.add("d-none");
		document.querySelector("#show-status .text-muted").classList.add("d-none");
		document.getElementById("start-server-btn").classList.add("d-none");
		document.getElementById("stop-server-btn").classList.remove("d-none");
	}
	else if (server.online == false) {
		document.querySelector("#show-status .text-success").classList.add("d-none");
		document.querySelector("#show-status .text-danger").classList.remove("d-none");
		document.querySelector("#show-status .text-muted").classList.add("d-none");
		document.getElementById("start-server-btn").classList.remove("d-none");
		document.getElementById("stop-server-btn").classList.add("d-none");
	}
	else {
		document.querySelector("#show-status .text-success").classList.add("d-none");
		document.querySelector("#show-status .text-danger").classList.add("d-none");
		document.querySelector("#show-status .text-muted").classList.remove("d-none");
		document.getElementById("start-server-btn").classList.add("d-none");
		document.getElementById("stop-server-btn").classList.add("d-none");
	}
	document.getElementById("show-server-requests").innerText = server.requests.length;
	document.getElementById("show-server-time").innerText = Date();
	document.getElementById("show-port").innerText = server.port;
	document.getElementById("server-request-list").innerHTML = server.requests.map((req, index) => `
<tr>
	<td scope=row>${server.requests.length - index}</td>
	<td class=font-monospace>${req.path}</td>
	<td class=font-monospace>${req.ip}</td>
	<td>${new Date(req.time)}</td>
</tr>
`).join("");
}
onload = () => {
	savePaths();
	frame();
};
exposeInMainWorld("resetRequests", () => {
	server.requests = [];
	localStorage.removeItem("requests");
});
exposeInMainWorld("startServer", () => {
	server.online = null;
	server.server = createServer((req, res) => {
		server.requests.unshift({
			time: new Date().getTime(),
			ip: res.socket.remoteAddress,
			path: req.url
		});
		localStorage.setItem("requests", JSON.stringify(server.requests));
		res.writeHead(200);
		res.end();
	}).listen(server.port);
	server.server.on("listening", () => server.online = true);
});
function savePaths() {
	localStorage.setItem("paths", JSON.stringify(server.paths));
	document.getElementById("path-cards").innerHTML = server.paths.map((path, index) => `
<div class="card px-2 m-2 d-inline-block" style="width:18rem">
	<img class=card-img-top src="${{
		static() { return getMaterialFileIcon(path.filepath) },
		code() { return ""; }
	}[path.type]()}">
	<div class=card-body>
		<h5 class="card-title font-monospace">${path.path}</h5>
		<p class=card-text>${{
			static: "Static file",
			code: "Code execution"
		}[path.type]}</p>
		<button class="btn btn-secondary" onclick="openEditor(${index})" data-bs-toggle=modal data-bs-target=#edit-path-modal>Edit</button>
	</div>
</div>
`).join("");
}
exposeInMainWorld("stopServer", () => {
	server.online = null;
	server.server.close(() => void(server.online = false));
});
exposeInMainWorld("loadPortToChangingInput", () => document.getElementById("edit-port-input").value = server.port);
exposeInMainWorld("savePort", () => {
	server.port = parseInt(document.getElementById("edit-port-input").value);
	localStorage.setItem("port", server.port);
});
exposeInMainWorld("createNewPath", () => {
	const path = {
		path: "/" + document.getElementById("new-path-path").value,
		type: document.querySelector("[name=new-path-type]:checked").getAttribute("data-value")
	};
	server.paths.push(path);
	savePaths();
});
exposeInMainWorld("openEditor", index => {
	document.getElementById("save-path-btn").setAttribute("onclick", `savePath(${index})`);
	document.getElementById("delete-path-btn").setAttribute("onclick", `deletePath(${index})`);
	if (server.paths[index].type == "static") {
		document.getElementById("edit-static-path-dialog").classList.remove("d-none");
		document.getElementById("edit-code-path-dialog").classList.add("d-none");
		document.getElementById("edit-static-path-filepath").value = server.paths[index].filepath ?? "";
	}
	else {
		document.getElementById("edit-static-path-dialog").classList.add("d-none");
		document.getElementById("edit-code-path-dialog").classList.remove("d-none");
	}
});
exposeInMainWorld("deletePath", index => {
	if (document.getElementById("delete-path-btn").innerText == "Delete") {
		setTimeout(() => {
			document.getElementById("delete-path-btn").innerText = "Confirm delete";
			document.getElementById("delete-path-btn").setAttribute("data-bs-dismiss", "modal");
		}, 100);
		setTimeout(() => {
			document.getElementById("delete-path-btn").innerText = "Delete";
			document.getElementById("delete-path-btn").removeAttribute("data-bs-dismiss");
		}, 1000);
	}
	else {
		server.paths.splice(index, 1);
		savePaths();
	}
});
exposeInMainWorld("savePath", index => {
	server.paths[index].filepath = document.getElementById("edit-static-path-filepath").value;
	savePaths();
});
exposeInMainWorld("chooseStaticPathFilepath", () => {
	ipcRenderer.once("path-dialog-finish", (_event, path) => {
		if (path) {
			document.getElementById("edit-static-path-filepath").value = path;
		}
	});
	ipcRenderer.send("open-dialog", {
		title: "Select filepath",
		defaultPath: document.getElementById("edit-static-path-filepath").value,
		buttonLabel: "Select",
		filters: [{name: "File", extensions: ["*"]}],
		properties: ["openFile", "dontAddToRecent"]
	});
});