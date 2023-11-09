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
exports.updateClientes = (req, res)=>{

    const idCliente = req.body.idCliente;
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const direccion = req.body.direccion;
    const telefono = req.body.telefono;
    const nit = req.body.nit;
    
    

    conexion.query('UPDATE cliente SET ? WHERE idCliente = ?',[{nombre:nombre, apellido:apellido,direccion:direccion,telefono:telefono,nit:nit}, idCliente], (error, results)=>{
        if(error){
            console.log(error);
        }else{           
            res.redirect('clientes.ejs');         
        }
});
};