
const fs = require('fs')
const path = require('path')
const {createReport} = require('docx-templates')

const crearArchivo = async( file, data, nameFile ) => {

 
    // file, el archivo template (el que se va aditar)
    // data, Información
    // nameFile, nombre del archivo expediente resultante
    const pathTemplate = path.join( __dirname, `../assets/archivos/` );
    const template = fs.readFileSync( `${pathTemplate}${file}` )

    const buffer = await createReport({
        template,
        data,
        cmdDelimiter: ['{','}'],
    })
    // Crear el word
    const pathFinal = path.join( __dirname, `../uploads/expedientes/` );
    fs.writeFileSync( pathFinal + nameFile , buffer )
    
}



module.exports = {
    crearArchivo
}