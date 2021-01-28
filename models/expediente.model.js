const { Schema, model, Types } = require('mongoose');


const ExpedienteSchema = Schema({

    solicitud: { type: Types.ObjectId, ref: 'Solicitud', required: true },
    alumno: { type: Types.ObjectId, ref: 'Alumno', required: true },
    items: [{ type: Types.ObjectId, ref: 'Item'}],   
    fecha_termino: { type: Date, default: Date.now },
    fecha_inicio: { type: Date, default: Date.now },

}, { collection: 'expedientes'});


ExpedienteSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
})

module.exports = model('Expediente', ExpedienteSchema)