var mysql = require('mysql');


var jawsDB_url = "mysql://vufgp4uhwqqydc4e:p8cyc6trad2lnqov@wvulqmhjj9tbtc1w.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/vdqo9zrekzetwm5e"
//process.env.JAWSDB_URL

var connection = mysql.createConnection(jawsDB_url);

connection.connect();

var askQuestion = function () {
   connection.query('SELECT * from posts', function (err, rows, fields) {
     if (err) throw err;
     console.log('The solution is: ', rows[0]);
     return rows[rows.length-1];
   });
}

var answer = function(data)
   {
       connection.query('INSERT INTO posts SET ?', data, function (error, results, fields) {
       console.log("The result is:", results);
       if (error) throw error;
       // Neat!
       });
   }


var wrapperObj = {
   ask: askQuestion,
   answer: answer
}

module.exports = wrapperObj
