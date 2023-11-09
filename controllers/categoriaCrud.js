//Invocamos a la conexion de la DB
const conexion = require('../database/db');


//GUARDAR un REGISTRO
exports.saveCategoria = (req, res)=>{
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    conexion.query('INSERT INTO categoria SET ?',{nombre:nombre, descripcion:descripcion}, (error, results)=>{
        if(error){
            console.log(error);
        }else{
            //console.log(results);   
            res.redirect('categoria.ejs');         
        }
});
};


//ACTUALIZAR un REGISTRO
exports.updateCategoria = (req, res)=>{
    const idcategoria = req.body.idcategoria;
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    conexion.query('UPDATE categoria SET ? WHERE idcategoria = ?',[{nombre:nombre, descripcion:descripcion}, idcategoria], (error, results)=>{
        if(error){
            console.log(error);
        }else{           
            res.redirect('categoria.ejs');         
        }
});
};