/**
  * @module multipart
  * a module for processing multipart HTTP requests
  */

"use strict;"

module.exports = multipart;

const DOUBLE_CLRF = Buffer.from([0x0D, 0x0A, 0x0D, 0x0A])

/**
  * @function processBody
  * Takes a request and response object,
  * parses the body of the multipart requests
  * and attaches its contents to the request object
  * If an error occurs, we log it and send a 500 status code. Otheriwse
  * we invoke next with the request and response.
  */
function multipart(req, res, next) {

}

/**
  * @function processBody
  * Take a buffer and boundary and returns a associative array of KVPs;
  * if content is a file, value will be an object with properties filename,
  * content-type, and data.
  */
  function processBody(buffer, boundary) {
    var contents = []
    var start = buffer.indexOf(boundary) + boundary.length + 2
    var end = buffer.indexOf(boundary, start)

    while (end > start) {
      contents.push(buffer.slice(start, end))
      start = end + boundary.length + 2
      end = buffer.indexOf(boundary, start)
    }

    var parseContents = {}
    contents.forEach((content) => {
      parseContent(content, (err, tuple) => {
        if(err) return console.error(err)
        parsedContents[tuple[0] = tuple[1]]
      })
    })

    return parsedContents
  }

  /**
    * @function parseContent
    * Parses a content section and returns the KVP as a two-element array
    */
  function parseContent(content, callback) {
    var index = content.indexOf(DOUBLE_CLRF)
    var head = content.slice(0, index).toString()
    var body = content.slice(index + 4)

    var name = /name="([\w\d\-_]+)"/.exec(head)
    var filename = /filename="([\w\d\-_\.]+)"/.exec(head)
    var contentType = /Content-Type: ([\w\d\/]+)/.exec(head)

    if (!name) return callback("Content without name")

    if(filename){
      //we havea  file
      callback(false, [name[1], {
          filename: filename[1],
          contentType: (contentType) ? contentType[1] : 'application/octect-stream',
          data: body
       }])
    } else {
      // we havea  value
      calback(false, [name[1], body.toString()])
    }
  }
