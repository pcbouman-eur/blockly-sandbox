Blockly.Blocks['add_to_list'] = {
  init: function() {
    this.appendValueInput("element")
        .appendField("Add element");
    this.appendValueInput("list")
        .setCheck("Array")
        .appendField("to list");
    this.appendDummyInput();
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('');
    this.setColour(160);
  }
};

Blockly.JavaScript['add_to_list'] = function(block) {
  var value_list = Blockly.JavaScript.valueToCode(block, 'list', Blockly.JavaScript.ORDER_ATOMIC);
  var value_element = Blockly.JavaScript.valueToCode(block, 'element', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = value_list+'.push('+value_element+');\n';
  return code;
};

Blockly.Blocks['output'] = {
  init: function() {
    this.appendValueInput("data")
        .setCheck(null)
        .appendField("Output");
    this.setPreviousStatement(true, null);
    this.setColour(260);
    this.setTooltip('');
  }
};

Blockly.JavaScript['output'] = function(block) {
  var value_data = Blockly.JavaScript.valueToCode(block, 'data', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'output('+value_data+');\n';
  return code;
};

Blockly.Blocks['input'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Input data");
    this.setOutput(true, null);
    this.setColour(160);
    this.setTooltip('');
  }
};

Blockly.JavaScript['input'] = function(block) {
  var code = 'input';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['type_of'] = {
		  init: function() {
		    this.appendValueInput("expr")
		        .setCheck(null)
		        .appendField("print type of");
		    this.setColour(180);
		    this.setPreviousStatement(true, null);
		    this.setNextStatement(true, null);
		 this.setTooltip("");
		 this.setHelpUrl("");
		  }
		};

Blockly.JavaScript['type_of'] = function(block) {
	  var value_expr = Blockly.JavaScript.valueToCode(block, 'expr', Blockly.JavaScript.ORDER_ATOMIC);
	  var code = 'alert(\'The type is \'+typeof('+value_expr+'));\n';
	  return code;
	};
