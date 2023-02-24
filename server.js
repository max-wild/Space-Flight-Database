var express = require("express")
var exphbs = require("express-handlebars")

const PORT = process.env.PORT || 23374;
var app = express();

// Setting the view engine
app.engine('handlebars', exphbs.engine({

    'defaultLayout': 'main'  // Referencing views/layouts/main.handlebars
}))   
app.set('view engine', 'handlebars')


app.use(express.urlencoded({ extended: false }))  // Lets us see information in the body from sent html forms
app.use(express.static('public'))



//*********************************
//
// ROUTES
//
//*********************************

var db_entities = [
    'crew_members',
    'external_sites',
    'missions',
    'organizations',
    'missions_crew_members',
    'missions_external_sites'
]

// Send it to the right entity if requested
app.get('/:entity', (req, res, next) => {

    var entity_name = req.params.entity.toLowerCase()

    if(db_entities.includes(entity_name)){

        res.status(200).render('tables/' + entity_name)  // Renders views/tables/[entity].handlebars
    
    }else{

        next()
    }
})


// Basic 'send everything to home'
app.get('*', (req, res, next) => {

    res.status(200).render('pages/home')  // Renders views/pages/home.handlebars
})


app.listen(PORT, function (err) {

    if (err) {
        console.log("Error!:", err)
        throw err;
    
    }else{

        console.log("== Server listening on port", PORT);
    }
    
})
