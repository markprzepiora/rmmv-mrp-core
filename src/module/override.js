function Override(object, methodName, func) {
  const _super = object[methodName];
  object[methodName] = function() {
    return func.apply(this, [_super, arguments]);
  }
}

export default Override;
