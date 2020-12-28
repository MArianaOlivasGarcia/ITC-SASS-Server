const { Schema, model } = require('mongoose');

const CarreraSchema = Schema({

    nombre: { type: String, required: true },

}, { collection: 'carreras', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

CarreraSchema.method('toJSON', function() {
    const { __v, created_at, updated_at, ...object } = this.toObject();
    return object;
})

module.exports = model('Carrera', CarreraSchema)