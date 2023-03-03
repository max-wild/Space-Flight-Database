//*********************************
//
// SETUP
//
//*********************************

var express = require("express")
var exphbs = require("express-handlebars")
var util = require('util')

var db = require('./database/db-connector.js')
const { get_read_query } = require('./database/read_query_master.js')

const PORT = process.env.PORT || 23374
var app = express()

// View Engine
app.engine('handlebars', exphbs.engine({

    'defaultLayout': 'main'  // Referencing views/layouts/main.handlebars
}))   
app.set('view engine', 'handlebars')


app.use(express.urlencoded({ extended: false }))  // Lets us see information in the body from sent html forms
app.use(express.static('public'))

// Making a PROMISE object out of the db.pool.query() command
// This just lets us cleanly use the "await" keyword with db.pool.query()
const db_query = util.promisify(db.pool.query).bind(db.pool)

async function attempt_query(attempted_query){

    try{

        var result = await db_query(attempted_query)
        return result

    }catch (error){

        console.log('Error:', error)
        throw error
    }
}



//*********************************
//
// ROUTES
//
//*********************************

var db_entities = [
    'crew_members',
    'external_sites',
    'missions',
    'organizations',
    'missions_crew_members',
    'missions_external_sites'
]

// Send it to the right entity if requested
app.get('/:entity', async (req, res, next) => {

    var entity_name = req.params.entity.toLowerCase()

    if(db_entities.includes(entity_name)){

        var mission_query = get_read_query(entity_name)

        var mission_data = await attempt_query(mission_query)

        

        // Renders views/tables/[entity].handlebars
        res.status(200).render('tables/' + entity_name,
                                {data: mission_data})  
    
    }else{

        next()
    }
})


// Basic 'send everything to home'
app.get('*', async (req, res, next) => {

    res.status(200).render('pages/home')  // Renders views/pages/home.handlebars
})


app.post('*', (req, res, next) => {

    res.status(200).send(req.body)
})


//*********************************
//
// LISTENER
//
//*********************************

app.listen(PORT, function (err) {

    if (err) {
        console.log("Error!:", err)
        throw err;
    
    }else{

        console.log("== Server listening on port", PORT)
    }
    
})
