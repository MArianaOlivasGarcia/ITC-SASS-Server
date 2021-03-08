const { Schema, model, Types } = require('mongoose');

const EvaluacionSchema = Schema({

    item: { type: Types.ObjectId, ref: 'Item' },
    alumno: { type: Types.ObjectId, ref: 'Alumno' },
    periodo: { type: Types.ObjectId, ref: 'Periodo' },

    calificaciones: { type: [Number] },
    sumatoria: { type: Number },
    promedio: { type: Number },
    nivel_desempeno: { type: String },
    

    // True Es autoevaluacion, False es evaluacion
    /* isEvaluacion: { type: Boolean },
    isAutoEvaluacion: { type: Boolean }, */


}, { collection: 'evaluaciones'} );

EvaluacionSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
})


EvaluacionSchema.pre('save', function(next){

    let suma = 0;
    this.calificaciones.forEach (function(calf){
        suma += calf;
    });

    this.sumatoria = suma;
    this.promedio = (suma/this.calificaciones.length);

    if ( this.promedio <= 0.99 ) {
        this.nivel_desempeno = 'Insuficiente'
    } else if ( this.promedio >= 1 && this.promedio <= 1.49 ) {
        this.nivel_desempeno = 'Suficiente'
    } else if ( this.promedio >= 1.50 && this.promedio <= 2.49 ) {
        this.nivel_desempeno = 'Bueno'
    } else if ( this.promedio >= 2.50 && this.promedio <= 3.49 ) {
        this.nivel_desempeno = 'Notable'
    } else if ( this.promedio >= 3.50 && this.promedio <= 4 ) {
        this.nivel_desempeno = 'Excelente'
    }

    next();
});

module.exports = model('Evaluacion', EvaluacionSchema)