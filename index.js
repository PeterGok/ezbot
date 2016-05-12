var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

app.use(bodyParser.json());

var verify_token = 'blah_kevin_blah';
var token = "EAADqBHxn6U4BAACrC2jZAEtfCG0I9bSYnMJQyWlXAj1WkH9FTnIvCDSN1AEQZCF6MWEV18SbkvoofPJJUuXCgZAVlRy5sWZBe8M4OiULqBTXqsXM7iDbEXE3kuRZB9jjDTLA5Mjft8WXo4IKobdvnQ3M8CAhCXsnMZCG5XzYm5PHQM8YkyvbqOJeoZBvbf3NKIZD";

console.log("hello");

var ConversationState = {
  BEFORE: 0,
  PROMPT: 1,
  RESPONDED_AVAILABLE: 2,
  RESPONDED_NOT: 3,
  PROMPT_SIGNUP: 4,
  RESPONDED: 5,
  GOODBYE: 6
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
};

function isYes(text) {
  if (text.toLowerCase() == "yes") {
    return true;
  }
  return false;
};

function verifyAddress(address) {
  if (address == "123 far away street") {
    return AddressType.NOT_SERVICEABLE;
  }
  return AddressType.SERVICEABLE;
};

Conversation.prototype.onMessage = function(event) {
  var sender = event.sender.id;

  if (!event.message || !event.message.text) {
    return;
  }

  if (this.state == ConversationState.BEFORE) {
    sendTextMessage(sender, "Hey, we have 6 gardeners servicing your neighbourhood next week. Interested in a free quote for your property? Respond back with your address.");
    this.state = ConversationState.PROMPT;
  } else if (this.state == ConversationState.PROMPT) {
    var address = event.message.text;
    var addressType = verifyAddress(address);

    if (addressType == AddressType.INVALID) {
      sendTextMessage(sender, "Sorry, that's not a valid address, please try again.");
    } else if (addressType == AddressType.NOT_SERVICEABLE) {
      sendTextMessage(sender, "Sorry, we don't currently service that area, but we are hoping to roll out soon! Thanks, Bye!");
      this.state = ConversationState.RESPONDED_NOT;
      conversations[sender] = null;
    } else {
      sendTextMessage(sender, "Thanks. We're using satellite imagery for your property to give you a customized quote.");
      setTimeout(function() { sendTextMessage(sender, "Depending on whether you want weekly or bi weekly service we can service your property for $15/week or $23 every two weeks");
      setTimeout(function() { sendTextMessage(sender, "This will include, hedging, lawn mowing, pruning, and blowing.");
      setTimeout(function() { sendTextMessage(sender, "Additionally we offer dog waste pickup and weed spraying (with roundup) for an extra charge.");
      setTimeout(function() { sendTextMessage(sender, "Would you like to sign up?"); }, 3000); }, 800); }, 800); }, 3500);
      this.state = ConversationState.RESPONDED_AVAILABLE;
    }
  } else if (this.state = ConversationState.RESPONDED_AVAILABLE) {
    var text = event.message.text;
    var isYesAns = isYes(text);

    if (isYesAns) {
      sendTextMessage(sender, "Awesome! We can't wait to get you started. Sign up below:");
      setTimeout(function() { sendTextMessage(sender, "www.ezhome.com");}, 300);
    } else {
      sendTextMessage(sender, "Thanks, bye bye!");
      conversations[sender] = null;
    }
  } else if (this.state == ConversationState.RESPONDED) {
    sendTextMessage(sender, "Bye!");
    conversations[sender] = null;
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
          conversations[sender] = new Conversation();
        }

        conversations[sender].onMessage(event);
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
