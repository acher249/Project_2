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
    res.redirect('https://accounts.spotify.com/authorize/?client_id=' + process.env.SPOTIFY_ID + '&response_type=code&redirect_uri=https%3A%2F%2Fgoogle.com&scope=user-read-private%20user-read-email');
  });

  // Render 404 page for any unmatched routes
  app.get("*", function(req, res) {
    res.render("404");
  });


};
