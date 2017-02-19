/**
 * server.js
 * This file defines the server for a
 * simple photo gallery web app.
 */
"use strict;"

/* global variables */
var multipart = require('./multipart');
var template = require('./template')
var http = require('http');
var url = require('url');
var fs = require('fs');
var port = 3000;

/* load cached files */
var config = JSON.parse(fs.readFileSync('config.json'));
var stylesheet = fs.readFileSync('gallery.css');


/* load templates */
template.loadDir('templates')

/** @function getImageNames
 * Retrieves the filenames for all images in the
 * /images directory and supplies them to the callback.
 * @param {function} callback - function that takes an
 * error and array of filenames as parameters
 */
function getImageNames(callback) {
    fs.readdir('images/', function(err, fileNames) {
        if (err) callback(err, undefined);
        else callback(false, fileNames);
    });
}

function getOneImageName(name, callback) {
  fs.readdir('images/' + name, function(err, file) {
    if(err) callback(err, undefined)
    else {
      callback(false, file)
    }
  } )
}

/** @function getChars
  * function to get the character info from json.
  * returns an object containing all the characters as an array
  */
function getChars(callback) {
  var characters = []
  fs.readdir('characters/', (err, files) => {
      if (err) callback(err, undefined)
      else {
        files.forEach((current) => {
          var curr = JSON.parse(fs.readFileSync('characters/' + current))
          characters.push(curr)
        })
        callback(false, characters)
      }
  })
}

/** @function imageNamesToTags
 * Helper function that takes an array of image
 * filenames, and returns an array of HTML img
 * tags build using those names.
 * @param {string[]} filenames - the image filenames
 * @return {string[]} an array of HTML img tags
 */
function imageNamesToTags(fileNames) {
    return fileNames.map(function(fileName) {
        return `<img src="${fileName}" alt="${fileName}">`;
    });
}

/**
 * @function buildGallery
 * A helper function to build an HTML string
 * of a gallery webpage.
 * @param {string[]} imageTags - the HTML for the individual
 * gallery images.
 */
function buildGallery(imageTags, callback) {
   getChars((err, files) => {
    if (err) {
      callback(err, undefined)
    } else {
      callback(false, template.render('gallery.html', {
        title: config.title,
        fileNames: imageTags,
        characterInfo: files
      }));
    }
  })
}

function buildSingleChar(imageTag, callback) {
  getChars((err, files) => {
    if (err) {
      callback(err, undefined)
    } else {
      callback(false, template.render('single.html', {
        title: config.title,
        fileNames: imageTag,
        characterInfo: files.filter((char) => {
          var c = imageTag.split('images/')
          if (char.Class == c[1]) return true
          else false
        })
      }));
    }
  })
}

function serveSingleChar(req, res, name) {
    res.setHeader('Content-Type', 'text/html');
    buildSingleChar('images/' + name, (err, html) => {
      if(err) {
        console.error(err);
        res.statusCode = 500;
        res.statusMessage = 'Server error';
        res.end();
        return;
      } else {
        res.end(html);
      }
    })
}


/** @function serveGallery
 * A function to serve a HTML page representing a
 * gallery of images.
 * @param {http.incomingRequest} req - the request object
 * @param {http.serverResponse} res - the response object
 */
function serveGallery(req, res) {
    getImageNames(function(err, imageNames) {
        if (err) {
            console.error(err);
            res.statusCode = 500;
            res.statusMessage = 'Server error';
            res.end();
            return;
        }
        res.setHeader('Content-Type', 'text/html');
        buildGallery(imageNames, (err, html) => {
          if(err) {
            console.error(err);
            res.statusCode = 500;
            res.statusMessage = 'Server error';
            res.end();
            return;
          } else {
            res.end(html);
          }
        })
    });
}

/** @function serveImage
 * A function to serve an image file.
 * @param {string} filename - the filename of the image
 * to serve.
 * @param {http.incomingRequest} - the request object
 * @param {http.serverResponse} - the response object
 */
function serveImage(fileName, req, res) {
    fs.readFile('images' + decodeURIComponent(fileName.substring(0, fileName.length - 1)), function(err, data) {
        if (err) {
            console.error(err);
            res.statusCode = 404;
            res.statusMessage = "Resource not found";
            res.end();
            return;
        }
        res.setHeader('Content-Type', 'image/*');
        res.end(data);
    });
}

/** @function uploadImage
 * A function to process an http POST request
 * containing an image to add to the gallery.
 * @param {http.incomingRequest} req - the request object
 * @param {http.serverResponse} res - the response object
 */
function uploadImage(req, res) {
    multipart(req, res, function(req, res) {
        // make sure an image was uploaded
        if (!req.body.image.filename) {
            console.error("No file in upload");
            res.statusCode = 400;
            res.statusMessage = "No file specified"
            res.end("No file specified");
            return;
        }
        fs.writeFile('images/' + req.body.class.toLowerCase(), req.body.image.data, function(err) {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                res.statusMessage = "Server Error";
                res.end("Server Error");
                return;
            }
        fs.writeFile('characters/' + req.body.class.toLowerCase() + ".json", buildJson(req.body.image.filename, req.body.class, req.body.description) , (err) => {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                res.statusMessage = "Server Error";
                res.end("Server Error");
                return;
            }
          })
            serveGallery(req, res);
        });
    });
}

function buildJson(path, c, script) {
  console.log(path)
  var ye = JSON.stringify({"Path": c,"Class": c,"Script": script})
  return ye
}

/** @function handleRequest
 * A function to determine what to do with
 * incoming http requests.
 * @param {http.incomingRequest} req - the incoming request object
 * @param {http.serverResponse} res - the response object
 */
function handleRequest(req, res) {
    // at most, the url should have two parts -
    // a resource and a querystring separated by a ?
    var urlParts = url.parse(req.url);

    var characters = fs.readdirSync('characters/').map((file) => {
      return file.split('.json')[0]
    })

    if (urlParts.query) {
        var matches = /title=(.+)($|&)/.exec(urlParts.query);
        if (matches && matches[1]) {
            config.title = decodeURIComponent(matches[1]);
            fs.writeFile('config.json', JSON.stringify(config));
        }
    }
    var path = urlParts.pathname.slice(1, urlParts.pathname.length)
    if (characters.indexOf(path) >= 0) {
      serveSingleChar(req, res, path)
    } else {
      switch (urlParts.pathname) {
          case '/':
          case '/gallery':
              if (req.method == 'GET') {
                  serveGallery(req, res);
              } else if (req.method == 'POST') {
                  uploadImage(req, res);
              }
              break;
          case '/gallery.css':
              res.setHeader('Content-Type', 'text/css');
              res.end(stylesheet);
              break;
          case '/Diablo-II-icon.png':
              fs.readFile('Diablo-II-icon.png', (err, data) => {
                if (err) {
                    console.error(err);
                    res.statusCode = 404;
                    res.statusMessage = "Resource not found";
                    res.end();
                    return;
                }
                res.setHeader('Content-Type', 'image/*');
                res.end(data);
              })
              break
          default:
              serveImage(req.url, req, res);
      }
    }
}

/* Create and launch the webserver */
var server = http.createServer(handleRequest);
server.listen(port, function() {
    console.log("Server is listening on port ", port);
});
