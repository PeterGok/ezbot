var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

app.use(bodyParser.json());

var verify_token = 'blah_kevin_blah';
var token = "EAADqBHxn6U4BAN8GksPJ0fQS5GaVZA03Oc9x0Nj4OolLnGFmvfmetYA7dgXqt7jUJdogJ4ZBZAls1mw4fYZCm9lSP6hR4aPZCr9EnruhK36qA00tU4cN6RcPFsU8keSC08R3KuZATrtCnnaFVc6wz9iiWxzWE1KlozFXzWcFjdJiOrZAZBcaZAftmW8ZAFZAlSK7J0ZD";

console.log("hello");

app.set('port', Number(process.env.PORT || 8080));

app.get('/', function (req, res) {
  res.send('Hello World! This is the bot\'s root endpoint!');
});

app.post('/webhook/', function (req, res) {

    var messaging_events = req.body.entry[0].messaging;

    for (var i = 0; i < messaging_events.length; i++) {

        var event = req.body.entry[0].messaging[i];
        var sender = event.sender.id;

        if (event.message && event.message.text) {
            var text = event.message.text;

            sendTextMessage(sender, "Echo: " + text.substring(0, 200));
        }
    }

    res.sendStatus(200);
});

app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === verify_token) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');    
  }
});

function sendTextMessage(sender, text) {

    var messageData = {
        text: text
    };

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: token},
        method: 'POST',
        json: {
            recipient: {id: sender},
            message: messageData
        }
    }, function (error, response) {

        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }

    });

}

app.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
