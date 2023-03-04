/**
 * 
 *      Functions for the CREATE, some READ, UPDATE, and DELETE functions for entities
 * 
 */


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



/**
 * 
 *      Code for CREATE-ing, AKA Add-ing
 * 
 */
var add_entry_form = document.getElementById('add_form')

add_entry_form.addEventListener('submit', function (e) {
    
    // Stop the form from submitting
    e.preventDefault()

    // Get form fields we need to get data from
    var input_name = document.getElementById('add_name')
    var input_desc = document.getElementById('add_description')
    var input_launch_date = document.getElementById('add_launch_date')
    var input_succ = document.getElementById('add_successful_completion')
    var input_org_select = document.getElementById('add_organization_select')

    // Get the values from the form fields
    var name_val = input_name.value
    var description_val = input_desc.value
    var launch_date_val = input_launch_date.value
    var successful_completion_val = input_succ.checked
    var organization_id_val = input_org_select.value

    organization_id_val = parseInt(organization_id_val)
    if(organization_id_val === -1){
        organization_id_val = 'NULL'
    }

    // Put our data we want to send in a javascript object
    var data = {
        'name': name_val,
        'description': description_val,
        'launch_date': launch_date_val,
        'successful_completion': successful_completion_val,
        'organization_id': organization_id_val
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
    xhttp.send(JSON.stringify(data))

})

// Adds the new value to the table
add_row_to_table = (data) => {

    // Get a reference to the current table on the page and clear it out.
    var current_table = document.getElementById('data_table')

    // Get a reference to the new row from the database query (last object)
    var parsed_data = JSON.parse(data)
    var new_row = parsed_data[parsed_data.length - 1]

    // Create a row and 4 cells
    var row = document.createElement('TR')
    var id_cell = document.createElement('TD')
    var name_cell = document.createElement('TD')
    var desc_cell = document.createElement('TD')
    var launch_date_cell = document.createElement('TD')
    var succ_cell = document.createElement('TD')
    var org_cell = document.createElement('TD')

    // Fill the cells with correct data
    id_cell.innerText = new_row.mission_id
    name_cell.innerText = new_row.name
    desc_cell.innerText = new_row.description
    launch_date_cell.innerText = new_row.launch_date
    succ_cell.innerText = new_row.successful_completion
    org_cell.innerText = new_row.organization_name

    // Add the cells to the row 
    row.appendChild(id_cell)
    row.appendChild(name_cell)
    row.appendChild(desc_cell)
    row.appendChild(launch_date_cell)
    row.appendChild(succ_cell)
    row.appendChild(org_cell)
    
    // Add a row attribute so the deleteRow function can find a newly added row
    row.setAttribute('data_value', new_row.mission_id)

    // Add the row to the table
    current_table.appendChild(row)

    // Now add it to the select elements too
    var entry_selects = document.getElementsByClassName('entry_select')
    for(var i = 0; i < entry_selects.length; i++){

        entry_selects[i].insertAdjacentHTML('beforeend', 
                                            `<option value="${new_row.mission_id}">${new_row.name}</option>`)
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
 * Change the update-boxes when a new value is selected
 */
select_update.addEventListener('change', (e) => {

    new_id_value = select_update.value

    if(new_id_value == -1){     // No entry selected

        update_entry_form.reset()
        return
    }

    if(!all_entry_data)  // If entry data has not loaded properly, don't set the columns
        return

    // Otherwise, fill the data in corresponding to the id
    var selected_entry = (all_entry_data.find(obj => obj.mission_id == new_id_value))

    document.getElementById('update_name').value = selected_entry.name
    document.getElementById('update_description').value = selected_entry.description
    document.getElementById('update_launch_date').value = selected_entry.launch_date
    document.getElementById('update_successful_completion').checked = Boolean(selected_entry.successful_completion)
    document.getElementById('update_organization_select').value = selected_entry.organization_id
})



// Modify the objects we need
update_entry_form.addEventListener('submit', function (e) {
   
    // Prevent the form from submitting
    e.preventDefault()

    if(select_update.value == -1)       // This is the "no selection" value
        return

    // get form fields
    var input_id = select_update.value
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

    var table = document.getElementById('data_table')
    var table_rows = table.getElementsByTagName('tr')

    for (var i = 1; i < table_rows.length; i++) {

        // iterate through rows
        // rows would be accessed using the "row" variable assigned in the for loop
        if (table_rows[i].getAttribute('data_value') == entry_id) {

            // Get td of homeworld value
            table_rows[i].getElementsByTagName('td')[1].innerText = parsed_data.name
            table_rows[i].getElementsByTagName('td')[2].innerText = parsed_data.description
            table_rows[i].getElementsByTagName('td')[3].innerText = parsed_data.launch_date
            table_rows[i].getElementsByTagName('td')[4].innerText = parsed_data.successful_completion
            table_rows[i].getElementsByTagName('td')[5].innerText = parsed_data.organization_name
        }
    }
}

// First TODO: SET UP UPDATING WITH NULL VALUES
// First TODO: SET UP UPDATING WITH NULL VALUES
// First TODO: SET UP UPDATING WITH NULL VALUES
// First TODO: SET UP UPDATING WITH NULL VALUES

// Then todo: Make updating / creating / deleting then delete the preloaded initial data




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
    xhttp.open('DELETE', '/delete/missions', true)
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

    var table = document.getElementById('data_table')
    for (var i = 0, row; row = table.rows[i]; i++) {
        // Iterate through rows
        // Rows would be accessed using the 'row' variable assigned in the for loop
        if (table.rows[i].getAttribute('data_value') == entry_id) {

            table.deleteRow(i)
            break
        }
    }

    // Now delete it from every single drop-down for that entity
    var entry_selects = document.getElementsByClassName('entry_select')
    for(var j = 0; j < entry_selects.length; j++){

        // For every option in the drop down:
        for(var opt_index = 0; opt_index < entry_selects[j].length; opt_index++){

            if(entry_selects[j].options[opt_index].value == entry_id){

                entry_selects[j].remove(opt_index)
                break
            }   
        }
    }
}
