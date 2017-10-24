
function getSVG(workspace) {
	workspace.highlightBlock('');
	var cp = workspace.svgBlockCanvas_.cloneNode(true);
	cp.removeAttribute("width");
	cp.removeAttribute("height");
	cp.removeAttribute("transform");
	//It is important to create this element in the SVG namespace rather than the XHTML namespace
	var styleElem = document.createElementNS("http://www.w3.org/2000/svg", "style");
	styleElem.textContent = Blockly.Css.CONTENT.join('');
	cp.insertBefore(styleElem, cp.firstChild);
	
	//Creates a complete SVG document with the correct bounds (it is necessary to get the viewbox right, in the case of negative offsets)
	var bbox = workspace.svgBlockCanvas_.getBBox();
	var xml = new XMLSerializer().serializeToString(cp);
	
	
	
	xml = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+bbox.width+'" height="'+bbox.height+'" viewBox="' + bbox.x + ' ' + bbox.y + ' '  + bbox.width + ' ' + bbox.height + '"><rect width="100%" height="100%" fill="white"></rect>'+xml+'</svg>';
	return xml;
}

function download(filename, text) {
	  var element = document.createElement('a');
	  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	  element.setAttribute('download', filename);

	  element.style.display = 'none';
	  document.body.appendChild(element);

	  element.click();

	  document.body.removeChild(element);
}

function downloadSVG(workspace) {
	var filedescr = prompt('Please type a name for the file');
	if (filedescr != null)
	{
		var filename = filedescr+'.svg';
		var xml = getSVG(workspace);
		download(filename, xml);
	}
}