var express = require('express');
var app = express();

app.set('port', Number(process.env.PORT || 8080));

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
