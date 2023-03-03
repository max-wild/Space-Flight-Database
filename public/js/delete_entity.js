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
