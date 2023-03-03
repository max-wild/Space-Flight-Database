const fs = require('fs')
const path = require('path')
const assert = require('assert')

// Returns the sql file as a string
function sql_to_string (relative_dir){

    var read_sql = fs.readFileSync(path.resolve(__dirname, relative_dir), 'utf8')
    read_sql = read_sql.replace('\\r', '').replace('\\n', '')       // Remove '\r' and '\n'
    
    return read_sql
}

var db_queries_by_entities = {

    'crew_members': {

        'read': sql_to_string('./queries/read/crew_members_r.sql'),
        'read_name_by_id': sql_to_string('./queries/read/name_by_id/crew_members_by_id.sql')
    }, 

    'external_sites': {

        'read': sql_to_string('./queries/read/external_sites_r.sql'),
        'read_name_by_id': sql_to_string('./queries/read/name_by_id/external_sites_by_id.sql')
    }, 

    'missions': {

        'read': sql_to_string('./queries/read/missions_r.sql'),
        'read_name_by_id': sql_to_string('./queries/read/name_by_id/missions_by_id.sql')
    }, 

    'organizations': {

        'read': sql_to_string('./queries/read/organizations_r.sql'),
        'read_name_by_id': sql_to_string('./queries/read/name_by_id/organizations_by_id.sql')
    }, 

    'missions_crew_members': {

        'read': sql_to_string('./queries/read/missions_crew_members_r.sql')
    }, 

    'missions_external_sites': {

        'read': sql_to_string('./queries/read/missions_external_sites_r.sql')
    }
}

/**
*    Returns a string sql query for reading general information to display on the entity's page
*/
function read_query(entity_type){

    assert(entity_type in db_queries_by_entities)

    // Get the pre-made query string
    return db_queries_by_entities[entity_type]['read']
}

/**
*    Returns a string sql query for an entity's name against its ID
*/
function read_query_name_by_id(entity_type){

    assert(entity_type in db_queries_by_entities)

    // Get the pre-made query string
    return db_queries_by_entities[entity_type]['read_name_by_id']
}

function create_query(entity_type, entity_id){

    assert(entity_type in db_queries_by_entities)
    // assert entity_id is in the database?

    // MAKE the query string based on the passed in ID ... TODO: add parenthesis
    return db_queries_by_entities[entity_type]['create']
}

/**
*    Returns a string sql query that will delete an entity based on ID
*/
function delete_query(entity_type, id_1){

    assert(entity_type in db_queries_by_entities)



    return db_queries_by_entities[entity_type]['read_name_by_id']
}

/**
*    Returns a string sql query that will delete a M:M relationship based on 2 IDs
*/
function delete_query(entity_type, id_1, id_2){

    assert(entity_type in db_queries_by_entities)

    

    return db_queries_by_entities[entity_type]['read_name_by_id']
}

module.exports = { 

    read_query,
    read_query_name_by_id
}
