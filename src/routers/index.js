const express = require("express");
const router = express.Router();
const pool = require('../../db/connect');
const moment = require('moment');
const bcrypt = require('bcrypt');

// get homepage (index page)
router.get('/', (req, res)=> {
    res.render('index', { title: 'My Application'})
});


//post register router
router.post('/register',async (req, res, next)=> {
    const {username, age, phone, dob, password} = req.body
    const hashedPassword = await bcrypt.hash(password, 10);
    let sql = `INSERT INTO info (name, age, phone_number, date_of_birth, password) VALUES ("${username}",${age},${phone},"${dob}","${hashedPassword}");`
    
    try {
        await pool.query(sql, function(err, result) {
            if(err) throw new res.status(400).send(err.message)
            if(result.length === 0) res.status(404).send('No records inserted');
            res.status(200).send("<h1>You have been registered successfully , Please go back and <link>login now</link></h1> ")
        });
    } catch(err) {
        next(err);
    }
    
});

//post login router
router.post('/login', async (req, res, next)=> {
    try {
        const { username, password } = req.body;    
        let sql = `SELECT * FROM info WHERE name = "${username}"`;
        await pool.query(sql, async (err, result) =>{
            if(err) throw res.status(400).send(err.message)
            if(result.length === 0) res.status(404).send(`<h2>No records found</h2>`)
            const comparePass = await bcrypt.compare(password, result[0].password)
            if(comparePass) {
                res.status(200).send(`<h1>You are logged in...<h1>`)
            } else {
                res.status(404).send('<h2>Wrong credentials..Please try again</h2>')
            }
        })
    } catch(error) {
        next(err)
    }
});

//to insert bulk values as request body 
router.post('/bulk', async (req, res)=> {
    const entries = []
    req.body.map(value => { 
        let arr = Object.values(value);
        entries.push(arr)
    })
    const query = "INSERT INTO info (name, age, phone_number, date_of_birth) VALUES ?";
    if(entries.length !== 0) {
        await pool.query(query, [entries], (err, result)=> {
            if(err) res.status(400).send(err.message)
            res.send({message: 'Data updated successfully', data: result})
        })
    }
    
});
//To get the records based on either date of birth(MM/DD/YYYY) or Name
router.get('/records', async (req, res)=> {
    try {
        const { date, name } = req.query;
        let queryValue;
        if(date) {
            queryValue = moment(date).format('YYYY/MM/DD');
        } else {
            queryValue = name;
        }
        const value = typeof(date) === 'undefined' ? 'name' : 'date_of_birth';
        const query = `SELECT * FROM info WHERE ${value}='${queryValue}'`;
        await pool.query(query, (err, result)=> {
            if(err) {
                return res.status(400).send(err.message)
            } else if(result.length <= 1) {
                res.status(404).send('ERROR ! No records found')
            } else {
                res.send(result);
            }
            
        })
    } catch(err) {
        res.status(400).send(err.message)
    }
});

router.post('/users', async (req, res) => {
    const users = [];
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = { name: req.body.name, password: hashedPassword}
        users.push(user);
        res.status(201).send(users)
    } catch(err) {
        res.status(500),send(err.message)
    }
})

module.exports = router;