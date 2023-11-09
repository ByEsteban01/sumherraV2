//Invocamos a la conexion de la DB
const conexion = require('../database/db');





//ACTUALIZAR un REGISTRO
exports.updateProducto = (req, res)=>{

    const idProducto = req.body.idProducto;
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;

    conexion.query('UPDATE producto SET ? WHERE idProducto = ?',[{nombre:nombre, descripcion:descripcion}, idProducto], (error, results)=>{
        if(error){
            console.log(error);
        }else{           
            res.redirect('producto.ejs');         
        }
});
};