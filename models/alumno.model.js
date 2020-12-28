const { Schema, model, Types } = require('mongoose');

const AlumnoSchema = Schema({
    /* =============
    == REQUERIDOS 
    ================*/
    nombre: { type: String, required: true },
    apellido_paterno: { type: String }, 
    apellido_materno: { type: String }, 
    sexo: { type: String, required: true },
    fecha_nacimiento: { type: Date, required: true },
    numero_control: { type: String, required: true, unique: true },
    carrera: { type: Types.ObjectId, ref: 'Carrera', required: true },
    semestre: { type: Number, required: true },
    creditos_acumulados: { type: Number, required: true },
    /* =============
    == FIN REQUERIDOS 
    ================*/

    email: { type: String },
    telefono: { type: String },
    domicilio: { type: String },
    numero_seguro: { type: String },
    // edad: { type: Number, required: true }, PENDIENTE CALCULAR
    // porcentaje: { type: Number, required: true }, PEDIENTE POR CALCULAR
    
    /* periodo: { type: String }, PENDIENTE PERIODO ACT/INGRESO
       firma: { type: String, required: true }, */
    
    foto: { type: String },
    password: { type: String, required: true },
    video: { type: Boolean, default: false },
    examen: { type: Boolean, default: false },
    terminos: { type: Boolean, default: false },
    online: { type: Boolean, default: false }

}, { collection: 'alumnos', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });


AlumnoSchema.method('toJSON', function() {
    const { __v, password, created_at, updated_at, fecha_nacimiento, ...object } = this.toObject();
    
    const bDate = new Date(fecha_nacimiento);
    object.fecha_nacimiento =  bDate.toISOString().substring(0,10);
    return object;
})


module.exports = model('Alumno', AlumnoSchema)