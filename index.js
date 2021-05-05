const express = require("express");
const app = express();
const routes = require('./src/routers/index');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');

dotenv.config();

// body parser
app.use(express.urlencoded({extended: false}))
app.use(bodyParser.json())

// static files
app.use(express.static(path.join(__dirname, 'public')))

//template engine 
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug');

//router
app.use("/", routes);
app.all('*', (req, res, next) => {
    const err = new Error(`Requested url ${req.path} not found`);
    err.statusCode = 404;
    next(err)
});

app.use((err, req, res, next)=> {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: 0,
        message: err.message,
        stack: err.stack
    })
})


//hadeling 400 error route 
app.use((req, res, next) => {
    const err = new Error('Page not found');
    err.status = 404
    next(err)
})

//handeling error
app.use((err, req, res, next)=> {
    res.status(err.status || 500).send(err.message)
})

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log(`Listening to port ${port}`));