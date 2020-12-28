const { Schema, model, Types } = require('mongoose');

const ProyectoSchema = Schema({

    /* folio: { type: Number, required: true }, */
    nombre: { type: String, required: true },
    dependencia: { type: Types.ObjectId, ref: 'Dependencia', required: true },
    objetivo: { type: String },
    carreras: [],
    actividades: { type: String },
    periodo: { type: String },
    lugar: { type: String }, 
    modalidad: { type: String },
    tipo: { type: String },
    horario: { type: String },
    apoyo_economico: { type: Boolean, default: false },
    responsable: { type: String  },

}, { collection: 'proyectos', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

ProyectoSchema.method('toJSON', function() {
    const { __v, created_at, updated_at, ...object } = this.toObject();
    return object;
})


module.exports = model('Proyecto', ProyectoSchema)