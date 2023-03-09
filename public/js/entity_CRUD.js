/**
 * 
 *      Functions for the CREATE, some READ, UPDATE, and DELETE functions for entities
 * 
 */


// Outline of tasks left:

// 1. Complete UPDATE crud automation
// 2. Format this .js file for readability--organize globals into a section
//      and comment every fuction
//          2a. Write a header to describe functionality of this file
// 3. Provide Checks for Uniqueness
// 4. Set up updating with null values



/**
 * 
 *      Setup - define important variable "all_entry_data"
 * 
 */

/**
 * @returns A promise that carries the entity database data
 */
async function get_initial_data(){

    try{
        const response_data = await fetch('/entity_json/missions', {
            'method': 'GET'
        })

        return await response_data.json()
    
    }catch(error){
        alert('Error:', error)
    }
}
var all_entry_data = undefined
get_initial_data()
    .then((res) => {all_entry_data = res})
    .catch((err) => {alert('Error: initial data not downloaded:', err)})

var data_table = document.getElementById('data_table')
const PAGE_ENTITY = data_table.getAttribute('data-entity')

const MISSIONS_TABLE_MAP = [

    'mission_id',
    'name',
    'description',
    'launch_date',
    'successful_completion',
    'organization_name'
]

var table_map               // Table_map
switch(PAGE_ENTITY){

    case 'missions':
        table_map = MISSIONS_TABLE_MAP
        break

    // case 'crew_members':
    //     table_map = CREW_MEMBERS_TABLE_MAP
    //      table_map[name] = table_map[first_name] + table_map[last_name]
    //     break
    
    // case 'organizations':
    //     table_map = ORGANIZATIONS_TABLE_MAP
    //     break

    // case 'external_sites':
    //     table_map = EXTERNAL_SITES_TABLE_MAP
    //     break

    default:
        alert(`Table map fpr ${PAGE_ENTITY} not set up.`)
        console.error(`Table map fpr ${PAGE_ENTITY} not set up.`)
}

const ENTITY_ID_NAME = table_map[0]




/**
 * 
 *      Code for CREATE-ing, AKA Add-ing
 * 
 */
var add_entry_form = document.getElementById('add_form')

function find_label_by_for(input_id) {
    
    input_id = input_id.toString()
    all_labels = document.getElementsByTagName('label')

    for(var i = 0; i < all_labels.length; i++) {

        if (all_labels[i].getAttribute('for') === input_id)
            return all_labels[i]
    }
 }


 /**
  * 
  * @returns undefined if the forms were not filled out properly, otherwise
  *         an object a JS object with data from the add forms 
  */
function get_add_form_data(){

    // Get all types of input:
    var add_inputs = add_entry_form.getElementsByTagName('input')
    var add_textareas = add_entry_form.getElementsByTagName('textarea')
    var add_selects = add_entry_form.getElementsByTagName('select')

    var add_data = {}

    // Add INPUT information to the add_data object
    for(var i = 0; i < add_inputs.length; i++){

        var data_type = add_inputs[i].getAttribute('type')

        switch(data_type){

            case 'text':

                // NULL value check:
                if(add_inputs[i].value === '' || add_inputs[i].value.toUpperCase() === 'NULL'){

                    // Check if we allow NULL values
                    if(add_inputs[i].hasAttribute('required')){

                        // Don't continue--required condition not met
                        const label_name = find_label_by_for(add_inputs[i].id).innerText

                        console.warn(`${label_name} is a required value. It must be set.`)
                        alert(`${label_name} is a required value. It must be set.`)
                        return
                    }

                    add_data[add_inputs[i].getAttribute('name')] = null
                
                }else{

                    add_data[add_inputs[i].getAttribute('name')] = add_inputs[i].value
                }
                break

            case 'date':

                // NULL value check:
                if(!Date.parse(add_inputs[i].value)){

                    // Check if we allow NULL values
                    if(add_inputs[i].hasAttribute('required')){

                        // Don't continue--required condition not met
                        const label_name = find_label_by_for(add_inputs[i].id).innerText

                        console.warn(`${label_name} is a required value. It must be set.`)
                        alert(`${label_name} is a required value. It must be set.`)
                        return
                    }

                    add_data[add_inputs[i].getAttribute('name')] = null
            
                }else{

                    add_data[add_inputs[i].getAttribute('name')] = add_inputs[i].value
                }
                break

            case 'checkbox':
                
                add_data[add_inputs[i].getAttribute('name')] = add_inputs[i].checked
                break

            default:
                console.error(add_inputs[i], 'does not have its input type set.')
        }
    }

    // Add TEXTAREA information to the add_data object
    for(var i = 0; i < add_textareas.length; i++){

        // NULL value check:
        if(add_textareas[i].value === '' || add_textareas[i].value.toUpperCase() === 'NULL'){

            // Check if we allow NULL values
            if(add_textareas[i].hasAttribute('required')){

                // Don't continue--required condition not met
                const label_name = find_label_by_for(add_textareas[i].id).innerText

                console.warn(`${label_name} is a required value. It must be set.`)
                alert(`${label_name} is a required value. It must be set.`)
                return
            }

            add_data[add_textareas[i].getAttribute('name')] = null
                
        }else{

            add_data[add_textareas[i].getAttribute('name')] = add_textareas[i].value
        }
    }

    // Add SELECT information to the add_data object
    for(var i = 0; i < add_selects.length; i++){

        var select_value = parseInt(add_selects[i].value) || -1

        // NULL value check (NULL select values are -1)
        if(select_value === -1){

            // Check if we allow NULL values
            if(add_selects[i].hasAttribute('required')){

                // Don't continue--required condition not met
                const label_name = find_label_by_for(add_selects[i].id).innerText

                console.warn(`${label_name} is a required value. It must be set.`)
                alert(`${label_name} is a required value. It must be set.`)
                return
            }

            add_data[add_selects[i].getAttribute('name')] = null
        
        }else{

            add_data[add_selects[i].getAttribute('name')] = select_value
        }
    }

    return add_data
}


add_entry_form.addEventListener('submit', function (e) {
    
    // Stop the form from submitting
    e.preventDefault()

    var add_data = get_add_form_data()
    if(!add_data){
        return
    }

    // Setup our AJAX request
    var xhttp = new XMLHttpRequest()
    xhttp.open('POST', '/add/missions', true)
    xhttp.setRequestHeader('Content-type', 'application/json')

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            // Add the new data to the table
            add_row_to_table(xhttp.response)

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

// Adds the new value to the table
add_row_to_table = (data) => {

    // Get a reference to the new row from the database query (last object)
    var parsed_data = JSON.parse(data)
    var new_row = parsed_data[parsed_data.length - 1]

    // Add the new entry to the running list
    all_entry_data.push(new_row)

    // Create a row and 4 cells
    var row = document.createElement('TR')

    // For every entry in the table, create it
    for(var i = 0; i < table_map.length; i++){

        var new_cell = document.createElement('TD')
        new_cell.innerText = new_row[table_map[i]]

        row.appendChild(new_cell)
    }

    row.setAttribute('data-id', new_row[ENTITY_ID_NAME])      // Get the id name

    // Add the row to the table
    data_table.appendChild(row)

    // Now add it to the select elements too
    var entry_selects = document.getElementsByClassName('entry_select')
    for(var i = 0; i < entry_selects.length; i++){
        
        // TODO: Implement this for CREW MEMBERS

        entry_selects[i].insertAdjacentHTML('beforeend', 
                                            `<option value="${new_row[ENTITY_ID_NAME]}">${new_row['name']}</option>`)
    }
}

/**
 * 
 *      Code for UPDATE-ing
 * 
 */
var update_entry_form = document.getElementById('update_form')
var select_update = document.getElementById('entry_select_update')


/**
 * Sets the input-element values in the update form based on the
 * passed-in data 
 * 
 * @param {object} selected_entry 
 */
function set_update_form_values(selected_entry){

    var update_inputs = update_entry_form.getElementsByTagName('input')
    var update_textareas = update_entry_form.getElementsByTagName('textarea')
    var update_selects = update_entry_form.getElementsByTagName('select')

    // Update the INPUTS to match the argument data
    for(var i = 0; i < update_inputs.length; i++){

        if(update_inputs[i].getAttribute('type') === 'checkbox'){

            update_inputs[i].checked = Boolean(selected_entry[update_inputs[i].getAttribute('name')])
        
        }else{

            update_inputs[i].value = selected_entry[update_inputs[i].getAttribute('name')]
        }
    }

    // Update the TEXTAREAS to match the argument data
    for(var i = 0; i < update_textareas.length; i++){

        update_textareas[i].value = selected_entry[update_textareas[i].getAttribute('name')]
    }

    // Update the SELECTS to match the argument data
    for(var i = 0; i < update_selects.length; i++){

        // Skip the select that is for selecting entity entries
        if(update_selects[i].classList.contains('entry_select')){

            continue
        }

        update_selects[i].value = selected_entry[update_selects[i].getAttribute('name')]
    }
}


/** 
 * Change the update-boxes when a new value is selected
 */
select_update.addEventListener('change', (e) => {

    new_id_value = parseInt(select_update.value)

    if(new_id_value == -1){     // No entry selected

        update_entry_form.reset()
        return
    }

    if(!all_entry_data)  // If entry data has not loaded properly, don't set the columns
        return

    // Otherwise, fill the data in corresponding to the id
    var selected_entry = (all_entry_data.find(obj => obj[ENTITY_ID_NAME] === new_id_value))

    set_update_form_values(selected_entry)
})



// Modify the objects we need
update_entry_form.addEventListener('submit', function (e) {
   
    // Prevent the form from submitting
    e.preventDefault()

    if(select_update.value == -1)       // This is the "no selection" value
        return

    // get form fields
    var input_id = select_update.value          // Add this AFTER CONSTRUCTING THE DATA??


    var input_name = document.getElementById('update_name').value
    var input_desc = document.getElementById('update_description').value
    var input_launch_date = document.getElementById('update_launch_date').value
    var input_succ = document.getElementById('update_successful_completion').checked.toString().toUpperCase()
    var input_org_id = document.getElementById('update_organization_select').value

    input_org_id = parseInt(input_org_id)
    if(input_org_id === -1){
        input_org_id = 'NULL'
    }

    // Put our data we want to send in a javascript object
    var data = {
        'mission_id': input_id,
        'name': input_name,
        'description': input_desc,
        'launch_date': input_launch_date,
        'successful_completion': input_succ,
        'organization_id': input_org_id
    }
    
    // Setup our AJAX request
    var xhttp = new XMLHttpRequest()
    xhttp.open('PUT', '/update/missions', true)
    xhttp.setRequestHeader('Content-type', 'application/json')

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            // Add the new data to the table
            update_row(xhttp.response, input_id)
            update_entry_form.reset()

        }
        else if (xhttp.readyState == 4 && xhttp.status != 200) {
            alert('There was an error with the input.')
            console.log('There was an error with the input.')
        }
    }

    // Send the request and wait for the response
    xhttp.send(JSON.stringify(data))

})




function update_row(data, entry_id){


    var parsed_data = JSON.parse(data)
    var entry_id = parseInt(entry_id)

    // Update the running list of entries
    const idx_update = all_entry_data.findIndex(obj => obj.mission_id === entry_id)
    all_entry_data[idx_update] = parsed_data

    // Update table
    var table_rows = data_table.getElementsByTagName('tr')

    for (var i = 1; i < table_rows.length; i++) {

        // iterate through rows
        // rows would be accessed using the "row" variable assigned in the for loop
        if (parseInt(table_rows[i].getAttribute('data-id')) === entry_id) {

            // Get td of homeworld value
            table_rows[i].getElementsByTagName('td')[1].innerText = parsed_data.name
            table_rows[i].getElementsByTagName('td')[2].innerText = parsed_data.description
            table_rows[i].getElementsByTagName('td')[3].innerText = parsed_data.launch_date
            table_rows[i].getElementsByTagName('td')[4].innerText = parsed_data.successful_completion
            table_rows[i].getElementsByTagName('td')[5].innerText = parsed_data.organization_name

            break
        }
    }
}


/**
 * 
 *      Code for DELETE-ing
 * 
 */
// Get the objects we need to modify
var delete_entry_form = document.getElementById('delete_form')


delete_entry_form.addEventListener('submit', function (e) {

    // Stop the form from submitting
    e.preventDefault()

    var delete_id = document.getElementById('delete_select').value
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
            console.log('There was an error with the input.')
            alert('There was an error with the input.')
        }
    }

    // Send the request and wait for the response
    xhttp.send(JSON.stringify(data))
})


function delete_row(entry_id){

    // Delete the entry from the running list
    const idx_delete = all_entry_data.findIndex(obj => obj[ENTITY_ID_NAME] === entry_id)
    all_entry_data.splice(idx_delete, 1)

    // Delete from table
    for (var i = 0, row; row = data_table.rows[i]; i++) {
        // Iterate through rows
        // Rows would be accessed using the 'row' variable assigned in the for loop
        if (data_table.rows[i].getAttribute('data-id') == entry_id) {

            data_table.deleteRow(i)
            break
        }
    }

    // Now delete it from every single drop-down for that entity
    var entry_selects = document.getElementsByClassName('entry_select')
    for(var j = 0; j < entry_selects.length; j++){

        // Delete the option in the drop down:
        for(var opt_index = 0; opt_index < entry_selects[j].length; opt_index++){

            if(entry_selects[j].options[opt_index].value == entry_id){

                entry_selects[j].remove(opt_index)
                break
            }   
        }
    }
}
