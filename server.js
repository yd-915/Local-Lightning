// server.js
var express = require('express')
var cors = require('cors')
var path = require('path')
var serveStatic = require('serve-static')
var enforce = require('express-sslify')

var app = express()

/* app.get('*', function (req, res, next) {
  if (req.headers.host.slice(0, 3) !== 'www') {
    res.redirect('https://www.' + req.headers.host + req.url, 301)
  } else {
    next()
  }
}) */

app.use(enforce.HTTPS({ trustProtoHeader: true }))

app.use(cors())
app.use(serveStatic(path.join(__dirname, '/dist')))

var port = process.env.PORT || 5000
app.listen(port)
console.log('starting project at ' + port)
