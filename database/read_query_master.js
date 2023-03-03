const fs = require('fs')
const path = require('path')
const assert = require('assert')

// Returns the sql file as a string
function sql_to_string (relative_dir){

    var read_sql = fs.readFileSync(path.resolve(__dirname, relative_dir), 'utf8')
    read_sql = read_sql.replace('\\r', '').replace('\\n', '')       // Remove '\r' and '\n'
    
    return read_sql
}


// Reads general information to display on the entity's page
var db_read_entities = {
    'crew_members': sql_to_string('./read_queries/crew_members_r.sql'),
    'external_sites': sql_to_string('./read_queries/external_sites_r.sql'),
    'missions': sql_to_string('./read_queries/missions_r.sql'),
    'organizations': sql_to_string('./read_queries/organizations_r.sql'),
    'missions_crew_members': sql_to_string('./read_queries/missions_crew_members_r.sql'),
    'missions_external_sites': sql_to_string('./read_queries/missions_external_sites_r.sql')
}

function get_read_query(entity_type){

    assert(entity_type in db_read_entities)

    return db_read_entities[entity_type]
}

// Reads simply the entity's name by it's ID
var db_name_by_id = {

    'crew_members': sql_to_string('./read_queries/name_by_id/crew_members_by_id.sql'),
    'external_sites': sql_to_string('./read_queries/name_by_id/external_sites_by_id.sql'),
    'missions': sql_to_string('./read_queries/name_by_id/missions_by_id.sql'),
    'organizations': sql_to_string('./read_queries/name_by_id/organizations_by_id.sql'),
}

function get_query_name_by_id(entity_type){

    assert(entity_type in db_name_by_id)

    return db_name_by_id[entity_type]
}


module.exports = { 

    get_read_query,
    get_query_name_by_id
}
