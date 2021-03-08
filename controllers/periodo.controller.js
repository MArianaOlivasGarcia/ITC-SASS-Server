const { response } = require("express");
const Periodo = require("../models/periodo.model");
const moment = require('moment-timezone');

const getAll = async(req, res = response) => {

    try {
        const periodos = await Periodo.find({}).sort({codigo: -1})

        res.status(200).json({
            status: true,
            periodos
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }



}




const getAllPaginados = async(req, res = response) => {

    try {

        const desde = Number(req.query.desde) || 0;

        const [periodos, total] = await Promise.all([
            Periodo.find({}).skip(desde).limit(5).sort({codigo: -1}),
            Periodo.countDocuments({})
        ]);

        res.status(200).json({
            status: true,
            periodos,
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


const create = async(req, res = response) => {

    
    const { isActual, isProximo } = req.body;

    if ( isActual && isProximo ) {
        return res.status(400).json({
            status: false,
            message: 'No es posible asignar un proyecto como actual y próximo.'
        })
    }

    const existProximo = await Periodo.findOne({isProximo:true})
    const { recepcion_solicitudes: { termino } } = existProximo;
    const hoy = new Date(moment().format("YYYY-MM-DD")).getTime();
    const frt = new Date(termino).getTime();

    if ( hoy <= frt ){
        return res.status(400).json({
            status: false,
            message: `Aun no termina la recepción de solicitudes de servicio social para el periodo ${existProximo.nombre}.`
        })
    }
    

    const periodo = new Periodo(req.body);
    
    await Promise.all([
        // El que era proximo ahora sera el actual
        Periodo.findOneAndUpdate({isProximo:true}, {isProximo:false, isActual:true}),
        // El que era actual ya no lo será
        Periodo.findOneAndUpdate({isActual:true}, {isActual:false}),
        
        periodo.save()
    ]);

    

    res.status(201).json({
        status: true,
        /* periodo */
    })

}



const upadate = async(req, res = response) => {
    
    const id = req.params.id
    const { isActual, isProximo } = req.body;

    try {
        if ( isActual && isProximo ) {
            return res.status(400).json({
                status: false,
                message: 'No es posible asignar un proyecto como actual y próximo.'
            })
        }

        // Si el periodo es actual, cambiar el que actualimente isActual a false
        if ( isActual ) {
            // Si hay uno actual
            const existActual = await Periodo.findOne({isActual:true});
            existActual.isActual = false;
            await existActual.save();

        }

        const existProximo = await Periodo.findOne({isProximo:true});
        if ( isProximo && existProximo) {
            // Si hay uno actual
            existProximo.isProximo = false;
            await existProximo.save();

        }

        const periododb = await Periodo.findById(id);

        if( !periododb ) {
            return res.status(404).json({
                status: false,
                message: `No existe un periodo con el ID ${id}`
            })
        }

        const periodoActualizado = await Periodo.findByIdAndUpdate(id, req.body, {new:true})
        
        res.status(200).json({
            status: true,
            periodo: periodoActualizado
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}


const getById = async(req, res = response ) => {

    const id = req.params.id

    try {

        const periodo = await Periodo.findById(id);


        if( !periodo ) {
            return res.status(404).json({
                status: false,
                message: `No existe un periodo con el ID ${id}`
            })
        }

        

        res.json({
            status: true,
            periodo
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}


const getProximo = async(req, res = response ) => {

    try {

        const periodo = await Periodo.findOne({isProximo:true});


        if( !periodo ) {
            return res.status(404).json({
                status: false,
                message: `No existe un periodo proximo.`
            })
        }

        

        res.json({
            status: true,
            periodo
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}

module.exports = {
    getAll,
    getAllPaginados,
    create,
    upadate,
    getById,
    getProximo
}