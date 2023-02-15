var express = require("express")

const PORT = process.env.PORT || 4205;
var app = express();

app.use(express.urlencoded({ extended: false }))  // Let's us see information in the body from sent html forms
app.use(express.static('public'))


// Basic 'send everything to home'
app.get('*', (req, res, next) => {

    res.status(200).sendFile('public/home.html', {root: __dirname})
})


app.listen(PORT, function (err) {

    if (err) {
        console.log("Error!:", err)
        throw err;
    
    }else{

        console.log("== Server listening on port", PORT);
    }
    
})
