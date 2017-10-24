var workspace;

var saveInterval = 5000;
var speed = 5;
var pbId = 'runprogress';

var input_json;
var answer_json;
var output_data;

var goal_reached = false;

Blockly.JavaScript.addReservedWords('highlightBlock');

function getSpeed()
{
	var curSpeed = maxSpeed - $("#speed").value();
}

function init()
{
	var maxblocks = Number.parseInt(document.getElementById('maxblocks').value);
	
	workspace = Blockly.inject('blocks', {toolbox: document.getElementById('toolbox'),
		trashcan: true, sounds: false, media: ''});

	hljs.initHighlightingOnLoad();

	$("#io").tabs();

	$('#'+pbId).progressbar({ value : 0 });

	$("#run").button().click(performRun);
    $("#exportImg").button();	
}

var running = false;

function performRun(event) {
	
	if (running)
	{
		running = false;
		return;
	}
	
	$('#io').tabs("option", "active", 2);		
	
	//$('#run').button("disable");
	$('#run').button({ "label" : "Stop"});
	running = true;
	
	$('.incorrect, .correct').hide();
	
	Blockly.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
	var rawCodeHL = Blockly.JavaScript.workspaceToCode(workspace);
	Blockly.JavaScript.STATEMENT_PREFIX = '';
	var rawCode = Blockly.JavaScript.workspaceToCode(workspace);
	var varList = [];
	if (rawCode.substring(0,4) == 'var '){
		varList = rawCode.substring(4,rawCode.indexOf("\n")-1).split(", ");
		assignCode = '\n';
		for (var i in varList) {
			var vname = varList[i];
			assignCode += vname+' = \'NO_VALUE_ASSIGNED\';\n';
		}
		var rawIndex = rawCodeHL.indexOf("\n");
		rawCodeHL = rawCodeHL.substring(0,rawIndex) + assignCode + rawCodeHL.substring(rawIndex);
	}
	var displayCode = rawCode;
	var runcode = rawCodeHL +'\nhighlightBlock(\'\');\n' + outputCode(varList);
	
	workspace.traceOn(true);
	
	$("#printlog").empty();
	$("#code").html('<pre><code class="javascript">'+displayCode+'</code></pre>');
	$("pre code").each(function(i, block){ hljs.highlightBlock(block); });
	$('#'+pbId).progressbar({ value: false });
	$('#output').html('');
	var myInterpreter = new Interpreter(runcode, initApi);
	goal_reached = false;
	$(".correct").hide();
	$(".incorrect").hide();
	function nextStep()
	{
		var step = false;
		if (running)
		{
			try
			{
				step = myInterpreter.step();
			}
			catch(err)
			{
				console.log(err);
				if (err.toString().startsWith('Unknown identifier:'))
				{
					var varname = err.toString().substring(20);
					alert('While executing your blocks the variable "'+varname+
							'" was expected to contain a value, but nothing was found.');
				}
				else
				{
					alert('Something went wrong while executing your blocks.'
							   +'\nThe error that occured was:\n  "'+err+'"');
				}
			}
		}
		if (step)
		{
			window.setTimeout(nextStep, speed);
		}
		else
		{
			$('#'+pbId).progressbar({ value: 100 });
			highlightBlock('');
			workspace.traceOn(false);
			//$("#run").button("enable");
			$("#run").button({"label" : "Run"});
			running = false;
			$(".container-top").scrollTop(function() { return this.scrollHeight; });
		}
	}
	nextStep();
}

function initApi(interpreter, scope)
{
	  // Add an API function for the alert() block.
	  var wrapper = function(data) {
		  output_data = strip(data);
		  $('#output').html(displayEnv(output_data));
		  $('#io').tabs({'active' : 0 });
		  goal_reached = true;
	  };
	  interpreter.setProperty(scope, 'returnOutput',
	      interpreter.createNativeFunction(wrapper));
	  
	  wrapper = function(id) {
		    id = id ? id.toString() : '';
		    highlightBlock(id);
		  };
	  interpreter.setProperty(scope, 'highlightBlock',
		      interpreter.createNativeFunction(wrapper));
	  
	  wrapper = function(text) {
		    text = text ? text.toString() : '';
		    $('#printlog').append('<li><pre>'+text+'</pre></li>');
		    return interpreter.createPrimitive(alert(text));
		  };
	  interpreter.setProperty(scope, 'alert',
	      interpreter.createNativeFunction(wrapper));

		  // Add an API function for the prompt() block.
	  wrapper = function(text) {
	    text = text ? text.toString() : '';
	    return interpreter.createPrimitive(prompt(text));
	  };
	  interpreter.setProperty(scope, 'prompt',
	      interpreter.createNativeFunction(wrapper));
}

function displayEnv(data)
{
	var res = '<ul class="js-env">'
	for (var i in data)
	{
		res += '<li><div>A variable with name <span class="varname">'+i+'</span> which holds ';
		res += makehtml(data[i]);
		res += '</div></li>';
	}
	res += '</ul>';
	return res;
}

function outputCode(varList)
{
	var res = 'result = {};\n';
	for (var key in varList)
	{
		var varname = varList[key];
		res += 'var tmp = eval(\''+varname+'\');\n'
		res += 'result[\''+varname+'\'] = tmp;\n';
	}
	res += 'returnOutput(result);';
	return res;
}

function envToJS(data)
{
	var res = '';
	for (var key in data)
	{
		res += 'var '+key+' = ';
		res += JSON.stringify(data[key]);
		res += ';\n';
	}
	return res;
}

function makehtml(data)
{
	if (typeof data == 'string')
	{
		return 'a string "<span class="string">'+data+'</span>"';
	}
	else if (typeof data == 'number')
	{
		return 'a number <span class="number">'+data+'</span>';
	}
	else if (typeof data == 'boolean')
	{
		return 'a boolean <span class="boolean">'+data+'</span>';
	}
	else if ($.isArray(data))
	{
		var row1 = '';
		var row2 = '';
		for (var i=0; i < data.length; i++)
		{
			row1 += '<td class="list-index">'+(i+1)+'</td>';
			row2 += '<td class="list-value">'+makehtml(data[i])+'</td>';
		}
		var res = 'a list <table class="list-table"><tr class="list-indices"><td class="list-rowname">Position</td>';
		res += row1;
		res += '</tr><tr class="list-values"><td class="list-rowname">Value</td>'+row2+'</tr></table>';
		return res;
	}
	else if (typeof data == 'function')
	{
		return 'a function';
	}
	else
	{
		var row1 = '';
		var row2 = '';
		for (var i in data)
		{
			row1 += '<td class="object-prop">'+i+'</td>';
			row2 += '<td class="object-value">'+makehtml(data[i])+'</td>';
		}
		var res = 'an object <table class="object-table"><tr class="object-props"><td class="object-rowname">Property</td>';
		res += row1;
		res += '</tr><tr class="object-values"><td class="object-rowname">Value</td>';
		res += row2;
		res += '</tr></table>';
		return res;
	}
}

function strip(data)
{
	if (data.type == 'object' && typeof data.length != 'undefined')
	{
		var res = [];
		for (var key in data.properties)
		{
			res.push(strip(data.properties[key]));
		}
		return res;
	}
	if (data.type == 'object')
	{
		var res = {};
		for (var key in data.properties)
		{
			res[key] = strip(data.properties[key]);
		}
		return res;
	}
	if (data.type == 'number')
	{
		return data.toNumber();
	}
	if (data.type == 'boolean')
	{
		return data.toBoolean();
	}
	if (data.type == 'string')
	{
		return data.toString();
	}
}

function highlightBlock(id) {
	  workspace.highlightBlock(id);
}
