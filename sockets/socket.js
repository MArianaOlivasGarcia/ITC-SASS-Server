const { io } = require('../index');
const { comprobarJWT } = require('../helpers/jwt.helper');

// Mensajes de Sockets
io.on('connection', client => {
    console.log('Cliente conectado');

    const [ valido, uid ] = comprobarJWT( client.handshake.query['Authorization'] );

    if ( !valido ) { return client.disconnect(); }


    // Ingresar al usuario a una sala en particular
    // sala global, a un cliente->client.id, 
    // uid base de datos, nombre de la sala
    client.join( uid )

    client.on('disconnect', () => {
        console.log('Cliente desconectado');
    });

    client.on('mensaje', (payload) => {
        console.log('Mensaje', payload);

        io.emit('mensaje', { admin: 'Nuevo mensaje' });

    });


});