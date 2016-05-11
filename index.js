var express = require('express');
var app = express();

app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === "blah_kevin_blah") {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');    
  }
});
