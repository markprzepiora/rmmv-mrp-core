// lowercase command -> function to be run
var pluginCommands = {};

export function add(nameOrNames, fn) {
  if (nameOrNames.constructor !== Array) {
    nameOrNames = [nameOrNames];
  }

  nameOrNames.forEach(name => {
    pluginCommands[name.toLowerCase()] = fn;
  });
};

export function install() {
  (function(pluginCommand) {
    Game_Interpreter.prototype.pluginCommand = function (name, args) {
      pluginCommand.apply(this, arguments);
      var command = pluginCommands[name.toLowerCase()];

      command && command.apply(this, arguments);
    };
  })(Game_Interpreter.prototype.pluginCommand);
};
