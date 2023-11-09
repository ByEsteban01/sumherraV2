const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const conexion = require('./database/db');



router.get('/', (req, res)=>{  
    conexion.query('SELECT * FROM usuario',(error, results)=>{   
        if(error){
            throw error;
        } else {                       
            res.render('login.ejs', {results:results});         
        }
    })     
})

router.post('/registrar', async (req, res) => {
    const { username, correo, password } = req.body;
    const tipoUsuario_idtipoUsuario = 2; // Valor fijo de 2

    try {
        // Hash de la contraseña antes de almacenarla
        const hashedPassword = await bcrypt.hash(password, 10); // 10 es el costo de hash

        // Insertar los datos en la base de datos utilizando 'conexion' (asegúrate de que 'conexion' esté disponible)
        const sql = 'INSERT INTO usuario (username, correo, password, tipoUsuario_idtipoUsuario) VALUES (?, ?, ?, ?)';
        const values = [username, correo, hashedPassword, tipoUsuario_idtipoUsuario];

        conexion.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error al registrar el usuario: ' + err.message);
                res.status(500).send('Error al registrar el usuario');
            } else {
                console.log('Usuario registrado con éxito');
                // Redirige al usuario a la página de éxito después del registro
                res.render('registroExito.ejs');
            }
        });
    } catch (err) {
        console.error('Error al encriptar la contraseña: ' + err.message);
        res.status(500).send('Error al encriptar la contraseña');
    }
});


router.post('/iniciar', (req, res) => {
    const { username, password } = req.body;

    // Realizar una consulta SQL para buscar el usuario por nombre de usuario
    const sql = 'SELECT * FROM usuario WHERE username = ?';
    conexion.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            res.redirect('errorSecion.ejs');  // Redirige nuevamente a la página de inicio de sesión
        } else if (results.length > 0) {
            // Verificar la contraseña hash
            const user = results[0];
            bcrypt.compare(password, user.password, (bcryptErr, passwordMatch) => {
                if (bcryptErr) {
                    console.error('Error al verificar la contraseña:', bcryptErr);
                    res.redirect('errorSecion.ejs');  // Redirige nuevamente a la página de inicio de sesión
                } else if (passwordMatch) {
                    // Usuario autenticado con éxito
                    const authenticatedUsername = user.username; // Aquí obtienes el nombre de usuario
                    const idUsuario = user.idUsuario; // Aquí obtienes el idUsuario

                    console.log('Usuario autenticado como tipo ' + user.tipoUsuario_idtipoUsuario);

                    if (user.tipoUsuario_idtipoUsuario === 1) {
                        console.log('Redirigiendo a index.ejs');
                        res.render('index.ejs', { username: authenticatedUsername, idUsuario: idUsuario }); 
                    } else if (user.tipoUsuario_idtipoUsuario === 2) {
                     // Pasa 'username' a la vista
                        console.log('Redirigiendo a paginaInicial.ejs');
                        res.render('paginaInicial.ejs', { username: authenticatedUsername, idUsuario: idUsuario }); // Pasa 'username' y 'idUsuario' a la vista
                        
                    }
                } else {
                    console.log('Credenciales incorrectas. Redirigiendo a /errorSesion.ejs');
                    res.render('errorSesion.ejs');  // Redirige a la página de error de inicio de sesión
                }
            });
        } else {
            console.log('Usuario no encontrado. Redirigiendo a /errorSesion.ejs');
            res.render('errorSesion.ejs');  // Redirige a la página de error de inicio de sesión
        }
    });
});

  

// Maneja la inserción de datos del formulario en la base de datos
router.post('/guardarCliente', (req, res) => {
    const { nombre, apellido, direccion, telefono, fechaNac, nit, municipio } = req.body;
  
    // Obtiene el último idUsuario de la tabla usuario
    const obtenerUltimoUsuarioQuery = 'SELECT MAX(idUsuario) AS ultimoUsuario FROM usuario';
    connection.query(obtenerUltimoUsuarioQuery, (error, resultados) => {
      if (error) {
        console.error('Error al obtener el último usuario: ' + error.message);
        res.status(500).send('Error al obtener el último usuario.');
        return;
      }
  
      const ultimoUsuario = resultados[0].ultimoUsuario;
  
      // Inserta los datos del formulario en la tabla cliente
      const insertarClienteQuery = `
        INSERT INTO cliente (nombre, apellido, direccion, telefono, fechaNac, nit, municipio, usuario_idUsuario)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
  
      connection.query(insertarClienteQuery, [nombre, apellido, direccion, telefono, fechaNac, nit, municipio, ultimoUsuario], (error) => {
        if (error) {
          console.error('Error al insertar el cliente: ' + error.message);
          res.status(500).send('Error al insertar el cliente.');
          return;
        }
  
        res.send('Cliente registrado con éxito.');
      });
    });
});


router.post('/guardarCotizacion', (req, res) => {
    const { nombre, apellido, correo, telefono, mensaje } = req.body;
  
    // Obtener la fecha actual en el formato MySQL
    const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
    const cotizacion = {
      nombre,
      apellido,
      correo,
      telefono,
      mensaje,
      fecha,
      estado_idestado: 1, // El estado siempre es 1
    };
  
    const sql = 'INSERT INTO cotizacion SET ?';
  
    conexion.query(sql, cotizacion, (err, result) => {
      if (err) {
        console.error('Error al guardar la cotización:', err);
        return res.status(500).send('Error al guardar la cotizacion'); // Puedes personalizar este mensaje de error
      }
  
      console.log('Cotización guardada correctamente');
      res.redirect('/cotizacionRealizada');
    });
  });

router.post('/servicioMaquinaRealizado', (req, res) => {
    const { nombre, apellido, correo, telefono, tipoServicio } = req.body;
    const fecha = new Date(); // Obtiene la fecha actual
    const estado_idestado = 1; // Siempre se guarda con 1

    const sql = 'INSERT INTO servicio (nombre, apellido, correo, telefono, tipoServicio, fecha, estado_idestado) VALUES (?, ?, ?, ?, ?, ?, ?)';

    conexion.query(sql, [nombre, apellido, correo, telefono, tipoServicio, fecha, estado_idestado], (err, result) => {
      if (err) {
        console.error('Error al guardar en la base de datos: ' + err.message);
        console.log('No se guardó correctamente.');
      } else {
        console.log('Datos guardados en la base de datos.');
        res.redirect('/servicioRealizado'); // Redirige a servicioRealizado.ejs
      }
    });
});

//////////////////////////////////////////////////////////////////

router.post('/guardarRegistroCliente', (req, res) => {
  conexion.query('SELECT MAX(idUsuario) AS ultimoID FROM usuario', (error, results) => {
    if (error) {
      console.error('Error al obtener el último ID de usuario:', error);
      res.status(500).send('Error al obtener el último ID de usuario');
    } else {
      if (results.length > 0) {
        const ultimoID3 = results[0].ultimoID;
        console.log(`El último ID de usuario registrado es: ${ultimoID3}`);

        const { nombre, apellido, direccion, telefono, fechaNac, nit } = req.body;

        const clienteData = {
          nombre: nombre,
          apellido: apellido,
          direccion: direccion,
          telefono: telefono,
          fechaNac: fechaNac,
          nit: nit,
          usuario_idUsuario: ultimoID3
        };

        conexion.query('INSERT INTO cliente SET ?', clienteData, (error, results) => {
          if (error) {
            console.error('Error al insertar el cliente en la base de datos:', error);
            res.status(500).send('Error al insertar el cliente en la base de datos');
          } else {
            console.log('Cliente insertado correctamente:', results);
            res.render('modalRegistro');
          }
        });
      } else {
        console.error('No se encontraron resultados para el último ID de usuario');
        res.status(500).send('No se encontraron resultados para el último ID de usuario');
      }
    }
  });
});

/////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////


router.post('/modalRegistro', (req, res) => {
    res.render('modalRegistro.ejs');
});

router.post('/usuarioAjustes', (req, res) => {
    res.render('usuarioAjustes.ejs');
});

router.get('/paginaInicial.ejs', (req, res) => {
    // Lógica para manejar la solicitud y renderizar la página 'paginaInicial.ejs'
    res.render('paginaInicial.ejs');
  });
  

router.get('/carrito', (req, res) => {
    res.render('carrito.ejs');
});

router.get('/errorSesion', (req, res) => {
    res.render('errorSesion.ejs');
});

router.get('/index.ejs', (req,res)=>{
    res.render("index.ejs")
})

router.get('/quienesSomos', (req, res) => {
    res.render('quienesSomos'); 
});

router.get('/contactanos', (req, res) => {
    res.render('contactanos'); 
});

router.get('/cotizacionCliente', (req, res) => {
    res.render('cotizacionCliente'); 
});

router.get('/cotizacionRealizada', (req, res) => {
    res.render('cotizacionRealizada'); 
});

router.get('/informacionMaquina', (req, res) => {
    res.render('informacionMaquina');
});

router.get('/informacionTornillo', (req, res) => {
    res.render('informacionTornillo');
});

router.get('/cotizarMaquinayTornillo', (req, res) => {
    res.render('cotizarMaquinayTornillo');
});

router.get('/servicioMaquina', (req, res) => {
    res.render('servicioMaquina');
});

router.get('/servicioTornillo', (req, res) => {
    res.render('servicioTornillo');
});

router.get('/servicioRealizado', (req, res) => {
    res.render('servicioRealizado');
});

router.get('/productoCliente', (req, res) => {
    if (req.session.username) {
        // Si el usuario ha iniciado sesión y tienes su nombre de usuario en la sesión, pásalo a la vista.
        res.render('productoCliente', { username: req.session.username });
    } else {
        // Si el usuario no ha iniciado sesión, puedes manejarlo de acuerdo a tus necesidades.
        res.redirect('/iniciarSesion'); // Por ejemplo, redirige al usuario a la página de inicio de sesión.
    }
});


router.get('/serviciosClientes', (req, res) => {
    res.render('serviciosClientes');
});

router.get('/registroCompletado', (req, res) => {
    res.render('registroCompletado');
});

router.get('/create', (req,res)=>{
    res.render('create');
})

router.get('/edit/:id', (req,res)=>{    
    const id = req.params.id;
    conexion.query('SELECT * FROM usuario WHERE id=?',[id] , (error, results) => {
        if (error) {
            throw error;
        }else{            
            res.render('edit.ejs', {user:results[0]});            
        }        
    });
});

router.get('/delete/:id', (req, res) => {
    const id = req.params.id;
    conexion.query('DELETE FROM usuario WHERE id = ?',[id], (error, results)=>{
        if(error){
            console.log(error);
        }else{           
            res.redirect('/');         
        }
    })
});

const crud = require('./controllers/crud');
router.post('/save', crud.save);
router.post('/update', crud.update);



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//categoria

router.get('/categoria.ejs', (req, res)=>{     
    conexion.query('SELECT * FROM categoria',(error, results)=>{
        if(error){
            throw error;
        } else {                       
            res.render('categoria.ejs', {results:results});            
        }   
    })
})





router.get('/categoriaCreate', (req,res)=>{
    res.render('categoriaCreate');
})





router.get('/categoriaDelete/:idcategoria', (req, res) => {
    const idcategoria = req.params.idcategoria;
    conexion.query('DELETE FROM categoria WHERE idcategoria = ?',[idcategoria], (error, results)=>{
        if(error){
            console.log(error);
        }else{           
            res.redirect('/categoria.ejs');         
        }
    })
});



router.get('/categoriaEdit/:idcategoria', (req,res)=>{    
    const idcategoria = req.params.idcategoria;
    conexion.query('SELECT * FROM categoria WHERE idcategoria=?',[idcategoria] , (error, results) => {
        if (error) {
            throw error;
        }else{            
            res.render('categoriaEdit.ejs', {categoria:results[0]});            
        }        
    });
});





const catCrud = require('./controllers/categoriaCrud');
router.post('/saveCategoria', catCrud.saveCategoria);
router.post('/updateCategoria', catCrud.updateCategoria);




////////////////////////

// carrito de compras
const carritoCompras = require('./controllers/carritoCrud');
router.post('/registrarcompra', carritoCompras.crearPedido);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//cotizacion


router.get('/cotizacion.ejs', (req, res)=>{     
    conexion.query('SELECT * FROM cotizacion',(error, results)=>{
        if(error){
            throw error;
        } else {                       
            res.render('cotizacion.ejs', {results:results});            
        }   
    })
})


router.get('/cotizacionDelete/:idcotizacion', (req, res) => {
    const idcotizacion = req.params.idcotizacion;
    conexion.query('DELETE FROM cotizacion WHERE idcotizacion = ?',[idcotizacion], (error, results)=>{
        if(error){
            console.log(error);
        }else{           
            res.redirect('/cotizacion.ejs');         
        }
    })
});

router.get('/cotizacionEdit/:idcotizacion', (req,res)=>{    
    const idcotizacion = req.params.idcotizacion;
    conexion.query('SELECT * FROM cotizacion WHERE idcotizacion=?',[idcotizacion] , (error, results) => {
        if (error) {
            throw error;
        }else{            
            res.render('cotizacionEdit.ejs', {cotizacion:results[0]});            
        }        
    });
});


const catCot = require('./controllers/cotizacionCrud');

router.post('/updateCotizacion', catCot.updateCotizacion);



//no guiarse de este ya que solo tiene ver tabla y eliminar, guiarse de categoria
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//servicio

router.get('/servicio.ejs', (req, res)=>{     
    conexion.query('SELECT * FROM servicio',(error, results)=>{
        if(error){
            throw error;
        } else {                       
            res.render('servicio.ejs', {results:results});            
        }   
    })
})


router.get('/servicioDelete/:idservicio', (req, res) => {
    const idservicio = req.params.idservicio;
    conexion.query('DELETE FROM servicio WHERE idservicio = ?',[idservicio], (error, results)=>{
        if(error){
            console.log(error);
        }else{           
            res.redirect('/servicio.ejs');         
        }
    })
});




router.get('/servicioEdit/:idservicio', (req,res)=>{    
    const idservicio = req.params.idservicio;
    conexion.query('SELECT * FROM servicio WHERE idservicio=?',[idservicio] , (error, results) => {
        if (error) {
            throw error;
        }else{            
            res.render('servicioEdit.ejs', {servicio:results[0]});            
        }        
    });
});


const serCrud = require('./controllers/servicioCrud');

router.post('/updateservicio', serCrud.updateServicio);

//no guiarse de este ya que solo tiene ver tabla y eliminar, guiarse de categorias
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//proveedores



router.get('/proveedores.ejs', (req, res)=>{     
    conexion.query('SELECT * FROM proveedor',(error, results)=>{
        if(error){
            throw error;
        } else {                       
            res.render('proveedores.ejs', {results:results});            
        }   
    })
})



router.get('/proveedoresCreate', (req,res)=>{
    res.render('proveedoresCreate');
})

router.get('/productosCliente', (req,res)=>{
    res.render('productosCliente');
})





router.get('/proveedoresDelete/:idproveedor', (req, res) => {
    const idproveedor = req.params.idproveedor;
    conexion.query('DELETE FROM proveedor WHERE idproveedor = ?',[idproveedor], (error, results)=>{
        if(error){
            console.log(error);
        }else{           
            res.redirect('/proveedores.ejs');         
        }
    })
});



router.get('/proveedoresEdit/:idproveedor', (req,res)=>{    
    const idproveedor = req.params.idproveedor;


    conexion.query('SELECT * FROM proveedor WHERE idproveedor=?',[idproveedor] , (error, results) => {
        if (error) {
            throw error;
        }else{            
            res.render('proveedoresEdit.ejs', {proveedor:results[0]});            
        }        
    });
});





const provCrud = require('./controllers/proveedoresCrud');
router.post('/saveProveedores', provCrud.saveProveedores);
router.post('/updateProveedores', provCrud.updateProveedores);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//trabajado 21/10/2023
//usuarios



router.get('/usuario.ejs', (req, res)=>{     
    conexion.query('SELECT idUsuario, username, correo, tipoUsuario_idtipoUsuario FROM usuario',(error, results)=>{
        if(error){
            throw error;
        } else {  

            res.render('usuario.ejs', {results:results}); 
            
        }   
    })
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Frida - Ordenes 


router.get('/ordenes.ejs', (req, res) => {
    conexion.query('SELECT * FROM Pedidos', (error, results) => {
        if (error) {
            throw error;
        } else {
            results.forEach(pedido => {
                pedido.fechaPedido = pedido.fechaPedido.toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            });
            res.render('ordenes.ejs', { results: results });
        }
    });
});

router.get('/verpedido/:idPedido', (req, res) => {
    const idPedido = req.params.idPedido;

    conexion.query(
        'SELECT * FROM Pedidos A INNER JOIN usuario B ON A.idUsuario = B.idUsuario WHERE A.idPedido = ?',
        [idPedido],
        (error, results) => {
            if (error) {
                throw error;
            } else {
                const pedido = results[0];
                pedido.fechaPedido = pedido.fechaPedido.toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                
                
                conexion.query('SELECT * FROM ItemsCarrito WHERE idPedido = ?', [idPedido], (error, resultsItems) => {
                    if (error) {
                        throw error;
                    } else {
                        res.json({ pedido: pedido, items: resultsItems });  // Retornar datos en formato JSON
                    }
                });
            }
        }
    );
});



router.delete('/eliminarpedido/:idPedido', (req, res) => {
    const idPedido = req.params.idPedido;


    conexion.query('DELETE FROM ItemsCarrito WHERE idPedido = ?', [idPedido], (error) => {
        if (error) {

            res.status(500).send(error.sqlMessage);
            return;
        }
        conexion.query('DELETE FROM Pedidos WHERE idPedido = ?', [idPedido], (error) => {
            if (error) {

                res.status(500).send(error.sqlMessage);
                return;
            }
res.status(200).json({ message: 'Pedido eliminado exitosamente' });
            
        });
    });
});



router.post('/actualizar-orden', (req, res) => {
    const { idPedido, estado } = req.body;  


    const queryUpdate = 'UPDATE Pedidos SET estado = ? WHERE idPedido = ?';
    conexion.query(queryUpdate, [estado, idPedido], (error, result) => {
        if (error) {
            throw error;
        } else {
   
            const querySelect = 'SELECT * FROM Pedidos';
            conexion.query(querySelect, (error, results) => {
                if (error) {
                    res.status(500).send(error.message); 
                } else {
           
                    results.forEach(pedido => {
                        pedido.fechaPedido = pedido.fechaPedido.toLocaleString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        res.render('ordenes.ejs', { results: results });
                    });
                    res.render('ordenes.ejs', { results: results });  
                }
            });
        }
    });
});


///////////////////////////////////////////////////////////////////////////////////////

///empleados

router.get('/empleado.ejs', (req, res)=>{     
    conexion.query('SELECT * FROM empleado',(error, results)=>{
        if(error){
            throw error;
        } else {  

            res.render('empleado.ejs', {results:results}); 
            
        }   
    })
})


//edit empleado

router.get('/empleadoEdit/:idEmpleado', (req,res)=>{    
    const idEmpleado = req.params.idEmpleado;


    conexion.query('SELECT * FROM empleado WHERE idEmpleado=?',[idEmpleado] , (error, results) => {
        if (error) {
            throw error;
        }else{            
            res.render('empleadoEdit.ejs', {empleado:results[0]});            
        }        
    });
});


//eliminar empleado
router.get('/empleadoDelete/:idEmpleado', (req, res) => {
    const idEmpleado = req.params.idEmpleado;
    conexion.query('DELETE FROM empleado WHERE idEmpleado = ?',[idEmpleado], (error, results)=>{
        if(error){
            console.log(error);
        }else{           
            res.redirect('/empleado.ejs');         
        }
    })
});

//crear usuario empleado

//vista para crear usuario empleado
router.get('/empleadoCreate', (req,res)=>{
    res.render('empleadoCreate');
})

/////////////////////////////////////////////
//crear cuenta usuario empleado


router.post('/registrar2', async (req, res) => {
    const { username, correo, password } = req.body;
    const tipoUsuario_idtipoUsuario = 1; // Valor fijo de 2

    try {
        // Hash de la contraseña antes de almacenarla
        const hashedPassword = await bcrypt.hash(password, 10); // 10 es el costo de hash

        // Insertar los datos en la base de datos utilizando 'conexion' (asegúrate de que 'conexion' esté disponible)
        const sql = 'INSERT INTO usuario (username, correo, password, tipoUsuario_idtipoUsuario) VALUES (?, ?, ?, ?)';
        const values = [username, correo, hashedPassword, tipoUsuario_idtipoUsuario];

        conexion.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error al registrar el usuario: ' + err.message);
                res.status(500).send('Error al registrar el usuario');
            } else {
                console.log('Usuario registrado con éxito');

                conexion.query('SELECT MAX(idUsuario) AS ultimoID FROM usuario', (error, results) => {
                    if (error) {
                        throw error;
                    } else {
                        if (results.length > 0) {
                            const ultimoID = results[0].ultimoID;
                            console.log(`El último ID de usuario registrado es: ${ultimoID}`);
                            // Ahora puedes utilizar la variable idUsuario como desees.
                        
                        //res.render('login.ejs', { results: results });


                        const nombre = req.body.nombre;
                        const apellido = req.body.apellido;
                        const telefono = req.body.telefono;
                        const dpi = req.body.dpi;
                
                        const fechaNac = req.body.fechaNac;
                        const puesto = req.body.puesto;


    conexion.query('INSERT INTO empleado SET ?',{nombre:nombre, apellido:apellido,telefono:telefono,dpi:dpi,fechaNac:fechaNac,puesto:puesto,usuario_idUsuario:ultimoID}, (error, results)=>{
        if(error){
            console.log(error);
        }else{
            //console.log(results);   
            res.redirect('empleado.ejs');   
            
            
        }
});

}






                    }
                });
                // Redirige al usuario a la página de éxito después del registro
                //res.render('empleado.ejs');

                /*
                */


            }
        });
    } catch (err) {
        console.error('Error al encriptar la contraseña: ' + err.message);
        res.status(500).send('Error al encriptar la contraseña');
    }
});

/////////////////////////////////////////////////////////////////////////////////////////



const empleCrud = require('./controllers/empleadoCrud');
//router.post('/saveEmpleado', empleCrud.saveEmpleado);
router.post('/updateEmpleado', empleCrud.updateEmpleado);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////

//trabajado despues de unirlo el 22/10/2023

///////////////////////////////////////////////////////////////////////////////////////

///empleados

router.get('/clientes.ejs', (req, res)=>{     
    conexion.query('SELECT * FROM cliente',(error, results)=>{
        if(error){
            throw error;
        } else {  

            res.render('clientes.ejs', {results:results}); 
            
        }   
    })
})


//edit empleado

router.get('/clientesEdit/:idCliente', (req,res)=>{    
    const idCliente = req.params.idCliente;


    conexion.query('SELECT * FROM cliente WHERE idCliente=?',[idCliente] , (error, results) => {
        if (error) {
            throw error;
        }else{            
            res.render('clientesEdit.ejs', {cliente:results[0]});            
        }        
    });
});


//eliminar empleado
router.get('/clientesDelete/:idCliente', (req, res) => {
    const idCliente = req.params.idCliente;
    conexion.query('DELETE FROM cliente WHERE idCliente = ?',[idCliente], (error, results)=>{
        if(error){
            console.log(error);
        }else{           
            res.redirect('/clientes.ejs');         
        }
    })
});

//crear usuario empleado

//vista para crear usuario empleado
router.get('/clientesCreate', (req,res)=>{
    res.render('clientesCreate');
})

/////////////////////////////////////////////
//crear cuenta usuario empleado


router.post('/registrar3', async (req, res) => {
    const { username, correo, password } = req.body;
    const tipoUsuario_idtipoUsuario = 2; // Valor fijo de 2

    try {
        // Hash de la contraseña antes de almacenarla
        const hashedPassword = await bcrypt.hash(password, 10); // 10 es el costo de hash

        // Insertar los datos en la base de datos utilizando 'conexion' (asegúrate de que 'conexion' esté disponible)
        const sql = 'INSERT INTO usuario (username, correo, password, tipoUsuario_idtipoUsuario) VALUES (?, ?, ?, ?)';
        const values = [username, correo, hashedPassword, tipoUsuario_idtipoUsuario];

        conexion.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error al registrar el usuario: ' + err.message);
                res.status(500).send('Error al registrar el usuario');
            } else {
                console.log('Usuario registrado con éxito');

                conexion.query('SELECT MAX(idUsuario) AS ultimoID FROM usuario', (error, results) => {
                    if (error) {
                        throw error;
                    } else {
                        if (results.length > 0) {
                            const ultimoID2 = results[0].ultimoID;
                            console.log(`El último ID de usuario registrado es: ${ultimoID2}`);
                            // Ahora puedes utilizar la variable idUsuario como desees.
                        
                        


                        const nombre = req.body.nombre;
                        const apellido = req.body.apellido;
                        const direccion = req.body.direccion;
                        const telefono = req.body.telefono;
                    
                
                        const fechaNac = req.body.fechaNac;
                        const nit = req.body.nit;

                        


    conexion.query('INSERT INTO cliente SET ?',{nombre:nombre, apellido:apellido,direccion:direccion,telefono:telefono,fechaNac:fechaNac,nit:nit,usuario_idUsuario:ultimoID2}, (error, results)=>{
        if(error){
            console.log(error);
        }else{
            //console.log(results);   
            res.redirect('clientes.ejs');   
            
            
        }
});

}






                    }
                });
                // Redirige al usuario a la página de éxito después del registro
                //res.render('empleado.ejs');

                /*
                */


            }
        });
    } catch (err) {
        console.error('Error al encriptar la contraseña: ' + err.message);
        res.status(500).send('Error al encriptar la contraseña');
    }
});

/////////////////////////////////////////////////////////////////////////////////////////



const clieCrud = require('./controllers/clientesCrud');

router.post('/updateClientes', clieCrud.updateClientes);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///trabajado 24/10/2023


///historialServicio

router.get('/servicioHistorial.ejs', (req, res)=>{     
    conexion.query('SELECT historialservicio.*, servicio.nombre, servicio.apellido FROM historialservicio INNER JOIN servicio ON historialservicio.servicio_idservicio = servicio.idservicio;',(error, results)=>{
        if(error){
            throw error;
        } else {  

            res.render('servicioHistorial.ejs', {results:results}); 
            
        }   
    })
})

///historialcotizacion

router.get('/cotizacionHistorial.ejs', (req, res)=>{     
    conexion.query('SELECT historialcotizacion.*, cotizacion.nombre, cotizacion.apellido FROM historialcotizacion INNER JOIN cotizacion ON historialcotizacion.cotizacion_idcotizacion = cotizacion.idcotizacion;',(error, results)=>{
        if(error){
            throw error;
        } else {  

            res.render('cotizacionHistorial.ejs', {results:results}); 
            
        }   
    })
})






/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//trabajado 24/10/2023, en la tarde


///materia

router.get('/materia.ejs', (req, res)=>{     
    conexion.query('SELECT materiaprima.*, proveedor.nombre AS nombre2 FROM materiaprima INNER JOIN proveedor ON materiaprima.proveedor_idproveedor = proveedor.idproveedor;',(error, results)=>{
        if(error){
            throw error;
        } else {  

            res.render('materia.ejs', {results:results}); 
            
        }   
    })
})

//vista para crear materia
router.get('/materiaCreate', (req,res)=>{
    res.render('materiaCreate');
})






// Ruta para obtener los nombres de los proveedores
router.get('/api/proveedores', (req, res) => {
    const query = 'SELECT nombre FROM proveedor';
    conexion.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al obtener datos de la base de datos' });
        }
        res.json(results);
    });
});


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/enviar', (req, res) => {
    const selectedValue = req.query.valor;
    





    
});





/*
router.get('/enviar', (req, res) => {
    const selectedValue = req.query.valor;

    // Realiza la consulta SQL para obtener el idproveedor
    const query = 'SELECT idproveedor FROM proveedor WHERE nombre = ?';

    conexion.query(query, [selectedValue], (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            res.status(500).send('Error en la consulta SQL');
        } else if (results.length > 0) {


            const idproveedor = results[0].idproveedor;
            console.log('idproveedor: ' + idproveedor);
            res.send('idproveedor: ' + idproveedor);


            
    router.post('/saveMateria', (req, res) => {
        const { nombre, precioUnitario, descripcion, stock} = req.body;
        const fecha = new Date(); // Obtiene la fecha actual
        const total = precioUnitario * stock;
    
        const sql = 'INSERT INTO materiaprima (nombre, precioUnitario, descripcion, stock, proveedor_idproveedor) VALUES (?, ?, ?, ?, ?)';
    
        conexion.query(sql, [nombre, precioUnitario, descripcion, stock, idproveedor], (err, result) => {
          if (err) {
            console.error('Error al guardar en la base de datos: ' + err.message);
            console.log('No se guardó correctamente. en materiaprima');
          } else {



            //console.log('Datos guardados en la base de datos.');
            //res.redirect('/servicioRealizado'); // Redirige a servicioRealizado.ejs

            const sql2 = 'INSERT INTO compraMateriaPrima (fecha,total) VALUES (?, ?)';
            conexion.query(sql2, [total, fecha], (err, result) => {
                if (err) {
                  console.error('Error al guardar en la base de datos: ' + err.message);
                  console.log('No se guardó correctamente. en la de compramateriaprima');
                } else {
      
      
      
                  //console.log('Datos guardados en la base de datos.');
                  //res.redirect('/servicioRealizado'); // Redirige a servicioRealizado.ejs



                  

conexion.query('SELECT MAX(idmateriaPrima) AS ultimoID FROM materiaprima', (error, results) => {
    if (error) {
        throw error;
    } else {
        if (results.length > 0) {
            const ultimoID5 = results[0].ultimoID;
            console.log(`El último ID de usuario registrado es: ${ultimoID5}`);
            // Ahora puedes utilizar la variable idUsuario como desees.
            //ultimoid5 = idmateriaprima



            
conexion.query('SELECT MAX(idcompraMateriaPrima) AS ultimoID FROM compramateriaprima', (error, results) => {
    if (error) {
        throw error;
    } else {
        if (results.length > 0) {
            const ultimoID6 = results[0].ultimoID;
            console.log(`El último ID de usuario registrado es: ${ultimoID6}`);
            // Ahora puedes utilizar la variable idUsuario como desees.
            //idultimo6 = idcompraMateriaPrima

            
            const sql3 = 'INSERT INTO detalleCompraMateria (cantidad, precioUnitario, subtotal, fecha, compraMateriaPrima_idcompraMateriaPrima, materiaPrima_idmateriaPrima) VALUES (?, ?,?,?,?,?)';
            conexion.query(sql3, [stock,precioUnitario,total,fecha,ultimoID5,ultimoID6 ], (err, result) => {//aca falta 2id
                if (err) {
                console.error('Error al guardar en la base de datos: ' + err.message);
                console.log('No se guardó correctamente. en la de compramateriaprima');
                } else {



                //console.log('Datos guardados en la base de datos.');
                //res.redirect('/servicioRealizado'); // Redirige a servicioRealizado.ejs

                const { pago} = req.body;
                
                const total = precioUnitario * stock;

                function generarLetrasAleatorias() {
                    const letrasMayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    let resultado = '';
                  
                    for (let i = 0; i < 10; i++) {
                      const indiceAleatorio = Math.floor(Math.random() * letrasMayusculas.length);
                      const letraAleatoria = letrasMayusculas.charAt(indiceAleatorio);
                      resultado += letraAleatoria;
                    }
                  
                    return resultado;
                  }
                  
                  // Ejemplo de uso

                  //variable prefijo
                  const letrasAleatorias = generarLetrasAleatorias();
                  const facnombre ="FACTURA";

                  const sql4 = 'INSERT INTO tipoDocumento (prefijo,nombre,fecha, modoPago_idmodoPago, compraMateriaPrima_idcompraMateriaPrima) VALUES (?, ?,?,?,?)';
        conexion.query(sql4, [letrasAleatorias,facnombre,fecha,pago,ultimoID6 ], (err, result) => {//aca falta 2id
            if (err) {
            console.error('Error al guardar en la base de datos: ' + err.message);
            console.log('No se guardó correctamente. en la de compramateriaprima');
            } else {

            //console.log('Datos guardados en la base de datos.');
            res.redirect('/materia'); // Redirige a servicioRealizado.ejs


            
            }
        });
        ///sql4













                }
            });
            ///sql3

        
        








        }

            }
        });


            
        
        








        }

            }
        });

            
      
      
      
      
      
      
      
                }
              });






          }
        });
    });










        } else {
            console.log('No se encontraron resultados para el nombre: ' + selectedValue);
            res.send('No se encontraron resultados para el nombre: ' + selectedValue);
        }
    });
});


*/

   
router.post('/saveMateria', (req, res) => {
    const { nombre, precioUnitario, descripcion, stock} = req.body;
    const fecha = new Date(); // Obtiene la fecha actual
    const total = precioUnitario * stock;
    const idproveedor=1;

    const sql = 'INSERT INTO materiaprima (nombre, precioUnitario, descripcion, stock, proveedor_idproveedor) VALUES (?, ?, ?, ?, ?)';

    conexion.query(sql, [nombre, precioUnitario, descripcion, stock, idproveedor], (err, result) => {
      if (err) {
        console.error('Error al guardar en la base de datos: ' + err.message);
        console.log('No se guardó correctamente. en materiaprima');
      } else {

        const { precioUnitario, stock} = req.body;
        const fecha2 = new Date(); // Obtiene la fecha actual
        const total2 = precioUnitario * stock;



        //console.log('Datos guardados en la base de datos.');
        //res.redirect('/servicioRealizado'); // Redirige a servicioRealizado.ejs

        const sql2 = 'INSERT INTO compraMateriaPrima (fecha,total) VALUES (?, ?)';
        conexion.query(sql2, [fecha2,total2], (err, result) => {
            if (err) {
              console.error('Error al guardar en la base de datos: ' + err.message);
              console.log('No se guardó correctamente. en la de compramateriaprima');
            } else {
  
  
  
              //console.log('Datos guardados en la base de datos.');
              //res.redirect('/servicioRealizado'); // Redirige a servicioRealizado.ejs



              

conexion.query('SELECT MAX(idmateriaPrima) AS ultimoID FROM materiaprima', (error, results) => {
if (error) {
    throw error;
} else {
    if (results.length > 0) {
        const ultimoID5 = results[0].ultimoID;
        console.log(`El último ID de usuario registrado es: ${ultimoID5}`);
        // Ahora puedes utilizar la variable idUsuario como desees.
        //ultimoid5 = idmateriaprima



        
conexion.query('SELECT MAX(idcompraMateriaPrima) AS ultimoID FROM compramateriaprima', (error, results) => {
if (error) {
    throw error;
} else {
    if (results.length > 0) {
        const ultimoID6 = results[0].ultimoID;
        console.log(`El último ID de usuario registrado es: ${ultimoID6}`);
        // Ahora puedes utilizar la variable idUsuario como desees.
        //idultimo6 = idcompraMateriaPrima

        
        const sql3 = 'INSERT INTO detalleCompraMateria (cantidad, precioUnitario, subtotal, fecha, compraMateriaPrima_idcompraMateriaPrima, materiaPrima_idmateriaPrima) VALUES (?, ?,?,?,?,?)';
        conexion.query(sql3, [stock,precioUnitario,total,fecha,ultimoID5,ultimoID6 ], (err, result) => {//aca falta 2id
            if (err) {
            console.error('Error al guardar en la base de datos: ' + err.message);
            console.log('No se guardó correctamente. en la de compramateriaprima');
            } else {



            //console.log('Datos guardados en la base de datos.');
            //res.redirect('/servicioRealizado'); // Redirige a servicioRealizado.ejs

            const { pago} = req.body;
            
            const total = precioUnitario * stock;

            function generarLetrasAleatorias() {
                const letrasMayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                let resultado = '';
              
                for (let i = 0; i < 10; i++) {
                  const indiceAleatorio = Math.floor(Math.random() * letrasMayusculas.length);
                  const letraAleatoria = letrasMayusculas.charAt(indiceAleatorio);
                  resultado += letraAleatoria;
                }
              
                return resultado;
              }
              
              // Ejemplo de uso

              //variable prefijo
              const letrasAleatorias = generarLetrasAleatorias();
              const facnombre ="FACTURA";

              const sql4 = 'INSERT INTO tipoDocumento (prefijo,nombre,fecha, modoPago_idmodoPago, compraMateriaPrima_idcompraMateriaPrima) VALUES (?, ?,?,?,?)';
    conexion.query(sql4, [letrasAleatorias,facnombre,fecha,pago,ultimoID6 ], (err, result) => {//aca falta 2id
        if (err) {
        console.error('Error al guardar en la base de datos: ' + err.message);
        console.log('No se guardó correctamente. en la de compramateriaprima');
        } else {

        //console.log('Datos guardados en la base de datos.');
        res.redirect('/materia.ejs'); // Redirige a servicioRealizado.ejs


        
        }
    });
    ///sql4













            }
        });
        ///sql3

    
    








    }

        }
    });


        
    
    








    }

        }
    });

        
  
  
  
  
  
  
  
            }
          });






      }
    });
});






/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////

//trabajado el 26/10/2023



router.get('/producto.ejs', (req, res)=>{     
    conexion.query('SELECT producto.*, categoria.nombre AS nombre2 FROM producto INNER JOIN categoria ON producto.categoria_idCategoria = categoria.idcategoria;',(error, results)=>{
        if(error){
            throw error;
        } else {  

            res.render('producto.ejs', {results:results}); 
            
        }   
    })
})


//eliminar empleado
router.get('/productoDelete/:idProducto', (req, res) => {
    const idProducto = req.params.idProducto;
    conexion.query('DELETE FROM producto WHERE idProducto = ?',[idProducto], (error, results)=>{
        if(error){
            console.log(error);
        }else{           
            res.redirect('/producto.ejs');         
        }
    })
});



//edit empleado

router.get('/productoEdit/:idProducto', (req,res)=>{    
    const idProducto = req.params.idProducto;


    conexion.query('SELECT * FROM producto WHERE idProducto=?',[idProducto] , (error, results) => {
        if (error) {
            throw error;
        }else{            
            res.render('productoEdit.ejs', {producto:results[0]});            
        }        
    });
});



const pro2dCrud = require('./controllers/productoCrud');

router.post('/updateProducto', pro2dCrud.updateProducto);







router.get('/productoCreate', (req,res)=>{
    res.render('productoCreate');
})

router.get('/servicioInformacionMaquina', (req,res)=>{
    res.render('servicioInformacionMaquina');
})

router.get('/servicioInformacionTornillo', (req,res)=>{
    res.render('servicioInformacionTornillo');
})

// Ruta para obtener los nombres de los proveedores
router.get('/api/categoria', (req, res) => {
    const query = 'SELECT nombre FROM categoria';
    conexion.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al obtener datos de la base de datos' });
        }
        res.json(results);
    });
});


// Ruta para obtener los nombres de los proveedores
router.get('/api/tipo', (req, res) => {
    const query = 'SELECT tipo FROM tipoproducto';
    conexion.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al obtener datos de la base de datos' });
        }
        res.json(results);
    });
});



const multer = require('multer');




// Configurar Multer para manejar la carga de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/img/'); // Directorio donde se guardarán las imágenes
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); // Nombre del archivo en el servidor
    }
  });
  
  const upload = multer({ storage: storage });
  
  // Manejar la solicitud POST para guardar el producto
  router.post('/saveProducto', upload.single('ubicacion'), (req, res) => {
    const categoria2=1;
    const { nombre, descripcion,tipo } = req.body;
    const ubicacion = req.file.filename; // Nombre del archivo cargado
  
    const sql = 'INSERT INTO producto (nombre, descripcion, ubicacion,categoria_idCategoria,tipoProducto_idtipoProducto) VALUES (?, ?, ?,?,?)';
    conexion.query(sql, [nombre, descripcion, ubicacion,categoria2,tipo], (err, result) => {
      if (err) {
        console.error('Error al insertar el producto: ' + err);
      } else {
        console.log('Producto insertado con éxito');
      }
    });
  
    res.redirect('/producto.ejs'); // Redirigir a donde desees después de guardar el producto
  });







  router.get('/ordenes.ejs', (req, res)=>{     
    conexion.query('SELECT detallefactura.*, producto.nombre AS nombre2 FROM detallefactura INNER JOIN producto ON detallefactura.producto_idproducto = producto.idproducto;',(error, results)=>{
        if(error){
            throw error;
        } else {  

            res.render('ordenes.ejs', {results:results}); 
            
        }   
    })
})





//eliminar empleado
router.get('/detallefacturaDelete/:idDetalleFactura', (req, res) => {
    const idDetalleFactura = req.params.idDetalleFactura;
    conexion.query('DELETE FROM detallefactura WHERE idDetalleFactura = ?',[idDetalleFactura], (error, results)=>{
        if(error){
            console.log(error);
        }else{           
            res.redirect('/ordenes.ejs');         
        }
    })
});









/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = router;