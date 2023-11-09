// Archivo: controllers/pedidosController.js

const conexion = require('../database/db');

// exports.crearPedido = (req, res) => {
//     const { idUsuario, name, phone, address, estado } = req.body.customerInfo;

//     // Insertar pedido
//     conexion.query('INSERT INTO Pedidos SET ?', {idUsuario, nombre, telefono, direccion, estado}, (error, results) => {
//         if(error) {
//             console.log(error);
//             return res.status(500).send(error);
//         }
        
//         const idPedido = results.insertId;

//         // Suponiendo que los items del carrito vienen como un arreglo de objetos en req.body.items
//         const itemsCarrito = req.body.items.map(item => [
//             idPedido,
//             item.nombreProducto,
//             item.cantidad,
//             item.tamano
//         ]);

//         // Insertar items del carrito
//         conexion.query('INSERT INTO ItemsCarrito (idPedido, nombreProducto, cantidad, tamano) VALUES ?', [itemsCarrito], (error, results) => {
//             if(error) {
//                 console.log(error);
//                 return res.status(500).send(error);
//             }

//             res.redirect('paginaInicial.ejs');
//         });
//     });
// };
exports.crearPedido = (req, res) => {
    // Extraer la información del cliente y los items del carrito de la petición
    const { idUsuario, name, phone, address, estado } = req.body.customerInfo;
    const itemsCarrito = req.body.cartItems.map(item => {
        // Asumiendo que idPedido se obtendrá después de insertar el pedido
        // item.name, item.quantity, y item.size son los datos de cada item en el carrito
        // Este código asume que obtendrás el idPedido después de la primera inserción
        return [/*idPedido,*/ item.name, item.quantity, item.size];  // <--- Retorna un array por cada item
    });
    // Insertar pedido
    conexion.query('INSERT INTO Pedidos SET ?', {idUsuario, nombre: name, telefono: phone, direccion: address, estado}, (error, results) => {
        if(error) {
            console.log(error);
            return res.status(500).send(error);
        }

        const idPedido = results.insertId;

        // Ajustar los items del carrito para incluir el idPedido
        const itemsCarritoConId = itemsCarrito.map(item => [idPedido, ...item]);

        // Insertar items del carrito
        conexion.query('INSERT INTO ItemsCarrito (idPedido, nombreProducto, cantidad, tamano) VALUES ?', [itemsCarritoConId], (error, results) => {
            if(error) {
                console.log(error);
                return res.status(500).send(error);
            }

            res.status(200).send('Pedido registrado con éxito');
        });
    });
};


// Archivo: controllers/pedidosController.js

exports.obtenerPedidos = (req, res) => {
    conexion.query('SELECT * FROM Pedidos', (error, pedidos) => {
        if(error) {
            console.log(error);
            return res.status(500).send(error);
        }

        const queries = pedidos.map(pedido =>
            new Promise((resolve, reject) => {
                conexion.query('SELECT * FROM ItemsCarrito WHERE idPedido = ?', [pedido.idPedido], (error, itemsCarrito) => {
                    if(error) return reject(error);
                    pedido.itemsCarrito = itemsCarrito;
                    resolve();
                });
            })
        );

        Promise.all(queries)
            .then(() => res.render('paginaInicial.ejs', { pedidos }))
            .catch(error => {
                console.log(error);
                res.status(500).send(error);
            });
    });
};


// Archivo: controllers/pedidosController.js

exports.actualizarPedido = (req, res) => {
    const { idPedido, idUsuario, nombre, telefono, direccion, estado, items } = req.body;

    // Actualizar pedido
    conexion.query('UPDATE Pedidos SET ? WHERE idPedido = ?', [{idUsuario, nombre, telefono, direccion, estado}, idPedido], (error, results) => {
        if(error) {
            console.log(error);
            return res.status(500).send(error);
        }

        // Suponiendo que los items del carrito vienen como un arreglo de objetos en req.body.items
        const queries = items.map(item =>
            new Promise((resolve, reject) => {
                conexion.query('UPDATE ItemsCarrito SET ? WHERE idItem = ?', [{nombreProducto: item.nombreProducto, cantidad: item.cantidad, tamano: item.tamano}, item.idItem], (error, results) => {
                    if(error) return reject(error);
                    resolve();
                });
            })
        );

        Promise.all(queries)
            .then(() => res.redirect('paginaInicial.ejs'))
            .catch(error => {
                console.log(error);
                res.status(500).send(error);
            });
    });
};


// Archivo: controllers/pedidosController.js

exports.eliminarPedido = (req, res) => {
    const { idPedido } = req.params;

    // Eliminar items del carrito asociados al pedido
    conexion.query('DELETE FROM ItemsCarrito WHERE idPedido = ?', [idPedido], (error, results) => {
        if(error) {
            console.log(error);
            return res.status(500).send(error);
        }

        // Eliminar pedido
        conexion.query('DELETE FROM Pedidos WHERE idPedido = ?', [idPedido], (error, results) => {
            if(error) {
                console.log(error);
                return res.status(500).send(error);
            }

            res.redirect('paginaInicial.ejs');
        });
    });
};

