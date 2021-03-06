const { response } = require("express");
const { v4: uuidv4 } = require('uuid');
const path = require('path')
const fs = require('fs');

const Alumno = require("../models/alumno.model");
const Usuario = require("../models/usuario.model");
const Aviso = require("../models/aviso.model");


const imageUpload = async( req, res = response ) => {

    const coleccion = req.params.coleccion;
    const id = req.params.id

    const coleccionesValidas = ['usuarios', 'alumnos', 'avisos'];

    if ( !coleccionesValidas.includes( coleccion ) ){
        return res.status(400).json({
            status: false,
            message: 'No es una coleccción válida'
        })
    }

    // Validar que exista un archivo 
    if( !req.files || Object.keys(req.files).length === 0 ){
        return res.status(400).json({
            status: false,
            message: 'No hay ningún archivo'
        }) 
    }


    // Procesar la imagen
    const file = req.files.imagen;

    const nombreCortado = file.name.split('.'); //nombre.archivo.jpg
    const extensionArchivo = nombreCortado[ nombreCortado.length - 1 ];

    const extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];
    if( !extensionesValidas.includes( extensionArchivo ) ){
        return res.status(400).json({
            status: true,
            message: 'No es una extensión permitida'
        }) 
    }

    // Generar el nombre del Archivo
    const nombreArchivo = `${ uuidv4() }.${ extensionArchivo }`;

    // Path para guardar la imagen
    const path = `./uploads/images/${coleccion}/${nombreArchivo}`;

    

    //***** Actualizar la imagen */
    const model = coleccion === 'alumnos' ? Alumno : coleccion === 'usuarios' ? Usuario : coleccion === 'avisos' ? Aviso : null  


    const currentColleccion = await model.findById( id );      
    
    if ( !currentColleccion ){
        return res.status(404).json({
            status: false,
            message: `No existe un usuario/alumno con el ID ${ id }`
        });
    }

    
    const currentPath = `./uploads/images/${coleccion}/${currentColleccion.foto}`;
    borrarImagen( currentPath )

    currentColleccion.foto = nombreArchivo;
    await currentColleccion.save()
 
    // Mover el archivo a al path
    file.mv( path, (err) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                status: false,
                message: 'Error al mover la imagen'
            })
        }    

        res.json({
            status: true,
            message: 'Imagen subida con éxito',
            nombreFoto: nombreArchivo
        })

    })


}


const borrarImagen = ( path ) => {

    if ( fs.existsSync( path ) ) {
        fs.unlinkSync( path );
    }

}


const obtenerImagen = (req, res) => {
    const coleccion = req.params.coleccion;
    const foto = req.params.foto;

    const pathImg = path.join( __dirname, `../uploads/images/${ coleccion }/${ foto }` );

    if ( fs.existsSync (pathImg) ){
        res.sendFile( pathImg )
    } else {
        const pathImg = path.join( __dirname, `../assets/no-img.jpg` );
        res.sendFile( pathImg );
    }

}


const fileUpload = async( req, res = response ) => {

    const itemId = req.params.item
    const uid = req.uid;

    // Validar que exista un archivo 
    if( !req.files || Object.keys(req.files).length === 0 ){
        return res.status(400).json({
            status: false,
            message: 'No hay ningún archivo'
        }) 
    }

    // Procesar la imagen
    const file = req.files.file;

    const nombreCortado = file.name.split('.'); //nombre.archivo.jpg
    const extensionArchivo = nombreCortado[ nombreCortado.length - 1 ];

    
    const extensionesValidas = ['pdf', 'docx' ];
    if( !extensionesValidas.includes( extensionArchivo ) ){
        return res.status(400).json({
            status: true,
            message: 'No es una extensión permitida'
        }) 
    }


    // Generar el nombre del Archivo
    const nombreArchivo = `${ uuidv4() }.${ extensionArchivo }`;


    // Path para guardar el archivo
    const alumno = await Alumno.findById( uid );
    const path = `./uploads/expedientes/${ alumno.numero_control }/${nombreArchivo}`;



    
    res.status(200).json({
        status: true,
        path
    })

} 


const obtenerFirma = (req, res) => {
    const coleccion = req.params.coleccion;
    const firma = req.params.firma;

    const pathImg = path.join( __dirname, `../uploads/firmas/${ coleccion }/${ firma }` );

    if ( fs.existsSync (pathImg) ){
        res.sendFile( pathImg )
    } else {
        const pathImg = path.join( __dirname, `../assets/no-img.jpg` );
        res.sendFile( pathImg );
    }

}


const firmaUpload = async( req, res = response ) => {

    const coleccion = req.params.coleccion;
    const id = req.params.id

    const coleccionesValidas = ['usuarios', 'alumnos'];

    if ( !coleccionesValidas.includes( coleccion ) ){
        return res.status(400).json({
            status: false,
            message: 'No es una coleccción válida'
        })
    }

    // Validar que exista un archivo 
    if( !req.files || Object.keys(req.files).length === 0 ){
        return res.status(400).json({
            status: false,
            message: 'No hay ningún archivo'
        }) 
    }


    // Procesar la imagen de firma
    const file = req.files.firma;

    const nombreCortado = file.name.split('.'); //nombre.archivo.jpg
    const extensionArchivo = nombreCortado[ nombreCortado.length - 1 ];

    const extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];
    if( !extensionesValidas.includes( extensionArchivo ) ){
        return res.status(400).json({
            status: true,
            message: 'No es una extensión permitida'
        }) 
    }

    // Generar el nombre del Archivo
    const nombreArchivo = `${ uuidv4() }.${ extensionArchivo }`;

    // Path para guardar la imagen
    const path = `./uploads/firmas/${coleccion}/${nombreArchivo}`;

    

    //***** Actualizar la imagen */
    const model = coleccion === 'alumnos' ? Alumno : coleccion === 'usuarios' ? Usuario : null  


    const currentColleccion = await model.findById( id );      
    
    if ( !currentColleccion ){
        return res.status(404).json({
            status: false,
            message: `No existe un usuario/alumno con el ID ${ id }`
        });
    }


    const currentPath = `./uploads/firmas/${coleccion}/${currentColleccion.firma}`;
    borrarImagen( currentPath )

    currentColleccion.firma = nombreArchivo;
    await currentColleccion.save()
 
    // Mover el archivo a al path
    file.mv( path, (err) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                status: false,
                message: 'Error al mover la firma'
            })
        }    

        res.json({
            status: true,
            message: 'Firma subida con éxito',
            nombreFoto: nombreArchivo
        })

    })


}



const deleteFirma = async(req, res = response) => {

    const id = req.params.idAlumno;

    const alumnodb = await Alumno.findById(id)
                            .populate('carrera');

    if ( !alumnodb ) {
        return res.status(404).json({
            status: false,
            message: `No existe un alumno con el ID ${id}`
        })
    }

    const pathFirma = path.join( __dirname, `../uploads/firmas/alumnos/${ alumnodb.firma }` );

    borrarImagen( pathFirma );

    alumnodb.firma = undefined;

    await alumnodb.save();


    res.status(200).json({
        status: true,
        message: 'Firma eliminada con éxito',
        alumno: alumnodb
    })

}





module.exports = {
    imageUpload,
    firmaUpload,
    obtenerImagen,
    fileUpload,
    deleteFirma,
    obtenerFirma
}