"use strict";

/**
 * server.js
 * This file defines the server for a
 * simple photo gallery web app.
 */
var http = require('http')
var fs = require('fs')
var port = 3000
var stylesheet = fs.readFileSync('gallery.css')
var imageNames = ['ace.jpg', 'bubble.jpg', 'chess.jpg', 'fern.jpg', 'mobile,jpg']

function getImageNames(callback){
  fs.readdir('images/', (err, fileNames) => {
    if (err) callback(err, undefined)
    else callback(false, fileNames)
  })
}

function serveImage(filename, req, res) {
    fs.readFile('images/' + filename, (err, body) => {
        if (err) {
            console.error(err)
            res.statusCode = 404
            res.statusMessage = "Resource Not Found"
            res.end()
            return
        }
        res.setHeader("Content-Type", "image/jpeg")
        res.end(body)
    })
}

function imageNamesToTags(fileNames) {
  var p = fileNames.map((name) => {
      return `<img src="${name}" alt="${name}">`
  })
  return p
}


function buildGallery(imageTags){
  var html = '<!doctype HTML>'
      html += '<head>'
      html += '   <title>Gallery</title>'
      html += '   <link href="gallery.css" rel="stylesheet" type="text/css">'
      html += '</head>'
      html += '<body>'
      html += '   <h1>Gallery.</h1>'
      html += imageNamesToTags(imageTags).join('')
      html += '   <h1>Hello.</h1>'
      html += '   Time is ' + Date.now()
      html += '</body>'
  return html
}

function serveGallery(req, res) {
  getImageNames((err, imageNames) => {
    if(err) {
      console.error(err)
      res.statusCode = 500
      res.statusMessage = 'Server Error'
      res.end()
      return
    }
    res.setHeader('Content-Type', 'text/html')
    res.end(buildGallery(imageNames))
  })
}

var server = http.createServer((req, res) => {
    switch (req.url) {
        case "/":
        case "/gallery":
            serveGallery(req, res)
            break
        case "/gallery.css":
            res.setHeader('Content-Type', 'text/css')
            res.end(stylesheet)
            break
        default:
            serveImage(req.url, req, res)
    }
})

server.listen(port, () => {
    console.log("Listening on port " + port)
})
