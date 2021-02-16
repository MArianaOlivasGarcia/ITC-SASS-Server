const { response } = require("express");
const Item = require('../models/item-expediente.model');
const Alumno = require('../models/alumno.model');
const Usuario = require('../models/usuario.model')

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

        const item = await Item.findById(idItem);

        if ( !item ) {
            return res.status(404).json({
                status: false,
                message: `No existe un item con el ID ${idItem}`
            }) 
        }


    
        const data = {
            valido: idUser,
            pendiente: false,
            aceptado: true,
            rechazado: false,
            error: undefined,
            terminado: true
        }

        const itemActualizado = await Item.findByIdAndUpdate(idItem, data, {new:true} )
            .populate('alumno')
            .populate({
                path: 'alumno',
                populate: { path: 'carrera' }
            })

        const numero = item.numero + 1;
        // TODO: Si el numero pasa la cantidad de items, no hacer nada
        // Poner disponible el proximo ITEM
        await Item.findOneAndUpdate({numero}, {disponible: true}, {new: true});
        

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

        const item = await Item.findById(idItem);

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


        const data = {
            valido: idUser,
            error: req.body,
            pendiente: false,
            aceptado: false,
            rechazado: true,
        }

        // TODO: BORRAR EL ARCHIVO YA QUE NO HA SIDO ACEPTADO,
        // DE MOMENTO LO REEMPLAZA

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





module.exports = {
    getById,
    getByStatusAndCodigo,
    aceptar,
    rechazar
}