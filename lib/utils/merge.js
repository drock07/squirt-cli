

module.exports = function merge (target, ...sources) {
  return Object.assign({}, target, ...sources.map(x => {
    return Object.entries(x)
      .filter(([key, value]) => value !== undefined)
      .reduce((obj, [key, value]) => (obj[key] = value, obj), {})
  }))
}
