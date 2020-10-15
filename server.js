const express = require('express');
const sqlite3 = require('sqlite3').verbose();

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
    const sql = `SELECT * FROM candidates`;
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
    const sql = `SELECT * FROM candidates
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

//CREATING A NEW CANDIDATE
// const sql = `INSERT INTO candidates (id, first_name, last_name, industry_connected) VALUES(?,?,?,?)`;
// const params = [1,'Ronald', 'Firbank', 1];
// db.run(sql, params, function(err, result){
//     if(err) {
//         console.log(err);
//     }
//     console.log(result, this.lastID);
// });



//CATCH ALL FOR THE PAGES THAT AREN'T THERE
app.use((req, res) => {
    res.status(404).end();
});

db.on('open', () => {
    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
    });
});