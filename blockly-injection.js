const { readFileSync } = require("original-fs");
var workspace, Blockly;
function passBlockly(blockly) {
	Blockly = blockly;
}
function injectBlockly(domElement) {
	if (workspace) {
		deleteBlockly(domElement);
	}
	workspace = Blockly.inject(domElement, {
		toolbox: readFileSync("code-toolbox.xml", "utf8"),
		sounds: false,
		renderer: "thrasos"
	});
	Blockly.svgResize(workspace);
}
function setBlocklyXml(workspaceXml) {
	Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(workspaceXml), workspace);
}
function getBlocklyXml() {
	return String(Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace)));
}
function generateCode() {
	return String(Blockly.JavaScript.workspaceToCode(workspace));
}
function deleteBlockly(domElement) {
	workspace.dispose();
	domElement.innerHTML = "";
}
function workspaceToSvg() {
	canvas = workspace.svgBlockCanvas_.cloneNode(true);
	if (canvas.children.length) {
		canvas.removeAttribute("transform");
		var css = `<defs><style type="text/css" xmlns="http://www.w3.org/1999/xhtml"><![CDATA[${Blockly.Css.CONTENT.join("")}]]></style></defs>`;
		var bbox = document.getElementsByClassName("blocklyBlockCanvas")[0].getBBox();
		var content = new XMLSerializer().serializeToString(canvas);
	}
	xml = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
width="${bbox.width}" height="${bbox.height}" viewBox="${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}">
${css}">${content}</svg>`;
	return "data:image/svg+xml;base64," + btoa(xml);
}
module.exports = { injectBlockly, getBlocklyXml, generateCode, deleteBlockly, workspaceToSvg, setBlocklyXml, passBlockly };