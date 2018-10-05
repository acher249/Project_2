var db = require("../models");
const https = require("https");
const querystring = require('querystring');

require("dotenv").config();

// this is what displays to the user
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
  // app.get("/example/:id", function(req, res) {
  //   db.Example.findOne({ where: { id: req.params.id } }).then(function(dbExample) {
  //     res.render("example", {
  //       example: dbExample
  //     });
  //   });
  // });

  //SPOTIFY REDIRECT - Authorization (Step 1) = Application to Spotify Authorization
  app.get("/spotify", function(req, res) {
    var state = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    //generates random key (Spotify calls it State)
    for (var i = 0; i < 16; i++) {
      state += characters.charAt(Math.floor(Math.random() * 16));
    }

    //stores local cookie with key auth_spotify_id and value of state
    res.cookie("auth_spotify_id", state);

    //Backup Code
    // var spotify = 'https://accounts.spotify.com/authorize/?client_id=' + process.env.SPOTIFY_ID
    // + '&response_type=code&redirect_uri=https%3A%2F%2Flit-citadel-55735.herokuapp.com%2Fspotify-callback&scope=user-follow-read&show_dialog=true&state=' + state;

    //Change Scope Here (Spotify API) - Current: user-follow-read

    var spotify = 'https://accounts.spotify.com/authorize/?client_id=' + process.env.SPOTIFY_ID
    + '&response_type=code&redirect_uri=https%3A%2F%2Flit-citadel-55735.herokuapp.com%2Fspotify-callback&scope=user-follow-read&show_dialog=true&state=' + state;

    res.redirect(spotify);
  });

  //SPOTIFY POST REQUEST (Spotify Authorization Step 1 Redirects to /spotify-callback)- (Step 2)
  //Spotify Authorization (Continued) to get Access_Token for user's Spotify API
  app.get("/spotify-callback", function(req, res) {
    var code = req.query.code || null;
    var state = req.query.state || null; //the state we generated on the /spotify page
    var cookie = req.cookies ? req.cookies["auth_spotify_id"] : null;

    //Checks if the User's Cookie has the same pregen State Key (Spotify Authorization - Check System)
    if(state === null || state !== cookie) {
      res.send("<H1>INTERNAL SERVER ERROR</H1>")
    } else {
      res.clearCookie("auth_spotify_id");

      //POST PARAMETERS - (BODY)
      const postData = querystring.stringify({
        "code": code.toString(),
        "redirect_uri": "https://lit-citadel-55735.herokuapp.com/spotify-callback",
        "grant_type": "authorization_code",
        "client_id": process.env.SPOTIFY_ID,
        "client_secret": process.env.SPOTIFY_SECRET
      });

      //POST PARAMETER - (OPTIONS)
      var postRequest = {
        hostname: 'accounts.spotify.com',
        path: '/api/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        json: true
      };

      //POST request (FORMATION) - Putting it together using previous setup parameters (OPTIONS & BODY)
      var request = https.request(postRequest, (response) => {
        if(response.statusCode === 200) {
          //POST request (RESPONSE)
          //chunk = JSON Data response (must be parsed) with the Access_Token property that allows us to read a user's Spotify Data
          response.on('data', (chunk) => {
            var data = JSON.parse(chunk);
            console.log(data);

            //GET request (Step 3) - Spotify API (w/ Access Token we received from the POST request response)
            var requestTwo = https.request({
              hostname: 'api.spotify.com',
              //Change Path to match Spotify API requirements (If you change Scopes Change this as well based on Spotify API Documentation)
              path: '/v1/me/following?type=artist',
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + data.access_token
              },
              json: true
            }, (response) => {
              var rawData = '';
              response.on('data', (chunk) => {
                //When Data is Received, add it to empty variable
                rawData += chunk;
              });
              response.on('end', (chunk) => {
                //When the response is finished, Display the JSON (Results *** Subject to Change based on How we use the Data ***)
                res.send(JSON.parse(rawData));
              });
            });

            requestTwo.end();
          });

        } else {
          res.send(response.statusCode);
        }
      });

      //POST Request - Writing the Data / Making the Call
      request.write(postData);

      //Closing Off the Request
      request.end();
    };
  });

  // Render 404 page for any unmatched routes
  app.get("/game", function(req, res) {
    res.render("game");
    // res.send("HEY");
  });

  // Render 404 page for any unmatched routes
  app.get("*", function(req, res) {
    res.render("404");
  });

};


//amantest

app.get("/abrole", function(req, res) {
  db.Example.findAll({}).then(function(dbExamples) {
    res.render("IndexF", {
      msg: "Welcome!",
      examples: dbExamples
    });
  });
});
