const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const inputCheck = require('./utils/inputCheck');

const PORT = process.env.PORT || 3001;
const app = express();
//EXPRESS MIDDLEWARE
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//CONNECTING TO DATABASE
const db = new sqlite3.Database('./db/election.db', err =>{
    if(err){
        return console.log(err.message)
    }
    console.log("Database connected");
})

//SELECTING ALL OF THE CANDIDATES
app.get('/api/candidates', (req, res) => {
    const sql = `SELECT candidates.*, parties.name
                AS party_name
                FROM candidates
                LEFT JOIN parties
                ON candidates.party_id = parties.id`;
    const params = [];
    db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
  
      res.json({
        message: 'success',
        data: rows
      });
    });
  });

//SELECTING JUST ONE CANDIDATE
app.get('/api/candidate/:id', (req,res) => {
    const sql = `SELECT candidates.*, parties.name
                AS party_name
                FROM candidates
                LEFT JOIN parties
                ON candidates.party_id = parties.id
                WHERE id = ?`;
    const params = [req.params.id];

    db.get(sql,params, (err, row) => {
        if(err) {
            res.status(400).json({error: err.message});
            return
        }
        res.json({
            message: "success",
            data: row
        });
    });
});

//DELETING AN ENTRY IN THE DB
app.delete('/api/candidate/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];
    db.run(sql, params, function(err,result){
      if(err) {
        res.status(400).json({ err: res.message });
        return;
      }
  
      res.json({
        message: 'successfully deleted',
        changes: this.changes
      });
    });
  });


// Create a candidate
app.post('/api/candidate', ({ body }, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
      res.status(400).json({ error: errors });
      return;
    }
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected) VALUES (?,?,?)`;
        const params = [body.first_name, body.last_name, body.industry_connected];
        // ES5 function, not arrow function, to use `this`
        db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: body,
            id: this.lastID
        });
    });
  });

//ALL PARTIES
app.get('/api/parties',(req, res) => {
    const sql = `SELECT * FROM parties`;
    const params = [];
    db.all(sql, params, (err, rows)=> {
        if(err){
            res.send(500).json({error: err.message});
            return;
        }
        res.json({
            message: "success",
            data: rows 
        });
    })
})
//SPECIFIC PARTIES
app.get('/api/party/:id',(req, res)=> {
    const sql = `SELECT * FROM parties WHERE id = ?`;
    const params = [req.params.id];
    db.all(sql, params, (err, row) =>{
        if(err){
            res.send(400).json({error: err.message});
            return;
        }
        res.json({
            message: "success",
            data: row   
        });
    });
});
//DELETE A PARTY
app.delete('/api/party/:id',(req, res)=> {
    const sql = `SELECT * FROM parties WHERE id = ?`;
    const params = [req.params.id];
    db.run(sql, params, function(err, result){
        if(err){
            res.send(500).json({error: err.message});
            return;
        }
        res.json({ message: 'successfully deleted', changes: this.changes});
    });
});
//UPDATING A PARTY
app.put('/api/candidate/:id', (req, res) => {
    const errors = inputCheck(req.body, 'party_id');

    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }
    const sql = `UPDATE candidates SET party_id = ? 
                 WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];
  
    db.run(sql, params, function(err, result) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
  
      res.json({
        message: 'success',
        data: req.body,
        changes: this.changes
      });
    });
  });


//CATCH ALL FOR THE PAGES THAT AREN'T THERE
app.use((req, res) => {
    res.status(404).end();
});

db.on('open', () => {
    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
    });
});