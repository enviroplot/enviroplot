export default { loadModule }

function loadModule(name: string) {
  if (typeof window !== 'undefined' && (window as any).require)
    return (window as any).require(name)
  const isNode =
    Object.prototype.toString.call(
      typeof process !== 'undefined' ? process : 0,
    ) === '[object process]'
  if (isNode) return require(name)
  return null
}
