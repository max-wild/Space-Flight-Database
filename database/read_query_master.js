const fs = require('fs')
const path = require('path')
const assert = require('assert')

// Returns the sql file as a string
function sql_to_string (relative_dir){

    var read_sql = fs.readFileSync(path.resolve(__dirname, relative_dir), 'utf8')
    read_sql = read_sql.replace('\\r', '').replace('\\n', '')       // Remove '\r' and '\n'
    
    return read_sql
}


var db_read_entities = {
    'crew_members': '',
    'external_sites': '',
    'missions': sql_to_string('./read_queries/missions_read.sql'),
    'organizations': '',
    'missions_crew_members': '',
    'missions_external_sites': ''
}

function get_read_query(entity_type){

    assert(entity_type in db_read_entities)

    return db_read_entities[entity_type]
}

module.exports = { 

    get_read_query
}
