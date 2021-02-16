const { Schema, model } = require('mongoose');

const AvisoSchema = Schema({

    titulo: { type: String, required: true },
    descripcion: { type: String, required: true },
    foto: { type: String },
    enlace: { type: String },
    disponible: { type: Boolean, default: true },
    fecha_publicacion: { type: Date, default: Date.now() }

}, { collection: 'avisos'});


AvisoSchema.method('toJSON', function() {
    const { __v, fecha_publicacion, ...object } = this.toObject();

    const cDate = new Date(fecha_publicacion);
    object.fecha_publicacion =  cDate.toISOString().substring(0,10);

    return object;
})


module.exports = model('Aviso', AvisoSchema)