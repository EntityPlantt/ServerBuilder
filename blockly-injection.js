const Blockly = require("blockly");
const { readFileSync } = require("original-fs");
var workspace;
function injectBlockly(domElement, workspaceXml = "<xml></xml>") {
	if (workspace) {
		deleteBlockly(domElement);
	}
	workspace = Blockly.inject(domElement, {
		toolbox: readFileSync("code-toolbox.xml", "utf8"),
		sounds: false,
		renderer: "thrasos"
	});
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
module.exports = { injectBlockly, getBlocklyXml, generateCode, deleteBlockly };