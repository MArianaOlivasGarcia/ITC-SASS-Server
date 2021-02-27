const { Schema, model } = require('mongoose');
const moment = require('moment-timezone');
moment.tz('America/Cancun');

const AvisoSchema = Schema({

    titulo: { type: String, required: true },
    descripcion: { type: String, required: true },
    foto: { type: String },
    enlace: { type: String },
    disponible: { type: Boolean, default: true },
    fecha_publicacion: { type: String, default: moment().format("YYYY-MM-DD") }

}, { collection: 'avisos'});


AvisoSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
})


module.exports = model('Aviso', AvisoSchema)