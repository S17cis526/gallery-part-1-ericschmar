"use strict";

/**
 * server.js
 * This file defines the server for a
 * simple photo gallery web app.
 */
var http = require('http')
var url = require('url')
var fs = require('fs')
var port = 3000
var stylesheet = fs.readFileSync('gallery.css')
var imageNames = ['ace.jpg', 'bubble.jpg', 'chess.jpg', 'fern.jpg', 'mobile,jpg']

var config = JSON.parse(fs.readFileSync('config.json'))

function getImageNames(callback) {
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


function buildGallery(imageTags) {
    var html = '<!doctype HTML>'
    html += '<head>'
    html += '   <title>' + config.title + '</title>'
    html += '   <link href="gallery.css" rel="stylesheet" type="text/css">'
    html += '</head>'
    html += '<body>'
    html += '   <h1>' + config.title + '</h1>'
    html += '     <form>'
    html += '      <form action="">'
    html += '      <input type="text" name="title">'
    html += '      <input type="submit" value="Change Gallery Title">'
    html += '    </form>'
    html += imageNamesToTags(imageTags).join('')
    html += '    <form action="" method="post" enctype="multipart/form-data">'
    html += '       <input type="file" name="image">'
    html += '       <input type="submit" value="Upload Image">'
    html += '    </form'
    html += '   <h1>Hello.</h1>'
    html += '   Time is ' + Date.now()
    html += '</body>'
    return html
}

function serveGallery(req, res) {
    getImageNames((err, imageNames) => {
        if (err) {
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

function uploadPicture(req, res){
  var body = ''
  req.on('error', () => {
    res.statusCode = 500
    res.statusMessage = 'I must commit sudoku'
    res.end()
  })

  req.on('data', (data) => {
    body += data
  })

  req.on('end', () => {
    fs.writeFile('fileName', body, (err) => {
      if(err) {
        console.error(err)
        res.statusCode = 500
        res.end()
        return
      }
      serveGallery(req, res)
    })
  })
}

var server = http.createServer((req, res) => {
    var urlparse = url.parse(req.url)
    // at most, the url should have two parts -
    // a resource and a query string

    if (urlparse.query) {
        // . any number of chars and number of times
        // $ is end of string & means another KVP is coming
        var matches = /title=(.+)($|&)/.exec(urlparse.query)
        if (matches && matches[1]) {
            config.title = decodeURIComponent(matches[1])
            fs.writeFile('config.json', JSON.stringify(config))
        }

    }

    switch (urlparse.pathname) {
        case "/":
        case "/gallery":
            if(req.method == 'GET'){
              serveGallery(req, res)
            }
            else if(req.method == 'POST'){
              uploadPicture(req, res)
            }
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
