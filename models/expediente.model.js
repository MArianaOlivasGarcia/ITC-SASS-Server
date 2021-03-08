const { Schema, model, Types } = require('mongoose');
const Alumno = require('./alumno.model');
const Solicitud = require('./solicitud.model');
const moment = require('moment-timezone')

const ExpedienteSchema = Schema({

    solicitud: { type: Types.ObjectId, ref: 'Solicitud', required: true },
    alumno: { type: Types.ObjectId, ref: 'Alumno', required: true },
    items: [{ type: Types.ObjectId, ref: 'Item'}],   
    apertura: { type: String, default: moment().format("YYYY-MM-DD") },
    cierre: { type: String },
    periodo: { type: Types.ObjectId, ref: 'Periodo' },

    finalizado: { type: Boolean, default: false },


}, { collection: 'expedientes'});


ExpedienteSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
})

ExpedienteSchema.pre('save', async function(next) {

    // Asignarle el expediente al alumno
    const alumnodb = await Alumno.findById(this.alumno);
    alumnodb.expediente = this.id;
    await alumnodb.save();

    const solicitud = await Solicitud.findById(this.solicitud);
    this.periodo = solicitud.periodo;

    next();
    
})


module.exports = model('Expediente', ExpedienteSchema)