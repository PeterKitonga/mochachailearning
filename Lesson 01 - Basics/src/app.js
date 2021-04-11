const path = require('path');
const express = require('express');
const methodOverride = require('method-override');

const app = express();
const port = 8180;

app.set('view engine', 'ejs') // tells express which template engine is in use
app.set('views', 'views') // tells express where our template files

// here we load files statically from the public folder
// it gives read access to the files in this folder
app.use(express.static(path.join(__dirname, 'public')));

// body parser
app.use(express.urlencoded({ extended: false }));

// allows for methods like PUT and DELETE in forms
app.use(methodOverride('_method'));

// mount the nodejs app to a port
app.listen(port, () => {
    console.log(`Server running at: http://127.0.0.1:${port}`);
    console.log('Hit CTRL-C to stop the server');
});