var db = require("../models");
var mysql = require("../config/connection");

//this is to get my data
module.exports = function(app) {
  // Get all examples
  app.get("/api/examples", function(req, res) {
    db.Example.findAll({}).then(function(dbExamples) {
      res.json(dbExamples);
    });
  });

  // read the database for questionaire.
  app.get('/get', function (req, res) {
    res.send(mysql.ask);
  });

  // post onto the database/post

  app.post('/post', function (req, res) {
    res.send(mysql.answer);
  })

  // Create a new example
  app.post("/api/examples", function(req, res) {
    db.Example.create(req.body).then(function(dbExample) {
      res.json(dbExample);
    });
  });

  // Delete an example by id
  app.delete("/api/examples/:id", function(req, res) {
    db.Example.destroy({ where: { id: req.params.id } }).then(function(dbExample) {
      res.json(dbExample);
    });
  });
};
