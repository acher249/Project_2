var db = require("../models");
const https = require("https");
const querystring = require('querystring');

require("dotenv").config();

module.exports = function(app) {
  // Load index page
  app.get("/", function(req, res) {
    db.Example.findAll({}).then(function(dbExamples) {
      res.render("index", {
        msg: "Welcome!",
        examples: dbExamples
      });
    });
  });

  // Load example page and pass in an example by id
  app.get("/example/:id", function(req, res) {
    db.Example.findOne({ where: { id: req.params.id } }).then(function(dbExample) {
      res.render("example", {
        example: dbExample
      });
    });
  });

  app.get("/spotify", function(req, res) {
    var state = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    //generates random key (Spotify calls it State)
    for (var i = 0; i < 16; i++) {
      state += characters.charAt(Math.floor(Math.random() * 16));
    }

    //stores local cookie with key auth_spotify_id and value of state
    res.cookie("auth_spotify_id", state);

    var spotify = 'https://accounts.spotify.com/authorize/?client_id=' + process.env.SPOTIFY_ID
    + '&response_type=code&redirect_uri=https%3A%2F%2Flit-citadel-55735.herokuapp.com%2Fcallback&scope=user-top-read&show_dialog=true&state=' + state;

    res.redirect(spotify);
  });

  app.get("/callback", function(req, res) {
    var code = req.query.code || null;
    var state = req.query.state || null; //the state we generated on the /spotify page
    var cookie = req.cookies ? req.cookies["auth_spotify_id"] : null;

    //checks if the user is on the same browser (security)
    if(state === null || state !== cookie) {
      res.redirect("/#INTERNAL_SERVER_ERROR");
    } else {
      res.clearCookie("auth_spotify_id");

      //POST PARAMETERS (BODY)
      const postData = querystring.stringify({
        "code": code.toString(),
        "redirect_uri": "https://lit-citadel-55735.herokuapp.com/callback",
        "grant_type": "authorization_code",
        "client_id": process.env.SPOTIFY_ID,
        "client_secret": process.env.SPOTIFY_SECRET
      });

      //POST request - Making It
      var request = https.request({
        hostname: 'accounts.spotify.com',
        path: '/api/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        json: true
      }, (response) => {
        if(response.statusCode === 200) {
          response.setEncoding('utf8'); //Not Sure

          response.on('data', (chunk) => {
            var data = JSON.parse(chunk);
            console.log(data);

            var requestTwo = https.request({
              hostname: 'api.spotify.com',
              path: '/v1/me/top/artists',
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + data.access_token
              },
              json: true
            }, (callback) => {

              var rawData = '';
              
              callback.on('data', (chunk) => {
                rawData += chunk;
                res.send("Hopefully this Works!");
              });

              callback.on('end', (chunk) => {
                console.log("HELLO WORLD" + JSON.parse(rawData));
              });
            });

            requestTwo.end();
          });

        } else {
          res.render("404");
        }
      });

      //POST Request - Writing the Data / Making the Call
      request.write(postData);
      //Closing Off the Request
      request.end();
    }

  });

  // Render 404 page for any unmatched routes
  app.get("*", function(req, res) {
    res.render("404");
  });

};
