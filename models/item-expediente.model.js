const { Schema, model, Types } = require('mongoose');


const statusValidos = {
    values: ['Aprobado', 'Rechazado', 'En revisión', 'No iniciado', 'Entrante'],
    message: '{VALUE} no es un status válido'
}


const ItemExpedienteSchema = Schema({

    numero: { type: Number },

    expediente: { type: Types.ObjectId, ref:'Expediente', required: true},
    titulo: { type: String },
    template: { type: String },
    archivo: { type: String },
    codigo: { type: String },

    fecha_limite: { type: Date, default: Date.now() },
    fecha_entrega: { type: Date },
    fecha_aprobacion: { type: Date },

    errores: { 
        observacion: { type: String },
        motivo: { type: String },
    },

    // Estados
    aprobado: { type: Boolean, default: false},
    rechazado: { type: Boolean, default: false},
    revision: { type: Boolean, default: false},
    disponible: { type: Boolean, default: false},
    entrante: { type: Boolean, default: false},
    iniciado: { type: Boolean }

}, { collection: 'items', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });



ItemExpedienteSchema.method('toJSON', function() {
    const { __v, updated_at, ...object } = this.toObject();
    return object;
})

module.exports = model('Item', ItemExpedienteSchema)