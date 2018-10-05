var db = require("../models");
const https = require("https");
const querystring = require('querystring');
var mysql2 = require('mysql');
var mysql = require('./../config/connection');

var jawsDB_url = "mysql://vufgp4uhwqqydc4e:p8cyc6trad2lnqov@wvulqmhjj9tbtc1w.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/vdqo9zrekzetwm5e"
//process.env.JAWSDB_URL

var connection = mysql2.createConnection(jawsDB_url);
connection.connect();

require("dotenv").config();

// this is what displays to the user
module.exports = function(app) {
  // Load index page
  app.get("/", function(req, res) {
    db.Example.findAll({}).then(function(dbExamples) {
      res.render("IndexF", {
        msg: "Welcome!",
        examples: dbExamples
      });
    });
  });

  app.post('/questionaire', function (req, res) {

     var arrayOfAnswers = req.body.answers;
     var answersSubmitted = {
         "q1": arrayOfAnswers[0],
         "q2": arrayOfAnswers[1],
         "q3": arrayOfAnswers[2],
         "q4": arrayOfAnswers[3],
         "q5": arrayOfAnswers[4],
     }

     mysql.answer(answersSubmitted); //Submiting Form to the Database
     //var answersObject = mysql.ask(); //Replacing the Dummy Data That I sent you Guys [Sam]

     console.log(answersSubmitted);

     if(req.body.spotifycheck == undefined) {
       connection.query('SELECT * from posts', function (err, rows, fields) {
         if (err) throw err;
         var answersObject = encodeURIComponent(JSON.stringify(rows[rows.length-1]));

         var song; //youtube video id for the song
         if(arrayOfAnswers[4] === "Salsa") { }
         else if (arrayOfAnswers[4] === "Ballet") { }
         else if (arrayOfAnswers[4] === "Breakdance") { }
         else if (arrayOfAnswers[4] === "Old School") { }
         else { } //salsa

          // console.log("THIS IS JORDAN: ", answersObject);
         res.render("game",{
           encodedJson : answersObject //,
           //youtube: song
           //NEED TO ADD YOUTUBE LINK OF SALSA MUSIC
         });

       });
     } else {
       res.redirect("/spotify")
     }
     // console.log("THIS IS JORDAN: ", answersObject);

  });

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

    //Change Scope Here (Spotify API) - Current: user-follow-read

    var spotify = 'https://accounts.spotify.com/authorize/?client_id=' + process.env.SPOTIFY_ID
    + '&response_type=code&redirect_uri=https%3A%2F%2Fdancepartysimulator.herokuapp.com%2Fspotify-callback&scope=user-top-read&show_dialog=true&state=' + state;

    res.redirect(spotify);
  });

  //SPOTIFY POST REQUEST (Spotify Authorization Step 1 Redirects to /spotify-callback)- (Step 2)
  //Spotify Authorization (Continued) to get Access_Token for user's Spotify API
  app.get("/spotify-callback", function(req, res) {
    var code = req.query.code || null;
    var state = req.query.state || null; //the state we generated on the /spotify page
    var cookie = req.cookies ? req.cookies["auth_spotify_id"] : null;
    console.log(req.query.error);
    //Checks if the User's Cookie has the same pregen State Key (Spotify Authorization - Check System)
    if(state === null || state !== cookie) {
      res.send("<H1>INTERNAL SERVER ERROR</H1>")
    } else if (req.query.error === "access_denied") {
      res.redirect("/");
    } else {
      res.clearCookie("auth_spotify_id");

      //POST PARAMETERS - (BODY)
      const postData = querystring.stringify({
        "code": code.toString(),
        "redirect_uri": "https://dancepartysimulator.herokuapp.com/spotify-callback",
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
              path: '/v1/me/top/tracks',
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
                var temp = JSON.parse(rawData).items[0].name.toString().split(" ").join("%20");
                var requestThree = https.request({
                  hostname: 'www.googleapis.com',
                  path: '/youtube/v3/search?part=snippet&maxResults=5&key=' + process.env.YOUTUBE_API + '&q=' + temp,
                  method: 'GET',
                  json: true
                }, (response) => {
                  var rawData = '';
                  response.on('data', (chunk) => {
                    rawData += chunk;
                  });
                   response.on('end', (chunk) => {
                    // res.send(JSON.parse(rawData).items[0].id.videoId);
                    var id = JSON.parse(rawData).items[0].id.videoId + "?autoplay=1"
                    // res.render("spotify", { uri: id });

                    //TESTING (WILL)
                    connection.query('SELECT * from posts', function (err, rows, fields) {
                      if (err) throw err;
                      var answersObject = encodeURIComponent(JSON.stringify(rows[rows.length-1]));

                       // console.log("THIS IS JORDAN: ", answersObject);
                      res.render("gameTest",{
                        encodedJson : answersObject,
                        youtube: id
                      });
                    });
                  });
                });
                requestThree.end();

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

    connection.query('SELECT * from posts', function (err, rows, fields) {
      if (err) throw err;
      var answersObject = encodeURIComponent(JSON.stringify(rows[rows.length-1]));

       // console.log("THIS IS JORDAN: ", answersObject);
      res.render("game",{
        encodedJson : answersObject
      });
    });

  });
  // Render 404 page for any unmatched routes
  app.get("*", function(req, res) {
    res.render("404");
  });

};


//amantest
