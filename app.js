const express = require('express');
const app = express();
var path = require('path');


app.set('view engine','ejs');
app.use(express.urlencoded({extended:false}));
app.use(express.json());



app.use('/', require('./router'));


app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'public/css')));
app.use(express.static(path.join(__dirname,'public/img')));
app.use(express.static(path.join(__dirname,'public/js')));


app.listen(3000, ()=>{
    console.log('SERVER corriendo en http://localhost:3000');
});