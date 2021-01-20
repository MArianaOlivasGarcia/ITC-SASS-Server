const { Schema, model, Types } = require('mongoose');


const ExpedienteSchema = Schema({

    programa: { type: Types.ObjectId, ref: 'Programa', required: true },
    alumno: { type: Types.ObjectId, ref: 'Alumno', required: true },
    items: [{ type: Types.ObjectId, ref: 'Item'}],   
    fecha_termino: { type: Date, default: Date.now },
    fecha_inicio: { type: Date, default: Date.now },

}, { collection: 'expedientes', timestamps: { createdAt: 'create_at', updatedAt: 'updated_at' } });


ExpedienteSchema.method('toJSON', function() {
    const { __v, updated_at, ...object } = this.toObject();
    return object;
})

module.exports = model('Expediente', ExpedienteSchema)