//*********************************
//
// SETUP
//
//*********************************

const { query } = require("express")
var express = require("express")
var exphbs = require("express-handlebars")
var util = require('util')

var db = require('./database/db-connector.js')
const { read_query, read_query_name_by_id } = require('./database/query_master.js')

const PORT = process.env.PORT || 23374
var app = express()

// View Engine
app.engine('handlebars', exphbs.engine({

    'defaultLayout': 'main'  // Referencing views/layouts/main.handlebars
}))   
app.set('view engine', 'handlebars')


app.use(express.json())
app.use(express.urlencoded({ extended: false }))  // Lets us see information in the body from sent html forms
app.use(express.static('public'))

// Making a PROMISE object out of the db.pool.query() command
// This just lets us cleanly use the "await" keyword with db.pool.query()
const db_query = util.promisify(db.pool.query).bind(db.pool)

/**
*    Makes an asynchronous query attempt on the SQL database
*/
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

/**
*    GET Request for entities -- sends a READ query
*/
app.get('/:entity', async (req, res, next) => {

    var entity_name = req.params.entity.toLowerCase()

    if(db_entities.includes(entity_name)){

        var entity_data = await attempt_query(read_query(entity_name))

        // TODO: Create a setup_handlebars_data function, to load the read data
        var handlebars_data = {data: entity_data}

        // missions, missions_crew_members, and missions_external_sites need additional information
        if(entity_name === 'missions'){

            var organizations_query = read_query_name_by_id('organizations')
            var organizations_data = await attempt_query(organizations_query)

            handlebars_data['organizations'] = organizations_data
        }

        if(entity_name === 'missions_crew_members'){

            var missions_query = read_query_name_by_id('missions')
            var missions_data = await attempt_query(missions_query)
            handlebars_data['missions'] = missions_data

            var crew_members_query = read_query_name_by_id('crew_members')
            var crew_members_data = await attempt_query(crew_members_query)
            handlebars_data['crew_members'] = crew_members_data
        }

        if(entity_name === 'missions_external_sites'){

            var missions_query = read_query_name_by_id('missions')
            var missions_data = await attempt_query(missions_query)
            handlebars_data['missions'] = missions_data

            var external_sites_query = read_query_name_by_id('external_sites')
            var external_sites_data = await attempt_query(external_sites_query)
            handlebars_data['external_sites'] = external_sites_data
        }

        // Renders views/tables/[entity].handlebars with "handlebars_data" passed in
        res.status(200).render('tables/' + entity_name, handlebars_data)  
    
    }else{

        next()
    }
})


/**
*    POST Request for entities -- sends a CREATE query
*/
app.post('/add/:entity', async (req, res, next) => {

    // Capture the incoming data and parse it back to a JS object
    var data = req.body

    var succ = data.successful_completion.toString().toUpperCase()

    // Create the query and run it on the database
    query1 = `INSERT INTO Missions (name, description, launch_date, successful_completion, organization_id)` +
    ` VALUES ('${data.name}', '${data.description}', '${data.launch_date}', ${succ}, ${data.organization_id})`
    
    console.log('CALLING QUERY 1!!', query1)

    // Send in the new data
    try{
        await attempt_query(query1)
    }catch(error){
        return res.sendStatus(400)
    }

    // Return a confirmation of the new data
    try{
        var rows = await attempt_query(read_query('missions'))
    }catch(error){
        return res.sendStatus(400)
    }

    res.status(200).send(rows)




    // var entity_name = req.params.entity.toLowerCase()

    // if(db_entities.includes(entity_name)){

    //     if(entity_name !== 'missions')
    //         return next()

    //     // Pass a dictionary 
    //     await attempt_query(create_query())

        // var mission_query = read_query(entity_name)
        // var mission_data = await attempt_query(mission_query)

        // // TODO: Create a setup_handlebars_data function, to load the read data
        // var handlebars_data = {data: mission_data}

        // // missions, missions_crew_members, and missions_external_sites need additional information
        // if(entity_name === 'missions'){

        //     var organizations_query = read_query_name_by_id('organizations')
        //     var organizations_data = await attempt_query(organizations_query)

        //     handlebars_data['organizations'] = organizations_data
        // }

        // if(entity_name === 'missions_crew_members'){

        //     var missions_query = read_query_name_by_id('missions')
        //     var missions_data = await attempt_query(missions_query)
        //     handlebars_data['missions'] = missions_data

        //     var crew_members_query = read_query_name_by_id('crew_members')
        //     var crew_members_data = await attempt_query(crew_members_query)
        //     handlebars_data['crew_members'] = crew_members_data
        // }

        // if(entity_name === 'missions_external_sites'){

        //     var missions_query = read_query_name_by_id('missions')
        //     var missions_data = await attempt_query(missions_query)
        //     handlebars_data['missions'] = missions_data

        //     var external_sites_query = read_query_name_by_id('external_sites')
        //     var external_sites_data = await attempt_query(external_sites_query)
        //     handlebars_data['external_sites'] = external_sites_data
        // }

        // // Renders views/tables/[entity].handlebars with "handlebars_data" passed in
        // res.status(200).render('tables/' + entity_name, handlebars_data)  
    
    // }else{

    //     next()
    // }
})


/**
*    Basic "send everything to home"
*/
app.get('*', async (req, res, next) => {

    res.status(200).render('pages/home')  // Renders views/pages/home.handlebars
})





//*********************************
//
// LISTENER
//
//*********************************

app.listen(PORT, function (err) {

    if (err) {
        console.log("Error!:", err)
        throw err
    
    }else{

        console.log("== Server listening on port", PORT)
    }
    
})
