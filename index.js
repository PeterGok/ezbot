var express = require('express');
var app = express();

console.log("hello");

app.set('port', Number(process.env.PORT || 8080));

app.post('/webhook', function(req, res) {
  console.log("hell");
  console.log(req.body);
  console.log(req.body.entry[0].messaging);
  console.log("hel");
});

app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === 'blah_kevin_blah') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');    
  }
});

app.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
