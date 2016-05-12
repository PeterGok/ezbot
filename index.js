var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

app.use(bodyParser.json());

var verify_token = 'blah_kevin_blah';
var token = "EAADqBHxn6U4BAN8GksPJ0fQS5GaVZA03Oc9x0Nj4OolLnGFmvfmetYA7dgXqt7jUJdogJ4ZBZAls1mw4fYZCm9lSP6hR4aPZCr9EnruhK36qA00tU4cN6RcPFsU8keSC08R3KuZATrtCnnaFVc6wz9iiWxzWE1KlozFXzWcFjdJiOrZAZBcaZAftmW8ZAFZAlSK7J0ZD";

console.log("hello");

var ConversationState = {
  BEFORE: 0,
  PROMPT: 1,
  RESPONDED_YES: 2,
  RESPONDED_NO: 3
};

var AddressType = {
  INVALID: 0,
  NOT_SERVICEABLE: 1,
  SERVICEABLE: 2
}

var conversations = {};

function Conversation (type) {
  this.state = ConversationState.BEFORE;
  this.user_address = "";
  this.valid_address = false;
}

function verifyAddress(address) {
  return AddressType.SERVICEABLE;
}

Conversation.prototype.onMessage(event) {
  var sender = event.sender.id;

  if (!event.message || !event.message.text) {
    sendTextMessage(sender, "Sorry, invalid message. Please try again.");
  }

  if (this.state == ConversationState.BEFORE) {
    text = "Hello! Intersted in a free quote for your property? Please respond back with your address.";
    this.state = ConversationState.PROMPT;
  } else if (this.state == ConversationState.PROMPT) {
    var address = event.message.text;
    var addressType = verifyAddress(address);

    if (addressType == AddressType.INVALID) {
      sendTextMessage(sender, "Sorry, that's not a valid address, please try again.");
    } else if (addressType == AddressType.NOT_SERVICEABLE) {
      sendTextMessage(sender, "Sorry, we don't currently service that area, but we are hoping to roll out soon!");
      this.state = ConversationState.RESPONDED_NO;
      conversations[sender] = null;
    } else {
      sendTextMessage(sender, "Thanks. Depending on whether you want weekly or bi weekly service we can service your property for $15/week or $23 every two weeks");
      sendTextMessage(sender, "This will include, hedging, lawn mowing, pruning, and blowing.");
      sendTextMessage(sender, "Additionally we offer dog waste pickup and weed spraying (with roundup) for an extra charge.");
      sendTextMessage(sender, "Click the link below if you would like to sign up:");
      sendTextMessage(sender, "www.ezhome.com");
      this.state = ConversationState.RESPONDED_YES;
      conversations[sender] = null;
    }
  } else {
    sendTextMessage(sender, "Please visit our website for more information: www.ezhome.com");
  }
}

app.set('port', Number(process.env.PORT || 8080));

app.get('/', function (req, res) {
  res.send('Hello World! This is the bot\'s root endpoint!');
});

app.post('/webhook/', function (req, res) {
    var messaging_events = req.body.entry[0].messaging;

    for (var i = 0; i < messaging_events.length; i++) {
        var event = req.body.entry[0].messaging[i];
        var sender = event.sender.id;

        var conversation = conversations[sender];
        if (!conversation) {
          converstions[sender] = new Conversation();
        }

        conversations[sender].onMessage(event);

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
