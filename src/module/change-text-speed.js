export function install() {
  const _processCharacter = Window_Base.prototype.processCharacter;
  Window_Base.prototype.processCharacter = function(textState) {
      if (typeof textState.slowdown === 'undefined') {
          return _processCharacter.apply(this, arguments);
      }

      if (typeof textState.slowdownCounter === 'undefined') {
          textState.slowdownCounter = 0;
      }

      if (textState.slowdownCounter++ >= textState.slowdown) {
          textState.slowdownCounter = 0;
          return _processCharacter.apply(this, arguments);
      }
  };

  const _processEscapeCharacter = Window_Message.prototype.processEscapeCharacter;
  Window_Message.prototype.processEscapeCharacter = function(code, textState) {
    if (code === 'S') {
      const slowdown = Number(this.obtainEscapeParam(textState));
      textState.slowdown = slowdown ? slowdown : null;
    } else {
      _processEscapeCharacter.apply(this, arguments);
    }
  };
}
