const { Schema, model, Types } = require('mongoose');

const ItemCarreraSchema = Schema({

    // Proyecto al que pertenece
    proyecto: { type: Types.ObjectId, ref: 'Proyecto', required: true}, 

    cantidad: { type: Number, required: true },
    disponibilidad: { type: Number, required: true },
    carrera: { type: Types.ObjectId, ref: 'Carrera', required: true}, 

}, {collection: 'itemsCarrera'});


ItemCarreraSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
})



module.exports = model('ItemCarrera', ItemCarreraSchema)