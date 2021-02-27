const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');


const PeriodoSchema = Schema({

    nombre: { type: String },
    fecha_inicio: { type: String, required: true },
    fecha_termino: { type: String, required: true },
    isActual: { type: Boolean, default: false },
    isProximo: { type: Boolean, default: false },
    //AutoIncrementable
    recepcion_solicitudes: {
        inicio: { type: String },
        termino: { type: String }
    },
    apertura_expedientes: { type: Boolean, default: false },
    codigo: { type: Number }

}, { collection: 'periodos'});

autoIncrement.initialize(mongoose.connection)
PeriodoSchema.plugin(autoIncrement.plugin, { model: 'Periodo', field: 'codigo', startAt: 1 } );

 
PeriodoSchema.method('toJSON', function() {
    const { __v, password, ...object } = this.toObject(); 
    return object;
})
 

PeriodoSchema.pre('save', function(next){

    const MESES = [
        "ENE",
        "FEB",
        "MAR",
        "ABR",
        "MAY",
        "JUN",
        "JUL",
        "AGO",
        "SEP",
        "OCT",
        "NOV",
        "DIC",
      ];

    this.nombre = `${MESES[new Date(this.fecha_inicio).getMonth()]}/${MESES[new Date(this.fecha_termino).getMonth()]}/${new Date(this.fecha_termino).getFullYear().toString().substr(2,2)}`

    next();
});

module.exports = model('Periodo', PeriodoSchema) 