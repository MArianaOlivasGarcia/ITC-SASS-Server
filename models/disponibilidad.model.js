const { Schema, model, Types } = require('mongoose');

const RecepcionSolicitud = Schema({

    periodo: { type: Types.ObjectId, ref:'Periodo', unique: true },
    fecha_inicio: { type: Date },
    fecha_termino: { type: Date },

}, { collection: 'recepcionSolicitudes'});

RecepcionSolicitud.method('toJSON', function() {
    const { __v, fecha_inicio, fecha_termino, ...object } = this.toObject();
    const fiDate = new Date(fecha_inicio);
    const ftDate = new Date(fecha_termino);
    object.fecha_inicio =  fiDate.toISOString().substring(0,10);
    object.fecha_termino = ftDate.toISOString().substring(0,10);
    return object;
})

module.exports = model('RecepcionSolicitud', RecepcionSolicitud)