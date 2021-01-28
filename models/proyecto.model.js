const { Schema, model, Types } = require('mongoose');

const ProyectoSchema = Schema({

    
    nombre: { type: String, required: true },
    dependencia: { type: Types.ObjectId, ref: 'Dependencia', required: true },
    objetivo: { type: String },
    actividades: { type: String },
    periodo: { type: Types.ObjectId, ref: 'Periodo' },
    lugar_desempeno: { type: String }, 
    modalidad: { type: String, default: 'Público' },
    tipo: { type: String },
    horario: { type: String },
    apoyo_economico: { type: Boolean, default: false },
    responsable: { type: String  },
    puesto_responsable: { type: String },
    
    carreras: [{
        cantidad: {type: Number},
        carrera: {type: Types.ObjectId, ref: 'Carrera'}
    }],
    // En las que puede postularse a este proyecto
    fecha_inicial: { type: Date },
    fecha_limite: { type: Date },

    publico: { type: Boolean, default: true  },
    alumno: { type: Types.ObjectId, ref: 'Alumno'}

}, { collection: 'proyectos'});

ProyectoSchema.method('toJSON', function() {
    const { __v, fecha_inicial, fecha_limite,...object } = this.toObject();
    
    if ( !fecha_inicial && !fecha_limite ) { return object; }

    const iDate = new Date(fecha_inicial);
    const fDate = new Date(fecha_limite);

    object.fecha_inicial = iDate.toISOString().substring(0,10);
    object.fecha_limite = fDate.toISOString().substring(0,10);

    return object;
})


ProyectoSchema.pre('save', function(next){

    if ( this.alumno ) {
        this.publico = false;
    }

    next();
});


module.exports = model('Proyecto', ProyectoSchema)