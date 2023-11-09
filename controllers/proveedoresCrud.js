//Invocamos a la conexion de la DB
const conexion = require('../database/db');


//GUARDAR un REGISTRO
exports.saveProveedores = (req, res)=>{

    const nombre = req.body.nombre;
    const correo = req.body.correo;
    const contacto = req.body.contacto;
    const telefono = req.body.telefono;
    const direccion = req.body.direccion;
    const nit = req.body.nit;


    conexion.query('INSERT INTO proveedor SET ?',{nombre:nombre, correo:correo,contacto:contacto,telefono:telefono,direccion:direccion,nit:nit}, (error, results)=>{
        if(error){
            console.log(error);
        }else{
            //console.log(results);   
            res.redirect('proveedores.ejs');         
        }
});
};


//ACTUALIZAR un REGISTRO
exports.updateProveedores = (req, res)=>{

    const idproveedor = req.body.idproveedor;
    const nombre = req.body.nombre;
    const correo = req.body.correo;
    const contacto = req.body.contacto;
    const telefono = req.body.telefono;
    const direccion = req.body.direccion;
    const nit = req.body.nit;

    conexion.query('UPDATE proveedor SET ? WHERE idproveedor = ?',[{nombre:nombre, correo:correo,contacto:contacto,telefono:telefono,direccion:direccion,nit:nit}, idproveedor], (error, results)=>{
        if(error){
            console.log(error);
        }else{           
            res.redirect('proveedores.ejs');         
        }
});
};