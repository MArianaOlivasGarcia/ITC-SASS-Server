const { Schema, model } = require('mongoose');

const DependenciaSchema = Schema({

    nombre: { type: String, required: true },
    representante_legal: { type: String, required: true },
    domicilio: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    /*   password: { type: String, required: true }, */

}, { collection: 'dependencias', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

DependenciaSchema.method('toJSON', function() {
    const { __v, created_at, updated_at, ...object } = this.toObject();
    return object;
})

module.exports = model('Dependencia', DependenciaSchema)