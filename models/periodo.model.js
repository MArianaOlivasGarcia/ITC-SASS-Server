const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

const PeriodoSchema = Schema({

    nombre: { type: String },
    fecha_inicio: { type: Date, required: true },
    fecha_termino: { type: Date, required: true },
    isActual: { type: Boolean, default: false },
    isProximo: { type: Boolean, default: false },
    //AutoIncrementable
    recepcion_solicitudes: {
        fecha_inicio: { type: Date },
        fecha_termino: { type: Date }
    },
    codigo: { type: Number }

}, { collection: 'periodos'});

autoIncrement.initialize(mongoose.connection)
PeriodoSchema.plugin(autoIncrement.plugin, { model: 'Periodo', field: 'codigo', startAt: 1 } );


PeriodoSchema.method('toJSON', function() {
    const { __v, password, created_at, updatedAt, fecha_inicio, fecha_termino, recepcion_solicitudes, ...object } = this.toObject(); 
    
    const fiDate = new Date(fecha_inicio);
    const ftDate = new Date(fecha_termino);

    const rfiDate = new Date(recepcion_solicitudes.fecha_inicio);
    const rftDate = new Date(recepcion_solicitudes.fecha_termino);
    

    object.fecha_inicio =  fiDate.toISOString().substring(0,10);
    object.fecha_termino = ftDate.toISOString().substring(0,10);
   
    
    object.recepcion_solicitudes = {
        fecha_inicio: rfiDate.toISOString().substring(0,10),
        fecha_termino: rftDate.toISOString().substring(0,10)
    }
    

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

    this.nombre = `${MESES[this.fecha_inicio.getMonth()]}/${MESES[this.fecha_termino.getMonth()]}/${this.fecha_termino.getFullYear().toString().substr(2,2)}`

    next();
});

module.exports = model('Periodo', PeriodoSchema) 