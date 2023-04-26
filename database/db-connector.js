// Get an instance of mysql we can use in the app
var mysql = require('mysql')

// Create a 'connection pool' using the provided credentials
var pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'warning: must set host',
    user            : 'warning: must set user',
    password        : 'warning: must set password',
    database        : 'warning: must set database'
})

// Export it for use in our applicaiton
module.exports.pool = pool;
