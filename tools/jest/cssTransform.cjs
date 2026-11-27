module.exports = {
  process() {
    return "module.exports = {};";
  },
};
// Jest executes JavaScript in a simulated browser environment. 
// It needs help handling imports of files that aren't JavaScript, such as stylesheets and images
