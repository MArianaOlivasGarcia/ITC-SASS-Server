

const {createReport} = require('docx-templates')

const fs = require('fs')

// Ejemplo Basico
/* const crear = async() => {

    const template = fs.readFileSync(__dirname + '/prueba.docx')

    const buffer = await createReport({
        template,
        data: {
            nombre: 'Mariana', 
            apellidos: 'Olivas García'
        },
        cmdDelimiter: ['{', '}'],
    })

    fs.writeFileSync(__dirname + '/reporte.docx', buffer)

    console.log(`Se ha creado Reporte`)

} */


// Ejemplo con data más grande
/* const crear = async() => {

    const template = fs.readFileSync(__dirname + '/prueba2.docx')

    const buffer = await createReport({
        template,
        data: {
            nombre: 'Mariana', 
            apellidos: 'Olivas García',
            carrera: {
                nombre: 'Ingeniería en Sistemas Computacionales',
                otra: {
                    nombre: 'Otra cosa'  
                }
            }
        },
        cmdDelimiter: ['{', '}'],
    })

    fs.writeFileSync(__dirname + '/reporte2.docx', buffer)

    console.log(`Se ha creado Reporte`)

}
 */



/* const crear = async( data ) => {

    const template = fs.readFileSync(__dirname + '/prueba3.docx')

    const buffer = await createReport({
        template,
        data,
        cmdDelimiter: ['{', '}'],
    })

    fs.writeFileSync(__dirname + '/reporte3.docx', buffer)

    console.log(`Se ha creado Reporte`)

} */


const crearArchivo = async( file, data, nameFile ) => {
    // file, el archivo template (el que se va aditar)
    // data, Información
    // nameFile, nombre del archivo expediente resultante

    const template = fs.readFileSync( __dirname + '/' + file )

    const buffer = await createReport({
        template,
        data,
        cmdDelimiter: ['{','}'],
    })

    fs.writeFileSync( __dirname + '/' + nameFile , buffer)


}


module.exports = {
    crearArchivo
}

