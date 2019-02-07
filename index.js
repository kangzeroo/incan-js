
module.exports = function () {
  this.fn = () => "Unchanged fnA"
  return {
    fn: fn,
    setFn: (a) => {
      console.log('Changing fn to ', a)
      this.fn = a
    },
    triggerFn: (str) => {
      return this.fn
    }
  }
}()
