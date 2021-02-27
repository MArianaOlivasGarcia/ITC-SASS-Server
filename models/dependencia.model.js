const { Schema, model } = require('mongoose');

const DependenciaSchema = Schema({

    nombre: { type: String, required: true },
    representante_legal: { type: String, required: true },
    domicilio: { type: String, required: true },
    email: { type: String, required: true, unique: true },

}, { collection: 'dependencias' });

DependenciaSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
})

module.exports = model('Dependencia', DependenciaSchema)