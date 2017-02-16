/** @module template
  */

module.exports = {
  render: render,
  loadDir: loadDir
}

var fs = require('fs')
var templates = {}

/** @function loadDir
* Loads a directory of templates
* @param {string} directory - the dir to loadDir
*/
function loadDir(directory) {
  var dir = fs.readdirSync(directory)
  dir.forEach((file) => {
    var path = directory + '/' + file
    var stats = fs.statSync(path)
    if(stats.isFile()) {
      templates[file] = fs.readFileSync(path).toString()
    }
  })
}

/** @function render
  * renders a tenplate with embedded js
  * @param {string} templateName - the template to render
  * @param {...}
  */
function render(templateName, context) {
  return templates[templateName].replace(/<%=(.+)%>/g, (match, js) => {
    return eval("var context = " + JSON.stringify(context) + ";" + js)
  })
  return html
}
