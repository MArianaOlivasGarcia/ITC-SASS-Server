const { response } = require('express');
const Alumno = require('../models/alumno.model');
const Item = require('../models/item-expediente.model');
const bcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt.helper')
const { getMenuAlumnoFrontEnd } = require('../helpers/menu-frontend.helper');


const register = async(req, res = response) => {

    const { numero_control } = req.body

    try {


        const doesExist = await Alumno.findOne({ numero_control })

        if (doesExist) {
            return res.status(400).json({
                status: false,
                message: `Alumno con el No. Control ${numero_control} ya ésta registrado.`
            })
        }

        const alumno = new Alumno(req.body)

        // ** Encriptar contraseña **//
        const salt = bcrypt.genSaltSync();
        alumno.password = bcrypt.hashSync(numero_control.toString(), salt);

        const savedAlumno = await alumno.save();

        //** Generar Token **/
        const token = await generarJWT(savedAlumno.id);

        res.status(201).json({
            status: true,
            message: `Alumno creado con éxito`,
            alumno: savedAlumno,
            accessToken: token
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}


const login = async(req, res = response) => {

    const { numero_control, password } = req.body;

    try {
    
        const alumno = await Alumno.findOne({ numero_control })


        if (!alumno) {
            return res.status(404).json({
                status: false,
                message: 'No. de control y/o Contraseña invalido(s) -N'
            })
        }


        const validarPassword = bcrypt.compareSync( password, alumno.password)


        if (!validarPassword) {
            return res.status(404).json({
                status: false,
                message: 'No. de control y/o Contraseña invalido(s) -P'
            });
        }

        const token = await generarJWT(alumno.id);


        res.status(200).json({
            status: true,
            alumno,
            menu: getMenuAlumnoFrontEnd(),
            accessToken: token
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }
    
}


const renovarJWT = async(req, res = response) => {

    const uid = req.uid

    const accessToken = await generarJWT(uid)

    const user = await Alumno.findById(uid)
                        .populate('carrera')
                        .populate('proyecto')
                        .populate({
                            path: 'proyecto',
                            populate: { path: 'dependencia'}
                        })
                        .populate('expediente')


    if ( user.expediente ) {
        const items = await Item.find({expediente: user.expediente })
        user.expediente.items = items;
    }

    res.json({
        status: true,
        user,
        menu: getMenuAlumnoFrontEnd(),
        accessToken
    })
}




const getAll = async(req, res = response) => {

    const desde = Number(req.query.desde) || 0;

    try {

        const [alumnos, total] = await Promise.all([
            Alumno.find({}).populate('carrera').skip(desde).limit(5),
            Alumno.countDocuments()
        ]);

        res.status(200).json({
            status: true,
            alumnos,
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


const getAllByCarrera = async(req, res = response) => {

    const carrera = req.params.carrera;
    const desde = Number(req.query.desde) || 0;

    try {

        const [alumnos, total] = await Promise.all([
            Alumno.find({ carrera }).populate('carrera').skip(desde).limit(5),
            Alumno.countDocuments({ carrera })
        ]);

        res.status(200).json({
            status: true,
            alumnos,
            total
        })

    } catch (error) {

        return res.status(500).json({
            status: true,
            message: 'Hable con el administrador'
        })

    }

}



const getById = async(req, res = response) => {

    const uid = req.params.id

    try {

        const alumno = await Alumno.findById(uid)
            .populate('carrera')

        if (!alumno) {
            return res.status(404).json({
                status: false,
                message: 'No existe un alumno con ese id'
            })
        }

        return res.status(200).json({
            status: true,
            alumno
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

        const alumno = await Alumno.findById(uid);

        if (!alumno) {
            return res.status(404).json({
                status: false,
                message: 'No existe un alumno con ese id'
            })
        }

        const { password, numero_control, ...campos } = req.body;

        if (alumno.numero_control !== numero_control) {

            const doesExist = await Alumno.findOne({ numero_control })

            if (doesExist) {
                return res.status(400).json({
                    status: false,
                    message: 'Ya existe un Alumno con ese No. de Control'
                })
            }

        }

        campos.numero_control = numero_control;

        const alumnoActualizado = await Alumno.findByIdAndUpdate(uid, campos, { new: true });

        res.status(200).json({
            status: true,
            alumno: alumnoActualizado
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}


const renovarPassword = async(req, res = response) => {

    const uidAlumno = req.params.id;
    
    try {
        const { password } = req.body

        const alumno = await Alumno.findById( uidAlumno )

        if ( !alumno ) {
            return res.status(400).json({
                status: false,
                message: `El alumno con el id ${ uidAlumno } no existe.`
            })
        }

        // Encriptar la nueva contraseña
        const salt = bcrypt.genSaltSync();
        const newPassword  = bcrypt.hashSync( password, salt);


        // Actualizar 
        const alumnoActualizado = await Alumno.findByIdAndUpdate( uidAlumno, {password: newPassword}, { new: true });


        res.status(201).json({
            status: true,
            message: 'Contraseña actualizada con éxito',
            alumno: alumnoActualizado
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}



const changePassword = async(req, res = response) => {

    const uidAlumno = req.uid;
    const { old_password, new_password } = req.body

    try {


        const alumno = await Alumno.findById( uidAlumno )

        if ( !alumno ) {
            return res.status(400).json({
                status: false,
                message: `El alumno con el id ${ uidAlumno } no existe.`
            })
        }


        // Validar contraseña anterior
        const validarPassword = bcrypt.compareSync(old_password, alumno.password)

        if (!validarPassword) {
            return res.status(404).json({
                status: false,
                message: 'La Contraseña anterior no coincide.'
            });
        }

        // Encriptar la nueva contraseña
        const salt = bcrypt.genSaltSync();
        const password  = bcrypt.hashSync( new_password.toString(), salt);


        // Actualizar 
        const alumnoActualizado = await Alumno.findByIdAndUpdate(uidAlumno, {password}, { new: true });



        res.status(201).json({
            status: true,
            message: 'Contraseña actualizada con éxito',
            alumno: alumnoActualizado
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}


const asignarProyecto = async(req,res = response) => {

    const id = req.uid;
    const proyecto  = req.body

    const alumnoActualizado = await Alumno.findByIdAndUpdate(id, {proyecto}, {new: true})
                                        .populate('proyecto')
                                        .populate({
                                            path: 'proyecto',
                                            populate: { path: 'dependencia' }
                                        });

    if ( !alumnoActualizado ) {
        return res.status(404).json({
            status: false,
            message: `No existe un alumno con el ID ${id}`
        })
    }

    
    res.status(200).json({
        status: true,
        proyecto: alumnoActualizado.proyecto
    })

}






module.exports = {
    register,
    login,
    renovarJWT,
    getAll,
    getAllByCarrera,
    getById,
    update,
    changePassword,
    renovarPassword,
    asignarProyecto
}