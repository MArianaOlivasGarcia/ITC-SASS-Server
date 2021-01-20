const { response } = require("express");
const Item = require('../models/item-expediente.model');
const Alumno = require('../models/alumno.model');


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


const getAllByCodigo = async(req, res = response) => {

    const codigo = req.params.codigo;

    const [aprobados, rechazados, pendientes] = await Promise.all([
        Item.find({codigo, arpobado: true}),
        Item.find({codigo, rechazado: true}),
        Item.find({codigo, revision: true})
    ])


    for (let i = 0; i < pendientes.length; i++) {
        const pendiente = pendientes[i];
        const alumno = await Alumno.findOne({expediente: pendiente.expediente});
        pendiente.alumno = alumno;
    }

    for (let i = 0; i < aprobados.length; i++) {
        const aprobado = aprobados[i];
        const alumno = await Alumno.findOne({expediente: aprobado.expediente});
        aprobado.alumno = alumno;
    }

    for (let i = 0; i < rechazados.length; i++) {
        const rechazado = rechazados[i];
        const alumno = await Alumno.findOne({expediente: rechazado.expediente});
        rechazado.alumno = alumno;
    }

    res.status(200).json({
        aprobados,
        rechazados,
        pendientes
    })

}


const getByStatusAndCodigo = async(req, res = response) => {

    const status = req.params.status;
    const codigo = req.params.codigo;
    const desde = Number(req.query.desde) || 0;

   try {

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
            message: 'El archivo ha sido rechazada.',
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