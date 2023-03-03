// Get the objects we need to modify
var addPersonForm = document.getElementById('add_mission_form')

// Modify the objects we need
addPersonForm.addEventListener('submit', function (e) {
    
    // Prevent the form from submitting
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
            addPersonForm.reset()
        }
        else if (xhttp.readyState == 4 && xhttp.status != 200) {

            alert('There was an error with the input.')
        }
    }

    // Send the request and wait for the response
    xhttp.send(JSON.stringify(data))

})


// Creates a single row from an Object representing a single record from 
// bsg_people
add_row_to_table = (data) => {

    // Get a reference to the current table on the page and clear it out.
    var current_table = document.getElementById('data_table')

    // Get the location where we should insert the new row (end of table)
    // var new_row_index = current_table.rows.length

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
    
    // Add the row to the table
    current_table.appendChild(row)
}
