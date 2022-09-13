const { contextBridge } = require("electron");
const { createServer } = require("http");

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
	if (server.online) {
		document.querySelector("#show-status .text-success").classList.remove("d-none");
		document.querySelector("#show-status .text-danger").classList.add("d-none");
		document.getElementById("start-server-btn").classList.add("d-none");
		document.getElementById("stop-server-btn").classList.remove("d-none");
	}
	else {
		document.querySelector("#show-status .text-success").classList.add("d-none");
		document.querySelector("#show-status .text-danger").classList.remove("d-none");
		document.getElementById("start-server-btn").classList.remove("d-none");
		document.getElementById("stop-server-btn").classList.add("d-none");
	}
	document.querySelector("#show-status .text-muted").classList.add("d-none");
	document.getElementById("show-server-requests").innerText = server.requests.length;
	document.getElementById("show-server-time").innerText = Date();
	document.getElementById("show-port").innerText = server.port;
	localStorage.setItem("requests", JSON.stringify(server.requests));
	localStorage.setItem("port", server.port);
	document.getElementById("server-request-list").innerHTML = server.requests.map((req, index) => `
<tr>
	<td scope=row>${server.requests.length - index}</td>
	<td class=font-monospace>${req.path}</td>
	<td class=font-monospace>${req.ip}</td>
	<td>${new Date(req.time)}</td>
</tr>
`).join("");
	document.getElementById("path-cards").innerHTML = server.paths.map(path => `
<div class="card px-2" style="width:18rem">
	<div class=card-body>
		<h5 class="card-title font-monospace">${path.path}</h5>
		<p class=card-text>${{
			static: "Static file",
			code: "Code execution"
		}[path.type]}</p>
		<button class="btn btn-secondary">Edit</button>
	</div>
</div>
`);
}
onload = frame;
contextBridge.exposeInMainWorld("resetRequests", () => {
	server.requests = [];
});
contextBridge.exposeInMainWorld("startServer", () => {
	server.server = createServer((req, res) => {
		server.requests.unshift({
			time: new Date().getTime(),
			ip: res.socket.remoteAddress,
			path: req.url
		});
		res.writeHead(200);
		res.end();
	}).listen(server.port);
	server.server.on("listening", () => server.online = true);
});
contextBridge.exposeInMainWorld("stopServer", () => {
	server.server.close(() => void(server.online = false));
});
contextBridge.exposeInMainWorld("loadPortToChangingInput", () => document.getElementById("edit-port-input").value = server.port);
contextBridge.exposeInMainWorld("savePort", () => server.port = parseInt(document.getElementById("edit-port-input").value));