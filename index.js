
const cors = require('cors');
const express = require('express');

const compression = require('compression')
const dotenv = require('dotenv');


 
dotenv.config();







const app = express();
app.use(compression({level:6}));

app.use(cors())
app.use(express.json());

const routes = require('./routes/routes');

app.use('/api', routes)




var mysql = require('mysql');
var con=mysql.createConnection({
  multipleStatements: true,

  
  ssl: {
    rejectUnauthorized: false
  },
  host:"forteennew.mysql.database.azure.com",user:"prateek", password:"Sis#1605",database:"fourteen", port:3306,timeout:5000, });

con.connect(function(err) { 
  console.log("Connected!"); 
});  



app.listen( 3001, () => {
  console.log(`Server Started at ${3000}`) 
})  



/* app.listen( process.env.PORT, () => {
    console.log(`Server Started at ${3000}`) 
}) */
  
