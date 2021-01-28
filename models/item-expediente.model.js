const { Schema, model, Types } = require('mongoose');

const ItemExpedienteSchema = Schema({
    
    alumno: { type: Types.ObjectId, ref:'Alumno', required: true},

    // AutoIncrementable
    numero: { type: Number },

    expediente: { type: Types.ObjectId, ref:'Expediente', required: true},
    titulo: { type: String },
    codigo: { type: String },
    archivoTemp: { type: String },
    archivo: { type: String },
    
    

    fecha_limite: { type: Date, default: Date.now() },
    fecha_entrega: { type: Date },
    fecha_aprobacion: { type: Date },

    error: { 
        observacion: { type: String },
        motivo: { type: String },
    },

    // Estados
    // El documento ya esta aprobado
    aceptado: { type: Boolean, default: false},
    // El documento es rechazado
    rechazado: { type: Boolean, default: false},
    // El documento fue enviado a revisión
    pendiente: { type: Boolean, default: false},
    
    
    // Requiere reenvio
    reenvio_required: { type: Boolean, default: false },
    // el item es de vinculacion a alumno
    entrante: { type: Boolean, default: false},
    // Documento que no se genera
    entrega: { type: Boolean, default: false },


    // El item esta disponible
    disponible: { type: Boolean, default: false},
    // El item no esta iniciado
    iniciado: { type: Boolean, default: false},
    // Item no finalizado
    proceso: { type: Boolean, default: false },
    // El item ya finalizo, esta terminado
    finalizado: { type: Boolean, default: false },

    valido: { type: Types.ObjectId, ref:'Usuario' },


}, { collection: 'items'});



ItemExpedienteSchema.method('toJSON', function() {
    const { __v, updated_at, ...object } = this.toObject();
    return object;
})

module.exports = model('Item', ItemExpedienteSchema)