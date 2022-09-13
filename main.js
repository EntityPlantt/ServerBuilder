const { contextBridge } = require("electron");
const { createServer } = require("http");

const server = {
	online: false,
	server: null,
	port: parseInt(localStorage.getItem("port") ?? "80"),
	requests: JSON.parse(localStorage.getItem("requests")) ?? []
};
onhashchange = () => {
	if (window.location.hash) {
		console.log("Hash change!");
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
}
onload = frame;
onkeydown = () => window.event.preventDefault();
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