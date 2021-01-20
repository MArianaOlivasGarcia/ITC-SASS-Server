const { Schema, model, Types } = require('mongoose');

const ProgramaSchema = Schema({

    periodo: { type: Types.ObjectId, ref: 'Periodo' }, // Periodo en el que crea y desea hacer servicio social
    fecha_inicio: { type: Date, required: true },
    fecha_termino: { type: Date, required: true },
    proyecto: { type: Types.ObjectId, ref: 'Proyecto' }, // El proyecto ya aceptado del alumno
    alumno: { type: Types.ObjectId, ref: 'Alumno' }

}, { collection: 'programas', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });


ProgramaSchema.method('toJSON', function() {
    const { __v, password, created_at, updatedAt, fecha_inicio, fecha_termino, ...object } = this.toObject(); 
    const fiDate = new Date(fecha_inicio);
    const ftDate = new Date(fecha_termino);
    object.fecha_inicio =  fiDate.toISOString().substring(0,10);
    object.fecha_termino = ftDate.toISOString().substring(0,10);
    return object;
})


module.exports = model('Programa', ProgramaSchema)