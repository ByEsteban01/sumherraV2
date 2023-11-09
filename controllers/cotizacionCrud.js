//Invocamos a la conexion de la DB
const conexion = require('../database/db');




//ACTUALIZAR un REGISTRO
exports.updateCotizacion = (req, res)=>{

    
    const idcotizacion = req.body.idcotizacion;
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const correo = req.body.correo;
    const telefono = req.body.telefono;
    const mensaje = req.body.mensaje;
    //const  actividad ="";
    
    const estado_idestado = req.body.estado_idestado;
    const var1 = estado_idestado;

    conexion.query('UPDATE cotizacion SET ? WHERE idcotizacion = ?',[{nombre:nombre, apellido:apellido,correo:correo, telefono:telefono,mensaje:mensaje,estado_idestado:estado_idestado}, idcotizacion], (error, results)=>{
        if(error){
            console.log(error);
        }else{    


                function obtenerFechaYHora() {
                const fechaHoraActual = new Date();
                return fechaHoraActual;
              }
              
              const fecha = obtenerFechaYHora();
   

            const estadoActividades = {
                1: "Recibido",
                2: "Proceso",
                3: "Finalizado y entregado",
                4: "Cancelado y no se trabajó"
              };
              
              const actividad = estadoActividades[var1] || "Estado desconocido";
              

        
            conexion.query('INSERT INTO historialcotizacion SET ?',{actividad:actividad, fecha:fecha,cotizacion_idcotizacion:idcotizacion}, (error, results)=>{
               });
            res.redirect('cotizacion.ejs');         
        }
});
};