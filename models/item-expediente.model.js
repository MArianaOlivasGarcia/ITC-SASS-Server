const { Schema, model } = require('mongoose');


const statusValidos = {
    values: ['Aprobado', 'Rechazado', 'En revisión', 'No iniciado', 'No disponible', 'Entrante'],
    message: '{VALUE} no es un status válido'
}


const ItemExpedienteSchema = Schema({

    titulo: { type: String },
    archivo: { type: String },
    status: { 
        type: String ,
        enum: statusValidos,
        default: 'No disponible'
    },
    ends_in: { type: Date, default: Date.now() + 20 }

}, { collection: 'items', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });



ItemExpedienteSchema.method('toJSON', function() {
    const { __v, updated_at, ...object } = this.toObject();
    return object;
})

module.exports = model('Item', ItemExpedienteSchema)