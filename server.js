//*********************************
//
// SETUP
//
//*********************************
var express = require("express")
var exphbs = require("express-handlebars")
var util = require('util')

var db = require('./database/db-connector.js')
const { read_query, read_query_name_by_id, 
    read_query_raw, create_query, 
    update_query, delete_queries,
    mission_search_query } = require('./database/query_master.js')

const PORT = process.env.PORT || 23374
var app = express()

// Setting up the view engine
const hbs = exphbs.create({

    'defaultLayout': 'main',  // Referencing views/layouts/main.handlebars
    'helpers': {
        // Taken from https://github.com/helpers/handlebars-helpers
        addCommas: function(number) {
            return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')}
    }
})

app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')


const DB_TABLES = [
    'crew_members',
    'external_sites',
    'missions',
    'organizations',
    'missions_crew_members',
    'missions_external_sites'
]

const TABLE_TO_ID = {

    'crew_members': 'crew_member_id',
    'external_sites': 'external_site_id',
    'missions': 'mission_id',
    'organizations': 'organization_id'
}


app.use(express.json())
app.use(express.urlencoded({ extended: false }))  // Lets us see information in the body from sent html forms
app.use(express.static('public'))

// Making a javascript "promise" object out of the db.pool.query() command
// This just lets us cleanly use the "await" keyword with db.pool.query()
const db_query = util.promisify(db.pool.query).bind(db.pool)

/**
*    Makes an asynchronous query attempt on the SQL database
*/
async function attempt_query(attempted_query) {

    try{

        var result = await db_query(attempted_query)
        return result

    }catch (error) {

        console.log('Error:', error)
        throw error
    }
}


/**
 * Gets the data from a table in the SQL database using read queries
 * 
 * @param {String} table_name 
 * @returns a JS object with data taken from READ queries on the database.
 */
async function get_read_query_data(table_name) {

    try{
        var entity_data = await attempt_query(read_query(table_name))
    }catch (error) {
        throw error
    }
    
    var handlebars_data = {'data': entity_data}

    // missions, missions_crew_members, and missions_external_sites need additional information
    if (table_name === 'missions') {

        var organizations_query = read_query_name_by_id('organizations')

        try{
            var organizations_data = await attempt_query(organizations_query)
        }catch (error) {
            throw error
        }

        handlebars_data['organizations'] = organizations_data
    }

    if (table_name === 'missions_crew_members') {

        // Read missions
        var missions_query = read_query_name_by_id('missions')
        try{
            var missions_data = await attempt_query(missions_query)
        }catch (error) {
            throw error
        }
        handlebars_data['missions'] = missions_data

        // Read crew members
        var crew_members_query = read_query_name_by_id('crew_members')
        try{
            var crew_members_data = await attempt_query(crew_members_query)
        }catch (error) {
            throw error
        }
        handlebars_data['crew_members'] = crew_members_data
    }

    if (table_name === 'missions_external_sites') {

        // Read missions
        var missions_query = read_query_name_by_id('missions')
        try{
            var missions_data = await attempt_query(missions_query)
        }catch (error) {
            throw error
        }
        handlebars_data['missions'] = missions_data

        // Read external sites
        var external_sites_query = read_query_name_by_id('external_sites')
        try{
            var external_sites_data = await attempt_query(external_sites_query)
        }catch (error){
            throw error
        }
        handlebars_data['external_sites'] = external_sites_data
    }

    return handlebars_data
}


//*********************************
//
// ROUTES
//
//*********************************

/**
*    GET Request for entities -- sends a READ query
*/
app.get('/:entity', async (req, res, next) => {

    var entity_name = req.params.entity.toLowerCase()

    if (!DB_TABLES.includes(entity_name)) {

        return next()
    }

    try{
        var handlebars_data = await get_read_query_data(entity_name)
    }catch (error){
        return res.sendStatus(500)
    }

    // Renders views/tables/[entity].handlebars with "handlebars_data" passed in
    res.status(200).render('tables/' + entity_name, handlebars_data)  
})


/**
*    Returns JSON information about entities, used in the html pages to autofill data
*/
app.get('/entity_json/:entity', async (req, res, next) => {

    var entity_name = req.params.entity.toLowerCase()

    if (!DB_TABLES.includes(entity_name)) {
    
        return next()
    }

    try{
        var entity_data = await attempt_query(read_query_raw(entity_name))

        res.status(200).send(JSON.stringify(entity_data))

    }catch (error){
        return res.sendStatus(500)
    }
})


/**
*    POST Request for entities -- sends a CREATE query
*/
app.post('/add/:entity', async (req, res, next) => {

    var entity_name = req.params.entity.toLowerCase()

    if (!DB_TABLES.includes(entity_name)) {

        return next()
    }

    var query_read_table = create_query(entity_name, req.body)

    // Send in the new data
    try{
        await attempt_query(query_read_table)
    }catch (error) {
        return res.sendStatus(500)
    }

    // Return a confirmation of the new data
    try{
        var rows = await attempt_query(read_query(entity_name))
    }catch (error) {
        return res.sendStatus(500)
    }

    res.status(200).send(rows)
})


/**
*    PUT Request for entities -- sends an UPDATE query
*/
app.put('/update/:entity', async(req, res, next) => {

    var entity_name = req.params.entity.toLowerCase()
    var entry_id = req.body[TABLE_TO_ID[entity_name]]

    if (!DB_TABLES.includes(entity_name)) {

        return next()
    }

    var query_update_table = update_query(entity_name, req.body)

    try{
        await attempt_query(query_update_table)
    }catch (error) {
        return res.sendStatus(500)
    }

    try{
        var rows = await attempt_query(read_query(entity_name))

        // TODO: This won't work for intersection tables
        rows = rows.find(obj => obj[TABLE_TO_ID[entity_name]] === entry_id)           

    }catch (error) {
        return res.sendStatus(500)
    }
    
    res.status(200).send(rows)
})


/**
*    DELETE Request for entities -- sends a DELETE query
*/
app.delete('/delete/:entity', async (req, res, next) => {

    var entity_name = req.params.entity.toLowerCase()

    if (!DB_TABLES.includes(entity_name)) {

        return next()
    }

    // There may be multiple queries if extra data must be deleted from intersection tables
    var table_delete_queries = delete_queries(entity_name, req.body)

    for (var i = 0; i < table_delete_queries.length; i++){

        try{
            await attempt_query(table_delete_queries[i])
        }catch (error) {
            return res.sendStatus(500)
        }
    }

    return res.sendStatus(204)
})



/**
*    Special page for mission search
*/
app.get('/missions/search', async (req, res, next) => {

    // Make sure the url parameter is there
    var search_keyword = req.query.name || ''

    // Otherwise, act on the search:
    try{
        var keyword_search_results = await attempt_query(mission_search_query(search_keyword))
    }catch (error){
        return res.sendStatus(500)
    }

    res.status(200).render('pages/missions_search', {

        'data': keyword_search_results,
        'search_keyword': search_keyword
    })
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
