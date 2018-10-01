var db = require("../models");
const https = require("https");

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

    for (var i = 0; i < 16; i++) {
      state += characters.charAt(Math.floor(Math.random() * 16));
    }

    res.cookie("auth_spotify_id", state);

    var spotify = 'https://accounts.spotify.com/authorize/?client_id=' + process.env.SPOTIFY_ID
    + '&response_type=code&redirect_uri=https%3A%2F%2Flit-citadel-55735.herokuapp.com%2Fcallback&scope=user-top-read&show_dialog=true&state=' + state;

    res.redirect(spotify);
  });

  app.get("/callback", function(req, res) {
    var code = req.query.code || null;
    var state = req.query.state || null;
    var cookie = req.cookies ? req.cookies["auth_spotify_id"] : null;

    if(state === null || state !== cookie) {
      res.redirect("/#INTERNAL_SERVER_ERROR");
    } else {
      res.clearCookie("auth_spotify_id");

      var path = '/api/token/?grant_type=authorization_code&redirect_uri=https%3A%2F%2Flit-citadel-55735.herokuapp.com&code=' + code + '&client_id=' + process.env.SPOTIFY_ID + '&client_secret=' + process.env.SPOTIFY_SECRET;

      //POST request
      var request = https.request({
        hostname: 'accounts.spotify.com',
        path: path,
        method: 'POST',
        json: true
      }, (response) => {
        if(response.statusCode === 200) {
          // response.on('data', (d) => {
          //   res.send(d);
          // });
        } else {
          res.send(process.env.SPOTIFY_ID + "  HELLO  " + process.env.SPOTIFY_SECRET);
        }
      });



      request.end();

    }

  });

  // Render 404 page for any unmatched routes
  app.get("*", function(req, res) {
    res.render("404");
  });


};
