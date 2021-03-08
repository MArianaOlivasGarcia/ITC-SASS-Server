const { response } = require('express');

const fs = require('fs');
const path = require('path');
const libre = require('libreoffice-convert-win');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater')
const moment = require('moment-timezone')

const expressions = require('angular-expressions');
const assign = require("lodash/assign");

const Item = require('../models/item-expediente.model');
const Usuario = require('../models/usuario.model')
const Alumno = require('../models/alumno.model');
const Expediente = require('../models/expediente.model');



const getById = async(req, res = response) => {

    try{

        const uid = req.params.id;
        
        const item = await Item.findById(uid)
                                .populate('alumno')
                                .populate({
                                    path: 'alumno',
                                    populate: { path: 'carrera' }
                                })

        if ( !item ) {
            return res.status(404).json({
                status: false,
                message: `No existe un item con el ID ${uid}`
            })
        }

        

        res.status(200).json({
            status: true,
            item
        })

    } catch(error){
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}

const getByStatusAndCodigo = async(req, res = response) => {

    const status = req.params.status;
    const codigo = req.params.codigo;
    const desde = Number(req.query.desde) || 0;

    const idUser = req.uid; 

   try {
 
        const usuario = await Usuario.findById(idUser)
                            .populate('gestion')

        if( usuario.gestion.nombre == 'TODAS' ) {

            let items = []; 
            let total;
            switch( status ) {

                case 'pendiente': 
                    [items, total] = await Promise.all([
                                                Item.find({pendiente: true, codigo})/* .sort('create_at') */.skip(desde).limit(5)
                                                                    .populate('alumno')
                                                                    .populate({
                                                                        path: 'alumno',
                                                                        populate: { path: 'carrera'}
                                                                    }),
                                                Item.countDocuments({pendiente: true, codigo})
                                            ]);
                break;

                case 'aceptado':
                    [items, total] = await Promise.all([
                                                Item.find({aceptado: true, codigo})/* .sort('create_at') */.skip(desde).limit(5)
                                                                    .populate('alumno')
                                                                    .populate({
                                                                        path: 'alumno',
                                                                        populate: { path: 'carrera'}
                                                                    }),
                                                Item.countDocuments({aceptado: true, codigo})
                                            ]);
                break;

                case 'rechazado':
                    [items, total] = await Promise.all([
                                                Item.find({rechazado: true, codigo})/* .sort('create_at') */.skip(desde).limit(5)
                                                                    .populate('alumno')
                                                                    .populate({
                                                                        path: 'alumno',
                                                                        populate: { path: 'carrera'}
                                                                    }),
                                                Item.countDocuments({rechazado: true, codigo})
                                            ]);
                break;
                                        
                default:
                    return res.status(400).json({
                        status: false,
                        message: 'Los estados permitidos son pendiente, aceptado, rechazado'
                    })
            }

            res.json({
                status: true,
                items,
                total
            })

        } else {
            let items = []; 
            let itemsTemp = [];
            let total;
            switch( status ) {

                case 'pendiente': 
                    itemsTemp = await Item.find({pendiente: true, codigo})/* .sort('create_at') */.skip(desde).limit(5)
                                                                    .populate('alumno')
                                                                    .populate({
                                                                        path: 'alumno',
                                                                        populate: { path: 'carrera'}
                                                                    });
                    items = itemsTemp.filter( item => {
                        const { gestion } = usuario;
                        const { carrera } = item.alumno;

                        return gestion._id == carrera._id.toString();
                    })

                    total = items.length;

                break;

                case 'aceptado':
                    itemsTemp = await Item.find({aceptado: true, codigo})/* .sort('create_at') */.skip(desde).limit(5)
                                                                    .populate('alumno')
                                                                    .populate({
                                                                        path: 'alumno',
                                                                        populate: { path: 'carrera'}
                                                                    });
                    items = itemsTemp.filter( item => {
                        const { gestion } = usuario;
                        const { carrera } = item.alumno;
                        
                        return gestion._id == carrera._id.toString();
                    })
                        
                    total = items.length;
                break;

                case 'rechazado':
                    itemsTemp = await Item.find({rechazado: true, codigo})/* .sort('create_at') */.skip(desde).limit(5)
                                                                    .populate('alumno')
                                                                    .populate({
                                                                        path: 'alumno',
                                                                        populate: { path: 'carrera'}
                                                                    });

                    items = itemsTemp.filter( item => {
                        const { gestion } = usuario;
                        const { carrera } = item.alumno;
                                                
                        return gestion._id == carrera._id.toString();
                    })
                                                
                    total = items.length;

                break;
                                        
                default:
                    return res.status(400).json({
                        status: false,
                        message: 'Los estados permitidos son pendiente, aceptado, rechazado'
                    })
            }

            res.json({
                status: true,
                items,
                total
            })
        }
        
    

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }



}

const aceptar = async(req, res = response) => {

    const idItem = req.params.id;
    const idUser = req.uid;
 
    

    try {

        const item = await Item.findById(idItem).populate('alumno', 'numero_control');

        if ( !item ) {
            return res.status(404).json({
                status: false,
                message: `No existe un item con el ID ${idItem}`
            }) 
        }

        // Verificar que el item anterior este aceptado si no no puede avanzar}
        // Las tareas se realizan en orden aunque tengan la misma fecha
       const itemAnterior = await Item.findOne({numero: item.numero-1, alumno:item.alumno});

        if ( !itemAnterior.finalizado ) {
            return res.status(400).json({
                status: false,
                message: `No has enviado el archivo anterior a este (${itemAnterior.titulo}).`
            })
        }


        const dataItem = {
            usuario_valido: idUser,
            pendiente: false,
            aceptado: true,
            rechazado: false,
            finalizado: true,
            $unset: {error: 1 },
            terminado: true,
            fecha_validacion: moment().format("YYYY-MM-DD")
        }

        // SI ES REENVIO REQUIRE BORRAR EL ARCHIVO ORIGINAL DE LA CARPETA "original""
        if ( item.reenvio_required ) {
            const pathArchivoOriginal = `./uploads/expedientes/original/${item.archivoOriginal}`;
            borrarArchivo( pathArchivoOriginal );
        }

        // EL ITEM ES ENTREGA
        if ( item.entrega || item.reenvio_required ) {

            const { archivoTemp } = item;
            const pathArchivo = `./uploads/expedientes/temp/${archivoTemp}`;
            const pathDestino = `./uploads/expedientes/${item.alumno.numero_control}/${archivoTemp}`;

            // Cambiar de carpeta a la del alumno cuando ya es aceptado
            if ( fs.existsSync( pathArchivo ) ) {
                fs.renameSync(pathArchivo, pathDestino)
                await item.updateOne({archivo: archivoTemp, $unset: {archivoTemp: 1, archivoOriginal: 1}});
            } else { 
                return res.status(400).json({
                    status: true,
                    message: `No existe el archivo ${archivoTemp}.` 
                })
            }

        } 



        const itemActualizado = await Item.findByIdAndUpdate(idItem, dataItem, {new:true} )
            .populate('alumno')
            .populate({
                path: 'alumno',
                populate: { path: 'carrera' }
            })

        // Ya que paso todo el proceso de aceptación, si el item es CARTA ACEPTACION
        // Generarle su Carta asignacion
        if ( itemActualizado.codigo == "CARTA-ACEPTACION") {
            // Generar su Carta de asignación
            const alumno = await Alumno.findById(item.alumno._id)
                                            .populate('proyecto')
                                            .populate('carrera')
            
            const extensionArchivo = 'docx';
            const codigoAsignacion = 'ITC-VI-PO-002-03';
            const nombreArchivo = `${alumno.numero_control}-${codigoAsignacion}.${ extensionArchivo }`
            
            const data = {
                alumno: alumno.toJSON(),
                proyecto: alumno.proyecto.toJSON(),
                hoy: moment().format("DD/MM/YYYY"),
            }

            await Promise.all([
                crearArchivo( codigoAsignacion, data, nombreArchivo, alumno),
                convertirPDF( nombreArchivo, alumno.numero_control),
            ])

             const numero = itemActualizado.numero + 1;
             const dataProx = {
                disponible: true,
                iniciado: true,
                finalizado: true,
/*                 aceptado: true,
 */             archivo: `${alumno.numero_control}-${codigoAsignacion}.pdf`
            }
            
            await Promise.all([
                Item.findOneAndUpdate({/* numero */codigo: codigoAsignacion, alumno:  itemActualizado.alumno}, dataProx, {new: true}),
                Item.findOneAndUpdate({numero: numero+1, alumno: itemActualizado.alumno}, {disponible: true}, {new: true}),
            ]);

            // Si es la ultima evaluacion, el ultimo documento que se genera
        } else if ( itemActualizado.codigo == "CARTA-TERMINACION") {
            // Si la evaluacion final
            // Generar la carta de terminacion
            const alumno = await Alumno.findById(item.alumno._id)
                                            .populate('proyecto')
                                            .populate('carrera')
            
            const extensionArchivo = 'docx';
            const codigoTerminacion = 'ITC-TERMINACION';
            const nombreArchivo = `${alumno.numero_control}-${codigoTerminacion}.${ extensionArchivo }`
            
            const data = {
                alumno: alumno.toJSON(),
                proyecto: alumno.proyecto.toJSON(),
                hoy: moment().format("DD/MM/YYYY"),
            }

            await Promise.all([
                crearArchivo( codigoTerminacion, data, nombreArchivo, alumno),
                convertirPDF( nombreArchivo, alumno.numero_control),
            ])

            //Modificar el expediente y darlo como finalizado
            // cierre fecha
            // finalizado true
            const dataProx = {
                disponible: true,
                iniciado: true,
                finalizado: true,
/*                 aceptado: true,
 */             archivo: `${alumno.numero_control}-${codigoTerminacion}.pdf`
            }


            const hoy = moment().format("DD/MM/YYYY")
            await Promise.all([
                Item.findOneAndUpdate({codigo: codigoTerminacion, alumno:  itemActualizado.alumno}, dataProx, {new: true}),
                Expediente.findOneAndUpdate({alumno:  itemActualizado.alumno}, {cierre: hoy, finalizado: true}, {new:true})
            ]);

        } else {

            const numero = itemActualizado.numero;
            const proxItem = await Item.findOne({numero: numero+1, alumno: itemActualizado.alumno});

            if ( proxItem.isBimestral && !proxItem.disponible ){
            
                await Item.updateMany({isBimestral:true, numero_bimestre: proxItem.numero_bimestre, alumno: itemActualizado.alumno}, {disponible:true})
                

            } else {
                await Item.findOneAndUpdate({numero: numero+1, alumno: itemActualizado.alumno}, {disponible: true}, {new: true});
            }

        }
        



        res.json({
            status: true,
            message: 'El archivo ha sido aceptado.',
            item: itemActualizado
        })

    } catch(error){
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }



}

const rechazar = async(req, res = response) => {

    const idItem = req.params.id;
    const idUser = req.uid;

    try {

        const item = await Item.findById(idItem)
                                .populate('alumno');

        if ( !item ) {
            return res.status(404).json({
                status: false,
                message: `No existe un item con el ID ${idItem}.`
            }) 
        }

        // VERIFICAR QUE NO ESTE ACEPTADA
        if ( item.aceptado ) {
            return res.status(400).json({
                status: false,
                message: `El archivo ya ha sido aceptado.`
            }) 
        }


        let data = null;

        if ( item.reenvio_required ) {
            data = { 
                usuario_valido: idUser,
                error: req.body,
                pendiente: false,
                aceptado: false,
                rechazado: true,
                fecha_validacion: moment().format("YYYY-MM-DD"),
                $unset: {archivoTemp: 1},
            }
        } else {
            data = { 
                usuario_valido: idUser,
                error: req.body,
                pendiente: false,
                aceptado: false,
                rechazado: true,
                fecha_validacion: moment().format("YYYY-MM-DD"),
            }
        }

        
        
        // BORRAR EL ARCHIVO YA QUE HA SIDO RECHAZADO
        const viejoPath = path.join( __dirname, `../uploads/expedientes/${item.alumno.numero_control}/${item.archivo}` );
                                            
        if ( fs.existsSync( viejoPath ) ) {
            fs.unlinkSync( viejoPath );
        }

        const itemActualizado = await Item.findByIdAndUpdate(idItem, data, {new:true} )
                                        .populate('alumno')
                                        .populate({
                                            path: 'alumno',
                                            populate: { path: 'carrera' }
                                        })
        
        res.json({
            status: true,
            message: 'El archivo ha sido rechazado.',
            item: itemActualizado
        })

    } catch(error){ 
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }



}

const actualizarFechas = async (req, res = response ) => {

    const uid = req.params.id;
    const { fecha_inicial, fecha_limite } = req.body;
    
    try{

        const item = await Item.findById(uid);

        if (!item) {
            return res.status(404).json({
                status: false,
                message: `No existe un item con el id ${uid}`
            })
        }

        const itemActualizado = await Item.findByIdAndUpdate(uid, {fecha_inicial, fecha_limite}, {new:true});

        return res.status(200).json({
            status: true,
            item: itemActualizado
        })

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}

const actualizarFechasByCodigoAndPeriodo = async (req, res = response ) => {

    const codigo = req.params.codigo;
    const periodo = req.params.periodo;
    const { fecha_inicial, fecha_limite } = req.body;
    
    try{

        const items = await Item.find({codigo, periodo});

        if (items.length == 0) {
            return res.status(404).json({
                status: false,
                message: `No hay items que puedan ser actualizados.`
            })
        }

        items.forEach( async item => {
            await Item.findByIdAndUpdate(item, {fecha_inicial, fecha_limite}, {new:true});
        });


        return res.status(200).json({
            status: true,
            message: 'Fechas actualizadas con éxito.'
        })

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}



// ******************
// FUNCIONES DE AYUDA 
// ******************

expressions.filters.lower = function(input) {
    if(!input) return input;
    return input.toLowerCase();
}

function angularParser(tag) {
    if (tag === '.') {
        return {
            get: function(s){ return s;}
        };
    }
    const expr = expressions.compile(
        tag.replace(/(’|‘)/g, "'").replace(/(“|”)/g, '"')
    );
    return {
        get: function(scope, context) {
            let obj = {};
            const scopeList = context.scopeList;
            const num = context.num;
            for (let i = 0, len = num + 1; i < len; i++) {
                obj = assign(obj, scopeList[i]);
            }
            return expr(scope, obj);
        }
    };
}

const crearArchivo = async( codigo, data, nombreArchivo, alumno ) => {

    // codigo, el archivo template (el que se va aditar)
    // data, Información

    const content = fs.readFileSync(path.resolve( __dirname, `../assets/archivos/${codigo}.docx`), 'binary');

    const zip = new PizZip(content);
    let doc;
    try {
        doc = new Docxtemplater(zip, {parser:angularParser});
    } catch (error) {
        console.log(error)
    }
    doc.setData(data)

    try {
        doc.render()
    } catch (error) {
        console.log(error)
    }

    const buf = doc.getZip().generate({type: 'nodebuffer'})

    const numeroControl = alumno.numero_control;
    const carpetaAlumno = path.resolve(__dirname, `../uploads/expedientes/${numeroControl}`);

    if ( !fs.existsSync(carpetaAlumno) ) {
        fs.mkdirSync(carpetaAlumno)
    }


    fs.writeFileSync(path.resolve(__dirname, `${carpetaAlumno}/${nombreArchivo}`), buf)

}

const convertirPDF = async(nombreArchivo, numeroControl) => {

    const extend = '.pdf'

    const carpetaAlumno = path.resolve(__dirname, `../uploads/expedientes/${numeroControl}`);

    if ( !fs.existsSync(carpetaAlumno) ) {
        fs.mkdirSync(carpetaAlumno)
    }

    const enterPath = path.resolve(__dirname, `${carpetaAlumno}/${nombreArchivo}`);
    const outputPath = path.resolve(__dirname, `${carpetaAlumno}/${nombreArchivo.split('.')[0]}${extend}`);

    const file = fs.readFileSync(enterPath);
    // Convert it to pdf format with undefined filter (see Libreoffice doc about filter)
    libre.convert(file, extend, undefined, (err, done) => {
        if( err ) {
            console.log('ERROR' + err)
        }

        fs.writeFileSync(outputPath, done)
    })

}



const borrarArchivo = (path) => {

    if ( fs.existsSync( path ) ) {
        fs.unlinkSync( path );
    }
        
}




module.exports = {
    getById,
    getByStatusAndCodigo,
    aceptar,
    rechazar,
    actualizarFechas,
    actualizarFechasByCodigoAndPeriodo
}



