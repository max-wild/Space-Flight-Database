/**
 * Summary. 
 *      Functionality for the CREATE, some READ, and DELETE functions for intersection tables.
 *
 * Description. 
 *      Automates reading and writing information for the page's CREATE and DELETE
 *      forms no matter which intersection table is being looked at. This is done by using an identifier
 *      on each HTML form and making all HTML inputs specify what type of data they concern
 *      in the name HTML attribute.
 *      Reads labels from the HTML page to discern which entity is being worked on.
 */

/**
 * 
 *      Setup and Global Variables
 * 
 */

var data_table = document.getElementById('data_table')
var table_body = data_table.getElementsByTagName('tbody')[0]
const PAGE_ENTITY = data_table.getAttribute('data-intersection_table')
var rows = data_table.getElementsByTagName('tr')

var add_entry_form = document.getElementById('add_form')
var delete_entry_form = document.getElementById('delete_form')

var select_add_one = document.getElementById('select_add_one')
var select_add_two = document.getElementById('select_add_two')
var select_delete_one = document.getElementById('select_delete_one')
var select_delete_two = document.getElementById('select_delete_two')

const MISSIONS_CREW_MEMBERS_TABLE_MAP = [

    'mission_id',
    'crew_member_id'
]

const MISSIONS_EXTERNAL_SITES_TABLE_MAP = [

    'mission_id',
    'external_site_id'
]

var table_map               
switch (PAGE_ENTITY) {

    case 'missions_crew_members':
        table_map = MISSIONS_CREW_MEMBERS_TABLE_MAP
        break

    case 'missions_external_sites':
        table_map = MISSIONS_EXTERNAL_SITES_TABLE_MAP
        break

    default:
        alert(`Table map for ${PAGE_ENTITY} not set up.`)
        console.error(`Table map for ${PAGE_ENTITY} not set up.`)
}

/**
 * 
 *      CREATE / Add Requests
 * 
 */
add_entry_form.addEventListener('submit', function (e) {
    
    // Stop the form from submitting
    e.preventDefault()

    var add_data = {}
    add_data[table_map[0]] = parseInt(select_add_one.value)
    add_data[table_map[1]] = parseInt(select_add_two.value)

    // Exit early if a "select an entity" option is still selected
    for (var entity_id_key in add_data) {
        if (add_data[entity_id_key] === -1)
            return
    }

    // Setup our AJAX request
    var xhttp = new XMLHttpRequest()
    xhttp.open('POST', '/add/' + PAGE_ENTITY, true)
    xhttp.setRequestHeader('Content-type', 'application/json')

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            // Add the new data to the table
            add_row_to_table(xhttp.response, add_data)

            // Clear the input fields for another transaction
            add_entry_form.reset()
        }
        else if (xhttp.readyState == 4 && xhttp.status != 200) {

            alert('There was an error with the input.')
        }
    }

    // Send the request and wait for the response
    xhttp.send(JSON.stringify(add_data))

    console.log('SENDING DATA:', add_data)
})


/**
 * Gets the name of the entity described in this entry based on the
 * passed-in name of the entity_id
 * 
 * e.g. passing in 'mission_id' will return the name of the mission
 * in this entry
 * 
 * This is necessary because the
 * crew_members entity has a special name: it's the first_name  
 * concatened with last_name.
 * 
 * @param {object} entry The entry to get the name from
 * @param {String} entity_id_name The id name of the entity to-be-found
 * @returns {String} The name of the entity associated with that id in this entry
 */
function get_entity_name(entry, entity_id_name) {

    console.log('trying to read from:', entry)

    if (entity_id_name === 'crew_member_id') {

        return (entry['first_name'] || '') + ' ' + (entry['last_name'] || '')
    }

    // Remove the last '_id' portion of the entity_id_name and replace it with '_name'
    // e.g. mission_id -> mission_name
    return entry[entity_id_name.slice(0, -3) + '_name']
}



/**
 * Adds a new value to the table, if it was not already there. 
 * Used after successful CREATE requests.
 * 
 * @param {String} received_data Formatted data received from the server
 * @param {object} sent_data Original data sent to the server
 */
function add_row_to_table (received_data, sent_data) {

    received_data = JSON.parse(received_data)

    // If the data is already in the table, don't add it.
    // Check this using a for loop:
    for (var i = 1; i < rows.length; i++) {

        // Check if the first entity's id is the same
        if (parseInt(rows[i]
            .getElementsByTagName('td')[0].getAttribute(`data-${table_map[0]}`)) === sent_data[table_map[0]]) {

            // Check if the second entity's id is the same
            if (parseInt(rows[i]
                .getElementsByTagName('td')[1].getAttribute(`data-${table_map[1]}`)) === sent_data[table_map[1]]) {

                // This row already exists in the table--don't need to add it
                return
            }
        }
    }

    // Otherwise, add the data
    var new_row = document.createElement('tr')

    // Find the index of the new-row from the sent-in data
    var new_entry_idx = received_data
        .findIndex(x => {return parseInt(x[table_map[0]]) === sent_data[table_map[0]] 
        && parseInt(x[table_map[1]]) === sent_data[table_map[1]]})

    var new_entry = received_data[new_entry_idx]

    console.log('received data is:', received_data)
    console.log('new entry is:', new_entry)

    var cell_one = document.createElement('td')
    cell_one.setAttribute(`data-${table_map[0]}`, sent_data[table_map[0]])
    cell_one.innerText = get_entity_name(new_entry, table_map[0])
    new_row.appendChild(cell_one)

    var cell_two = document.createElement('td')
    cell_two.setAttribute(`data-${table_map[1]}`, sent_data[table_map[1]])
    cell_two.innerText = get_entity_name(new_entry, table_map[1])
    new_row.appendChild(cell_two)

    // Append the new entry at its proper location
    // data_table.appendChild(new_row)
    table_body.insertBefore(new_row, table_body.children[new_entry_idx + 1]);
}


/**
 * 
 *      DELETE Requests
 * 
 */

/**
 * Event listener for deleting entries in the delete form
 */
delete_entry_form.addEventListener('submit', function (e) {

    // Stop the form from submitting
    e.preventDefault()

    var delete_data = {}
    delete_data[table_map[0]] = parseInt(select_delete_one.value)
    delete_data[table_map[1]] = parseInt(select_delete_two.value)

    // Exit early if a "select an entity" option is still selected
    for (var entity_id_key in delete_data) {
        if (delete_data[entity_id_key] === -1)
            return
    }

    // Setup our AJAX request
    var xhttp = new XMLHttpRequest()
    xhttp.open('DELETE', '/delete/' + PAGE_ENTITY, true)
    xhttp.setRequestHeader('Content-type', 'application/json')

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 204) {

            // Remove the row from the table if successful
            delete_row(delete_data)

            // Clear the input fields for another transaction
            delete_entry_form.reset()
        }
        else if (xhttp.readyState == 4 && xhttp.status != 204) {
            console.error('There was an error with the input.')
            alert('There was an error with the input.')
        }
    }

    // Send the request and wait for the response
    xhttp.send(JSON.stringify(delete_data))
})


/**
 * Given an entry ID, deletes that entry from the table. Called
 * afer a successful DELETE request.
 * 
 * @param {Number} deleted_data
 */
function delete_row(deleted_data) {

    // Check for the data to-be-deleted from the table
    for (var i = 1; i < rows.length; i++) {

        // Check if the first entity's id is the same
        if (parseInt(rows[i]
            .getElementsByTagName('td')[0].getAttribute(`data-${table_map[0]}`)) === deleted_data[table_map[0]]) {

            // Check if the second entity's id is the same
            if (parseInt(rows[i]
                .getElementsByTagName('td')[1].getAttribute(`data-${table_map[1]}`)) === deleted_data[table_map[1]]) {

                data_table.deleteRow(i)
                // rows[i].remove()
            }
        }
    }
}
