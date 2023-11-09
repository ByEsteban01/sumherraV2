//Invocamos a la conexion de la DB
const conexion = require('../database/db');

/*
//GUARDAR un REGISTRO
exports.saveEmpleado = (req, res)=>{

    const nombre = req.body.nombre;
    const correo = req.body.correo;
    const contacto = req.body.contacto;
    const telefono = req.body.telefono;
    const direccion = req.body.direccion;
    const nit = req.body.nit;


    conexion.query('INSERT INTO empleado SET ?',{nombre:nombre, correo:correo,contacto:contacto,telefono:telefono,direccion:direccion,nit:nit}, (error, results)=>{
        if(error){
            console.log(error);
        }else{
            //console.log(results);   
            res.redirect('empleado.ejs');         
        }
});
};*/


//ACTUALIZAR un REGISTRO
exports.updateEmpleado = (req, res)=>{

    const idEmpleado = req.body.idEmpleado;
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const telefono = req.body.telefono;
    const dpi = req.body.dpi;
    
    const puesto = req.body.puesto;

    conexion.query('UPDATE empleado SET ? WHERE idEmpleado = ?',[{nombre:nombre, apellido:apellido,telefono:telefono,dpi:dpi,puesto:puesto}, idEmpleado], (error, results)=>{
        if(error){
            console.log(error);
        }else{           
            res.redirect('empleado.ejs');         
        }
});
};