//Invocamos a la conexion de la DB
const conexion = require('../database/db');




//ACTUALIZAR un REGISTRO
exports.updateServicio = (req, res)=>{

    const idservicio = req.body.idservicio;
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const correo = req.body.correo;
    const telefono = req.body.telefono;
    const tipoServicio = req.body.tipoServicio;
    //const  actividad ="";
    
    const estado_idestado = req.body.estado_idestado;
    const var1 = estado_idestado;

    conexion.query('UPDATE servicio SET ? WHERE idservicio = ?',[{nombre:nombre, apellido:apellido,correo:correo, telefono:telefono,tipoServicio:tipoServicio,estado_idestado:estado_idestado}, idservicio], (error, results)=>{
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
              

        
            conexion.query('INSERT INTO historialservicio SET ?',{actividad:actividad, fecha:fecha,servicio_idservicio:idservicio}, (error, results)=>{
               });
            res.redirect('servicio.ejs');         
        }
});






};




