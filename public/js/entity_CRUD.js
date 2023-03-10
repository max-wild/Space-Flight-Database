/**
 * Summary. 
 *      Functionality for the CREATE, some READ, UPDATE, and DELETE functions for entities.
 *
 * Description. 
 *      Automates reading and writing information for the page's READ, UPDATE, and DELETE
 *      forms no matter which entity is being looked at. This is done by using an identifier
 *      on each HTML form and making all HTML inputs specify what type of data they concern
 *      in the name HTML attribute.
 *      Reads labels from the HTML page to discern which entity is being worked on.
 * 
 *      Autoloads entry information into the variable "all_entry_data" to keep a running list
 *      of table entries, information can be autofilled in the "Update" form.
 */

// Leftover to implement:
// 3. Provide Checks for Uniqueness
// 4. Set up updating with null values

/**
 * 
 *      Setup and Global Variables
 * 
 */

var data_table = document.getElementById('data_table')
const PAGE_ENTITY = data_table.getAttribute('data-entity')

/**
 * Sends a GET request to get information about the current
 * entity from the server.
 * 
 * @returns A promise that carries the entity database data
 */
async function get_initial_data() {

    try{
        const response_data = await fetch('/entity_json/' + PAGE_ENTITY, {
            'method': 'GET'
        })

        return await response_data.json()
    
    }catch (error) {
        alert('Error:', error)
    }
}

/**
 * Carries information for all table entries--used for autofilling the "update" form
 */
var all_entry_data = undefined
get_initial_data()
    .then((res) => {all_entry_data = res})
    .catch((err) => {alert('Error: initial data not downloaded:', err)})

const CREW_MEMBERS_TABLE_MAP = [

    'crew_member_id',
    'first_name',
    'last_name',
    'birth_country',
    'birth_date',
    'home_base_lead'
]

const EXTERNAL_SITES_TABLE_MAP = [

    'external_site_id',
    'name',
    'dist_from_earth'
]

const MISSIONS_TABLE_MAP = [

    'mission_id',
    'name',
    'description',
    'launch_date',
    'successful_completion',
    'organization_name'
]

const ORGANIZATIONS_TABLE_MAP = [

    'organization_id',
    'name',
    'country'
]

var table_map               
switch (PAGE_ENTITY) {

    case 'missions':
        table_map = MISSIONS_TABLE_MAP
        break

    case 'crew_members':
        table_map = CREW_MEMBERS_TABLE_MAP
        break
    
    case 'organizations':
        table_map = ORGANIZATIONS_TABLE_MAP
        break

    case 'external_sites':
        table_map = EXTERNAL_SITES_TABLE_MAP
        break

    default:
        alert(`Table map for ${PAGE_ENTITY} not set up.`)
        console.error(`Table map for ${PAGE_ENTITY} not set up.`)
}

const ENTITY_ID_NAME = table_map[0]     // This variable exists because each entity has a different name for "id"


var add_entry_form = document.getElementById('add_form')
var update_entry_form = document.getElementById('update_form')
var delete_entry_form = document.getElementById('delete_form')

var select_update = document.getElementById('entry_select_update')
var select_delete = document.getElementById('entry_select_delete')


/**
 * 
 *      Functions
 * 
 */

/**
 * Gets what name the entry should be. This is necessary because the
 * crew_members entity has a special name: it's the first_name  
 * concatened with last_name.
 * 
 * @param {object} entry The entry to get the name form
 * @returns The name of the object depending on the type
 */
function get_entry_name(entry) {

    if (PAGE_ENTITY === 'crew_members') {

        return (entry['first_name'] || '') + ' ' + (entry['last_name'] || '')
    }

    return entry['name']
}


/**
 * Finds a label HTML element based on its "for" value. This is also the
 * id of the input element it's associated with.
 * 
 * @param {Number | String} for_value 
 * @returns The label HTML element associated with the "for" value
 */
function find_label_by_for(for_value) {
    
    for_value = for_value.toString()
    all_labels = document.getElementsByTagName('label')

    for (var i = 0; i < all_labels.length; i++) {

        if (all_labels[i].getAttribute('for') === for_value)
            return all_labels[i]
    }
 }


 /**
  * This function gets information from the add or update form.
  * 
  * @param {String} form_type is either 'add' or 'update', specifying
  *         which form to use
  * 
  * @returns undefined if the forms were not filled out properly, otherwise
  *         returns a JS object with data from the add or update forms.
  */
function get_form_data(form_type) {

    // Get all types of input:
    if (form_type === 'add') {

        var form_inputs = add_entry_form.getElementsByTagName('input')
        var form_textareas = add_entry_form.getElementsByTagName('textarea')
        var form_selects = add_entry_form.getElementsByTagName('select')
    
    }else{

        var form_inputs = update_entry_form.getElementsByTagName('input')
        var form_textareas = update_entry_form.getElementsByTagName('textarea')
        var form_selects = update_entry_form.getElementsByTagName('select')
    }
    
    var form_data = {}

    // Add INPUT information to the form_data object
    for (var i = 0; i < form_inputs.length; i++) {

        var data_type = form_inputs[i].getAttribute('type')

        switch (data_type) {

            case 'text':

                // NULL value check:
                if (form_inputs[i].value === '' || form_inputs[i].value.toUpperCase() === 'NULL') {

                    // Check if we allow NULL values
                    if (form_inputs[i].hasAttribute('required')) {

                        // Don't continue--required condition not met
                        const label_name = find_label_by_for(form_inputs[i].id).innerText

                        console.warn(`${label_name} is a required value. It must be set.`)
                        alert(`${label_name} is a required value. It must be set.`)
                        return
                    }

                    form_data[form_inputs[i].getAttribute('name')] = null
                
                }else{

                    form_data[form_inputs[i].getAttribute('name')] = form_inputs[i].value
                }
                break

            case 'date':

                // NULL value check:
                if (!Date.parse(form_inputs[i].value)) {

                    // Check if we allow NULL values
                    if (form_inputs[i].hasAttribute('required')) {

                        // Don't continue--required condition not met
                        const label_name = find_label_by_for(form_inputs[i].id).innerText

                        console.warn(`${label_name} is a required value. It must be set.`)
                        alert(`${label_name} is a required value. It must be set.`)
                        return
                    }

                    form_data[form_inputs[i].getAttribute('name')] = null
            
                }else{

                    form_data[form_inputs[i].getAttribute('name')] = form_inputs[i].value
                }
                break

            case 'checkbox':
                
                form_data[form_inputs[i].getAttribute('name')] = form_inputs[i].checked
                break

            case 'number':
                // NULL value check:
                if (!form_inputs[i].value) {

                    // Don't need to worry about checking for 'required' for 'number' because
                    // otherwise the form wouldn't be able to be sent
                    form_data[form_inputs[i].getAttribute('name')] = null
                }else{

                    form_data[form_inputs[i].getAttribute('name')] = form_inputs[i].value
                }
                break

            default:
                console.error(form_inputs[i], 'does not have its input type set.')
        }
    }

    // Add TEXTAREA information to the form_data object
    for (var i = 0; i < form_textareas.length; i++) {

        // NULL value check:
        if (form_textareas[i].value === '' || form_textareas[i].value.toUpperCase() === 'NULL') {

            // Check if we allow NULL values
            if (form_textareas[i].hasAttribute('required')) {

                // Don't continue--required condition not met
                const label_name = find_label_by_for(form_textareas[i].id).innerText

                console.warn(`${label_name} is a required value. It must be set.`)
                alert(`${label_name} is a required value. It must be set.`)
                return
            }

            form_data[form_textareas[i].getAttribute('name')] = null
                
        }else{

            form_data[form_textareas[i].getAttribute('name')] = form_textareas[i].value
        }
    }

    // Add SELECT information to the form_data object
    for (var i = 0; i < form_selects.length; i++) {

        // Skip the select that is for selecting entity entries
        if (form_selects[i].classList.contains('entry_select')) {

            continue
        }

        var select_value = parseInt(form_selects[i].value) || -1

        // NULL value check (NULL select values are -1)
        if (select_value === -1) {

            // Check if we allow NULL values
            if (form_selects[i].hasAttribute('required')) {

                // Don't continue--required condition not met
                const label_name = find_label_by_for(form_selects[i].id).innerText

                console.warn(`${label_name} is a required value. It must be set.`)
                alert(`${label_name} is a required value. It must be set.`)
                return
            }

            form_data[form_selects[i].getAttribute('name')] = null
        
        }else{

            form_data[form_selects[i].getAttribute('name')] = select_value
        }
    }

    return form_data
}


/**
 * 
 *      CREATE / Add Requests
 * 
 */
add_entry_form.addEventListener('submit', function (e) {
    
    // Stop the form from submitting
    e.preventDefault()

    var add_data = get_form_data('add')
    if (!add_data) {
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
})


/**
 * Adds a new value to the table. Used after successful CREATE requests.
 * 
 * @param {object} table_data Formatted sent back from the server
 * @param {object} raw_data Original data sent to the server
 */
function add_row_to_table (table_data, raw_data) {

    // Get a reference to the new row from the database query (last object)
    var parsed_data = JSON.parse(table_data)
    var new_row = parsed_data[parsed_data.length - 1]

    // Add the raw data to our count of entry data
    raw_data[ENTITY_ID_NAME] = parseInt(new_row[ENTITY_ID_NAME])       // Get the ID because it wasn't known
    all_entry_data.push(raw_data)

    // Create a row and 4 cells
    var row = document.createElement('TR')

    // For every entry in the table, create it
    for (var i = 0; i < table_map.length; i++) {

        var new_cell = document.createElement('TD')
        new_cell.innerText = new_row[table_map[i]]

        row.appendChild(new_cell)
    }

    row.setAttribute('data-id', new_row[ENTITY_ID_NAME])      // Get the id name

    // Add the row to the table
    data_table.appendChild(row)

    // Now add it to the select elements too
    var entry_selects = document.getElementsByClassName('entry_select')
    for (var i = 0; i < entry_selects.length; i++) {

        entry_selects[i].insertAdjacentHTML('beforeend', 
                                            `<option value="${new_row[ENTITY_ID_NAME]}">
                                            ${get_entry_name(new_row)}</option>`)
    }
}


/**
 * 
 *      UPDATE Requests
 * 
 */

/**
 * Sets the input-element values in the update form based on the
 * passed-in data.
 * 
 * @param {object} selected_entry 
 */
function set_update_form_values(selected_entry) {

    var update_inputs = update_entry_form.getElementsByTagName('input')
    var update_textareas = update_entry_form.getElementsByTagName('textarea')
    var update_selects = update_entry_form.getElementsByTagName('select')

    // Update the INPUTS to match the argument data
    for (var i = 0; i < update_inputs.length; i++) {

        if (update_inputs[i].getAttribute('type') === 'checkbox') {

            update_inputs[i].checked = Boolean(selected_entry[update_inputs[i].getAttribute('name')])
        
        }else if (update_inputs[i].getAttribute('type') === 'number') {

            // Remove commas if the number has them
            var number_value = selected_entry[update_inputs[i].getAttribute('name')]
            if (typeof number_value === 'string'){

                number_value = parseInt(number_value.replaceAll(',', ''))
            }
            update_inputs[i].value = number_value
        
        }else{

            update_inputs[i].value = selected_entry[update_inputs[i].getAttribute('name')]
        }
    }

    // Update the TEXTAREAS to match the argument data
    for (var i = 0; i < update_textareas.length; i++) {

        update_textareas[i].value = selected_entry[update_textareas[i].getAttribute('name')]
    }

    // Update the SELECTS to match the argument data
    for (var i = 0; i < update_selects.length; i++) {

        // Skip the select that is for selecting entity entries
        if (update_selects[i].classList.contains('entry_select')) {

            continue
        }

        // If the value is null, set it to -1
        update_selects[i].value = selected_entry[update_selects[i].getAttribute('name')] || -1
    }
}


/** 
 * Change the update-boxes when a new value is selected
 */
select_update.addEventListener('change', (e) => {

    new_id_value = parseInt(select_update.value)

    if (new_id_value === -1) {     // No entry selected

        update_entry_form.reset()
        return
    }

    if (!all_entry_data)  // If entry data has not loaded properly, don't set the columns
        return

    // Otherwise, fill the data in corresponding to the id
    var selected_entry = (all_entry_data.find(obj => obj[ENTITY_ID_NAME] === new_id_value))

    set_update_form_values(selected_entry)
})


/**
 * Autofill the UPDATE form based on what was selected
 */
update_entry_form.addEventListener('submit', function (e) {
   
    // Prevent the form from submitting
    e.preventDefault()

    var input_id = parseInt(select_update.value)

    if (input_id === -1)       // This is the "no selection" value
        return

    var update_data = get_form_data('update')
    update_data[ENTITY_ID_NAME] = input_id          // Notate which form we're editing

    // Setup our AJAX request
    var xhttp = new XMLHttpRequest()
    xhttp.open('PUT', '/update/' + PAGE_ENTITY, true)
    xhttp.setRequestHeader('Content-type', 'application/json')

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            // Add the new data to the table
            update_row(xhttp.response, input_id)
            update_entry_form.reset()

            // Update the running list of entries
            const idx_update = all_entry_data.findIndex(obj => obj[ENTITY_ID_NAME] === input_id)
            all_entry_data[idx_update] = update_data
        }
        else if (xhttp.readyState == 4 && xhttp.status != 200) {
            alert('There was an error with the input.')
            console.error('There was an error with the input.')
        }
    }

    // Send the request and wait for the response
    xhttp.send(JSON.stringify(update_data))

})


/**
 * Updates the table based on data from a new entry. Called after
 * successful UPDATE requests.
 * 
 * @param {object} data 
 * @param {Number | String} entry_id 
 */
function update_row(data, entry_id) {

    var parsed_data = JSON.parse(data)
    var entry_id = parseInt(entry_id)

    // Update table
    var table_rows = data_table.getElementsByTagName('tr')

    // Iterate until we reach the row-to-be-edited
    for (var i = 1; i < table_rows.length; i++) {

        // If we have reached the target row, edit it
        if (parseInt(table_rows[i].getAttribute('data-id')) === entry_id) {

            var table_columns = table_rows[i].getElementsByTagName('td')
            
            for (var col = 1; col < table_columns.length; col++) {

                // One by one, use the map to insert data
                table_columns[col].innerText = parsed_data[table_map[col]]
            }
            break
        }
    }

    // Now update the name on every single drop-down for that entity
    var entry_selects = document.getElementsByClassName('entry_select')
    for (var j = 0; j < entry_selects.length; j++) {

        // Delete the option in the drop down:
        for (var opt_index = 0; opt_index < entry_selects[j].length; opt_index++) {

            if (parseInt(entry_selects[j].options[opt_index].value) === entry_id) {

                entry_selects[j].options[opt_index].innerText = get_entry_name(parsed_data)
                break
            }   
        }
    }
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

    var delete_id = parseInt(select_delete.value)

    if (delete_id === -1)       // This is the "no selection" value
        return

    var data = {
        id: delete_id
    }

    // Setup our AJAX request
    var xhttp = new XMLHttpRequest()
    xhttp.open('DELETE', '/delete/' + PAGE_ENTITY, true)
    xhttp.setRequestHeader('Content-type', 'application/json')

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 204) {

            // Remove the row from the table if successful
            delete_row(delete_id)

        }
        else if (xhttp.readyState == 4 && xhttp.status != 204) {
            console.error('There was an error with the input.')
            alert('There was an error with the input.')
        }
    }

    // Send the request and wait for the response
    xhttp.send(JSON.stringify(data))
})


/**
 * Given an entry ID, deletes that entry from the table. Called
 * afer a successful DELETE request.
 * 
 * @param {Number} entry_id 
 */
function delete_row(entry_id) {

    // Delete the entry from the running list
    const idx_delete = all_entry_data.findIndex(obj => obj[ENTITY_ID_NAME] === entry_id)
    all_entry_data.splice(idx_delete, 1)

    // Delete from table
    for (var i = 0, row; row = data_table.rows[i]; i++) {
        // Iterate through rows
        // Rows would be accessed using the 'row' variable assigned in the for loop
        if (parseInt(data_table.rows[i].getAttribute('data-id')) === entry_id) {

            data_table.deleteRow(i)
            break
        }
    }

    // Now delete it from every single drop-down for that entity
    var entry_selects = document.getElementsByClassName('entry_select')
    for (var j = 0; j < entry_selects.length; j++) {

        // Delete the option in the drop down:
        for (var opt_index = 0; opt_index < entry_selects[j].length; opt_index++) {

            if (parseInt(entry_selects[j].options[opt_index].value) === entry_id) {

                entry_selects[j].remove(opt_index)
                break
            }   
        }
    }
}
