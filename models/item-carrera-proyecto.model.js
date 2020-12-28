const { Schema, model, Types } = require('mongoose');


const ItemCarreraProyectoSchema = Schema({

    proyecto: { type: Types.ObjectId, ref: 'Prpyecto' },
    carrera: { type: Types.ObjectId, ref: 'Carrera' },
    cantidad: { type: Number },
    
}, { collection: 'items-carrera-proyecto' });


ItemCarreraProyectoSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
})

module.exports = model('CarreraProyecto', ItemCarreraProyectoSchema)