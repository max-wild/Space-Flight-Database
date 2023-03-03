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
    'crew_members': sql_to_string('./read_queries/crew_members_read.sql'),
    'external_sites': sql_to_string('./read_queries/external_sites_read.sql'),
    'missions': sql_to_string('./read_queries/missions_read.sql'),
    'organizations': sql_to_string('./read_queries/organizations_read.sql'),
    'missions_crew_members': sql_to_string('./read_queries/mis_c_m_read.sql'),
    'missions_external_sites': sql_to_string('./read_queries/mis_e_s_read.sql')
}

function get_read_query(entity_type){

    assert(entity_type in db_read_entities)

    return db_read_entities[entity_type]
}

module.exports = { 

    get_read_query
}
