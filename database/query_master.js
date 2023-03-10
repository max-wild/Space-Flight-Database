const fs = require('fs')
const path = require('path')
const assert = require('assert')
const { query } = require('express')

// Returns the sql file as a string
function sql_to_string (relative_dir) {

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
        'read_raw': sql_to_string('./queries/read/missions_raw_r.sql'),
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
function read_query(entity_type) {

    assert (entity_type in db_queries_by_entities)

    // Get the pre-made query string
    return db_queries_by_entities[entity_type]['read']
}

/**
*    Returns a string sql query for an entity's name against its ID
*/
function read_query_name_by_id(entity_type) {

    assert (entity_type in db_queries_by_entities)

    // Get the pre-made query string
    return db_queries_by_entities[entity_type]['read_name_by_id']
}

/**
*    Returns a string sql query for reading raw, un-JOIN-ed data from an entity
*    
*    (For example, Missions will return with an Organization ID instead of Organization Name)  
*/
function read_query_raw(entity_type) {

    assert (entity_type in db_queries_by_entities)

    if (entity_type === 'missions') {
        return db_queries_by_entities['missions']['read_raw']
    
    }else{

        return db_queries_by_entities[entity_type]['read']
    }
}

/**
 * @param {String} entity_type 
 * @param {object} add_data 
 * @returns A string representing a create query depending on the data
 */
function create_query(entity_type, add_data) {

    assert (entity_type in db_queries_by_entities)

    if (entity_type === 'crew_members') {

        if (!add_data.first_name) {
            var fname = 'NULL'
        }else{
            var fname = `"${add_data.first_name}"`
        }
        
        if (!add_data.birth_country) {
            var birth_country = 'NULL'
        }else{
            var birth_country = `"${add_data.birth_country}"`
        }

        if (!add_data.birth_date) {
            var birth_date = 'NULL'
        }else{
            var birth_date = `"${add_data.birth_date}"`
        }

        var home_leader = add_data.home_base_lead.toString().toUpperCase()

        // Create and return the query
        var crew_create_query = `INSERT INTO Crew_Members (first_name, last_name, birth_country, birth_date, home_base_lead) 
        VALUES (${fname}, "${add_data.last_name}", ${birth_country}, ${birth_date}, ${home_leader});`

        return crew_create_query
    
    }else if (entity_type === 'external_sites') {

        // Distance value may be null
        var distance_to_site = add_data.dist_from_earth || 'NULL'

        var site_create_query = `INSERT INTO External_Sites (name, dist_from_earth) 
        VALUES ("${add_data.name}", ${distance_to_site});`

        return site_create_query
    
    }else if (entity_type === 'missions') {

        var update_completed = add_data.successful_completion.toString().toUpperCase()

        if (!add_data.launch_date) {
            var update_launch = 'NULL'
        }else{
            var update_launch = `"${add_data.launch_date}"`
        }

        var update_orga_id = add_data.organization_id || 'NULL'

        // Create and return the query
        var mission_create_query = `INSERT INTO Missions (name, description, launch_date, successful_completion, organization_id)` +
        ` VALUES ("${add_data.name}", "${add_data.description}", ${update_launch}, ${update_completed}, 
        ${update_orga});`

        return mission_create_query

    }else if (entity_type === 'organizations') {

        var orga_create_query = `INSERT INTO Organizations (name, country) 
        VALUES ("${add_data.name}", "${add_data.country}");`

        return orga_create_query
    }
}


/**
 * @param {String} entity_type 
 * @param {object} update_data 
 * @returns A string representing an update query depending on the data
 */
function update_query(entity_type, update_data) {

    assert (entity_type in db_queries_by_entities)

    if (entity_type === 'crew_members') {

        if (!update_data.first_name) {
            var fname = 'NULL'
        }else{
            var fname = `"${update_data.first_name}"`
        }
        
        if (!update_data.birth_country) {
            var birth_country = 'NULL'
        }else{
            var birth_country = `"${update_data.birth_country}"`
        }

        if (!update_data.birth_date) {
            var birth_date = 'NULL'
        }else{
            var birth_date = `"${update_data.birth_date}"`
        }

        var home_leader = update_data.home_base_lead.toString().toUpperCase()

        // Create and return the query
        var crew_update_query = `UPDATE Crew_Members ` +
        `SET first_name = ${fname}, last_name = "${update_data.last_name}", ` +
        `birth_country = ${birth_country}, birth_date = ${birth_date}, ` +
        `home_base_lead = ${home_leader} ` +
        `WHERE crew_member_id = ${update_data.crew_member_id};`

        return crew_update_query
    
    }else if (entity_type === 'external_sites') {

        // Distance value may be null
        var distance_to_site = update_data.dist_from_earth || 'NULL'

        var site_update_query = `UPDATE External_Sites 
        SET name = "${update_data.name}", dist_from_earth = ${distance_to_site} 
        WHERE external_site_id = ${update_data.external_site_id};`

        return site_update_query
    
    }else if (entity_type === 'missions') {

        var update_completed = update_data.successful_completion.toString().toUpperCase()

        if (!update_data.launch_date) {
            var update_launch = 'NULL'
        }else{
            var update_launch = `"${update_data.launch_date}"`
        }

        if (!update_data.organization_id) {
            var update_orga = 'NULL'
        }else{
            var update_orga = parseInt(update_data.organization_id)
        }

        var mission_update_query = `UPDATE Missions ` +
        `SET name = "${update_data.name}", description = "${update_data.description}", ` +
        `launch_date = ${update_launch}, successful_completion = ${update_completed}, ` +
        `organization_id = ${update_orga} ` +
        `WHERE mission_id = ${update_data.mission_id};`

        return mission_update_query

    }else if (entity_type === 'organizations') {

        var orga_update_query = `UPDATE Organizations 
        SET name = "${update_data.name}", country = "${update_data.country}" 
        WHERE organization_id = ${update_data.organization_id};`

        return orga_update_query
    }
}


/**
 * @param {String} entity_type 
 * @param {object} update_data 
 * @returns A list of strings representing all delete queries that should be performed
 */
function delete_queries(entity_type, update_data) {

    assert (entity_type in db_queries_by_entities)

    if (entity_type === 'crew_members') {

        var delete_entry_id = parseInt(update_data.id)
    
        // Delete from intersection table
        var crew_delete_queries = [
            `DELETE FROM Missions_Crew_Members WHERE crew_member_id = ${delete_entry_id};`,
            `DELETE FROM Crew_Members WHERE crew_member_id = ${delete_entry_id};`
        ]

        return crew_delete_queries
    
    }else if (entity_type === 'external_sites') {

        var delete_entry_id = parseInt(update_data.id)
    
        // Delete from intersection table
        var site_delete_queries = [
            `DELETE FROM Missions_External_Sites WHERE external_site_id = ${delete_entry_id};`,
            `DELETE FROM External_Sites WHERE external_site_id = ${delete_entry_id};`
        ]

        return site_delete_queries
    
    }else if (entity_type === 'missions') {

        var delete_entry_id = parseInt(update_data.id)
    
        // Delete from intersection table
        var mission_delete_queries = [
            `DELETE FROM Missions_External_Sites WHERE mission_id = ${delete_entry_id};`,
            `DELETE FROM Missions_Crew_Members WHERE mission_id = ${delete_entry_id};`,
            `DELETE FROM Missions WHERE mission_id = ${delete_entry_id};`
        ]

        return mission_delete_queries

    }else if (entity_type === 'organizations') {

        var delete_entry_id = parseInt(update_data.id)

        var orga_delete_queries = [

            // Remove tie to mission
            `UPDATE Missions SET organization_id = NULL WHERE organization_id = ${delete_entry_id};`,
            `DELETE FROM Organizations WHERE organization_id = ${delete_entry_id};`
        ]

        return orga_delete_queries
    }
}

module.exports = { 

    read_query,
    read_query_name_by_id,
    read_query_raw,
    create_query,
    update_query,
    delete_queries
}
