const { response } = require("express");
const Dependencia = require("../models/dependencia.model");


const getAll = async(req, res = response) => {

    try {


        const dependencias = await Dependencia.find({}).sort('nombre')

        res.status(200).json({
            status: true,
            dependencias
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

        const [dependencias, total] = await Promise.all([
            Dependencia.find({}).sort('nombre').skip(desde).limit(5),
            Dependencia.countDocuments()
        ]);

        res.status(200).json({
            status: true,
            dependencias,
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

    const { email } = req.body;

    try {

        const doesExist = await Dependencia.findOne({ email })

        if (doesExist) {
            return res.status(400).json({
                status: false,
                message: `La dependencia con el correo electrónico ${email} ya ésta registrada.`
            })
        }

        const dependencia = new Dependencia(req.body)

        const savedDependencia = await dependencia.save()

        res.status(201).json({
            status: true,
            message: 'Dependencia creada con éxito',
            dependencia: savedDependencia
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }


}


const getById = async(req, res = response) => {

    const uid = req.params.id

    try {

        const dependencia = await Dependencia.findById(uid)
            .populate('carrera')
 
        if (!dependencia) {
            return res.status(404).json({
                status: false,
                message: 'No existe un dependencia con ese id'
            })
        }

        res.status(200).json({
            status: true,
            dependencia
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}


const update = async(req, res = response) => {

    const uid = req.params.id;

    try {

        const dependencia = await Dependencia.findById(uid);

        if (!dependencia) {
            return res.status(404).json({
                status: false,
                message: 'No existe un dependencia con ese id'
            })
        }


        const { email } = req.body;

        if (dependencia.email !== email) {

            const doesExist = await Dependencia.findOne({ email })

            if (doesExist) {
                return res.status(400).json({
                    status: false,
                    message: 'Ya existe una dependencia con ese correo electrónico'
                })
            }

        }



        const dependenciaActualizada = await Dependencia.findByIdAndUpdate(uid, req.body, { new: true });

        res.status(200).json({
            status: true,
            dependencia: dependenciaActualizada
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
    create,
    getAll,
    getAllPaginados,
    getById,
    update
}