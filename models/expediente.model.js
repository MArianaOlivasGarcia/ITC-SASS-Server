const { Schema, model, Types } = require('mongoose');


const ExpedienteSchema = Schema({

    alumno: { type: Types.ObjectId, ref: 'Alumno', required: true },
    items: [{ type: Types.ObjectId, ref: 'Item'}],
    finished_at: Date

}, { collection: 'expedientes', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });


ExpedienteSchema.method('toJSON', function() {
    const { __v, updated_at, ...object } = this.toObject();
    return object;
})

module.exports = model('Expediente', ExpedienteSchema)