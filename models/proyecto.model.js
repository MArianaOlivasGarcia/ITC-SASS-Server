const { Schema, model, Types } = require('mongoose');

const ProyectoSchema = Schema({

    
    nombre: { type: String, required: true },
    dependencia: { type: Types.ObjectId, ref: 'Dependencia', required: true },
    objetivo: { type: String },
    actividades: { type: String },
    tipo_actividades: { type: String },
    periodo: { type: Types.ObjectId, ref: 'Periodo' },
    lugar_desempeno: { type: String }, 
    modalidad: { type: String },
    tipo: { type: String },
    horario: { type: String },
    apoyo_economico: { type: Boolean, default: false },
    instalacion: { type: Boolean, default: false },

    responsable: { type: String  },
    puesto_responsable: { type: String },
    email_responsable: { type: String },
    telefono_responsable: { type: String },
    
    // TODO: Cambiar la busqueda de proyectos 
    carreras: [{
        cantidad: {type: Number},
        carrera: {type: Types.ObjectId, ref: 'Carrera'}
    }],

    publico: { type: Boolean, default: true  },
    alumno: { type: Types.ObjectId, ref: 'Alumno'},

    // 
    adoptado: { type: Boolean },

}, { collection: 'proyectos'});

ProyectoSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
})


ProyectoSchema.pre('save', function(next){

    if ( this.alumno ) {
        this.publico = false;
    }

    next();
});


module.exports = model('Proyecto', ProyectoSchema)