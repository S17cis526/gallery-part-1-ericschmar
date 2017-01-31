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

function serveImage(filename, req, res) {
    fs.readFile('images/' + filename, (err, body) => {
        if (err) {
            console.error(err)
            res.statusCode = 500
            res.statusMessage = "whoopsie dasies"
            res.end("ITTTT'S WHOOPSIE")
            return
        }
        res.setHeader("Content-Type", "image/jpeg")
        res.end(body)
    })
}

var server = http.createServer((req, res) => {
    switch (req.url) {
        case "/gallery":
            var html = '<!doctype HTML>'
                html += '<head>'
                html += '   <title>Gallery</title>'
                html += '   <link href="gallery.css" rel="stylesheet" type="text/css">'
                html += '</head>'
                html += '<body>'
                html += '   <h1>Gallery.</h1>'
                html += '   <img src="ace.jpg" alt="a fishing ace at work">'
                html += '   <h1>Hello.</h1>'
                html += '   Time is ' + Date.now()
                html += '</body>'
            res.setHeader('Content-Type', 'text/html')
            res.end(html)
            break
        case "/chess":
            serveImage('chess.jpg', req, res)
            break
        case "/fern/":
        case "/fern.jpg":
        case "/fern/jpeg":
        case "/fern":
            serveImage('fern.jpg', req, res)
            break
        case "/ace.jpg":
            serveImage('ace.jpg', req, res)
            break
        case "/gallery.css":
            res.setHeader('Content-Type', 'text/css')
            res.end(stylesheet)
            break
        default:
            res.statusCode = 404
            res.statusMessage = "Not found"
            res.end()
    }
})

server.listen(port, () => {
    console.log("Listening on port " + port)
})
