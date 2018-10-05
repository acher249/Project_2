var mysql = require('mysql');


var jawsDB_url = "mysql://vufgp4uhwqqydc4e:p8cyc6trad2lnqov@wvulqmhjj9tbtc1w.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/vdqo9zrekzetwm5e"


var connection = mysql.createConnection(jawsDB_url);

connection.connect();

var ask = connection.query('SELECT 1 + 1 AS solution', function (err, rows, fields) {
    if (err) throw err;

    console.log('The solution is: ', rows[0].solution);
});

// var data = { id: 1, title: 'Hey William' };

// var answer = connection.query('INSERT INTO posts SET ?', data, function (error, results, fields) {
//     if (error) throw error;
//     // Neat!
// });


module.exports = connection;
module.exports = ask;
// module.exports = answer;

