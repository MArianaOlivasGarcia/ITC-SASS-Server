const { Schema, model, Types } = require('mongoose');

const SolicitudSchema = Schema({

    alumno: { type: Types.ObjectId, ref: 'Alumno', required: true },
    proyecto: { type: Types.ObjectId, ref: 'Proyecto', required: true },
    // Validado
    valido: { type: Types.ObjectId, ref: 'Usuario'}, 
   
    error: {
        motivo: { type: String },
        observacion: { type: String },
    },
    // Estado de la solicitud
    pendiente: { type: Boolean, default: true },
    rechazado: { type: Boolean, default: false },
    aceptado: { type: Boolean, default: false },
    fecha_envio: { type: Date, default: Date.now() }

}, { collection: 'solicitudes', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });


SolicitudSchema.method('toJSON', function() {
    const { __v, updated_at, ...object } = this.toObject();
    return object;
})



module.exports = model('Solicitud', SolicitudSchema)