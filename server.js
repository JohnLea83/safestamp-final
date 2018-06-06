const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Mailjet = require('node-mailjet');
const cors = require('cors');
const dotenv = require('dotenv').config();

// const forceSSL = function() {
//   return function (req, res, next) {
//     if (req.headers['x-forward-proto'] !== 'https') {
//       return res.redirect(
//         ['https://', req.get('Host'), req.url].join('')
//       );
//     }
//     next();
//   };
// };
// app.use(forceSSL());

const app = express();

app.use(express.static(__dirname + '/dist/SafeStamp-Final'));

app.use(bodyParser.json()); // support json encoded bodies

var corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.options('*', cors(corsOptions));

// the "index" route, which serves the Angular app
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/dist/SafeStamp-Final/index.html'));
});

// POST endpoint for sending email
app.post('/api/email', cors(corsOptions), function (req, res) {
  // TODO: get message from req.body
  const request = Mailjet
    .connect(process.env.PUBLIC_KEY, process.env.PRIVATE_KEY)
    .post("send", {'version': 'v3.1'})
    .request({
      "Messages":[
        {
          "From": {
                  "Email": "Matt@SafeStamp.com",
                  "Name": "Matt McGuire"
          },
          "To": [ 
                  {
                    "Email": req.body.email,
                    "Name": req.body.name
                  }
          ],
          "Bcc": [
                  {
                    "Email": "Matt@SafeStamp.com",
                    "Name": "Matt McGuire"
                  },
                  {
                    "Email": "jl@johnlea.design",
                    "Name": "John Lea"
                  }
          ],
          "Subject": "Thank You For Contacting SafeStamp™!",
          "Text-part": "Thanks so much for reaching out, " + req.body.name + ". I'll be contacting you as soon as I can regarding your " + req.body.drop2 + " request."
        }
      ]
    })
    .then(response => {
      res.json({
        success: true,
        error: null
      });
    })
    .catch(err => {
      // TODO: Look into log4js
      console.error(err.ErrorMessage);
      // TODO: Respond with some error in JSON and set a 500 status
      res.status(500);
      res.json({
        success: false,
        error: 'Server error'
      });
    });
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// HTTP listener
app.listen(process.env.PORT || 8080);

module.exports = app;
