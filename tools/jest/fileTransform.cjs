const path = require("path");

module.exports = {
  process(source, filename) {
    return `module.exports = ${JSON.stringify(path.basename(filename))};`;
  },
};
// Jest executes JavaScript in a simulated browser environment. 
// It needs help handling imports of files that aren't JavaScript, such as stylesheets and images
