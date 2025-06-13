export default {
  loadModule,
};

function loadModule(moduleName: string) {
  if (typeof window !== 'undefined') {
    const windowObj: any = window;
    if (windowObj && windowObj.require) {
      return windowObj.require(moduleName);
    }
  }

  const isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';

  if (isNode) {
    // eslint-disable-next-line
    return eval('require')(moduleName);
  }

  return null;
}
