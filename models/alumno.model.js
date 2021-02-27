const { Schema, model, Types } = require('mongoose');
const Periodo = require('./periodo.model');
const moment = require('moment-timezone');

const AlumnoSchema = Schema({
    /* =============
    == REQUERIDOS 
    ================*/
    nombre: { type: String, required: true },
    apellido_paterno: { type: String }, 
    apellido_materno: { type: String }, 
    sexo: { type: String, required: true },
    fecha_nacimiento: { type: String, required: true },
    numero_control: { type: String, required: true, unique: true },
    carrera: { type: Types.ObjectId, ref: 'Carrera', required: true },
    creditos_acumulados: { type: Number, required: true },
    periodo_ingreso: { type: Types.ObjectId, ref: 'Periodo' },
    
    periodo_registro: { type: Types.ObjectId, ref: 'Periodo' },
    periodo_servicio: { type: Types.ObjectId, ref: 'Periodo' },
    /* =============
    == FIN REQUERIDOS 
    ================*/
    
    email: { type: String },
    telefono: { type: String },
/*  domicilio: { type: String }, */
    domicilio: {
        calle_numero: { type: String },
        colonia: { type: String },
        ciudad_estado: { type: String },
    },
    numero_seguro: { type: String },
    edad: { type: Number },
    porcentaje_avance: { type: Number },
    
    semestre: { type: Number },
    firma: { type: String }, 
    foto: { type: String },
    password: { type: String, required: true },
    /* // Opcional
    solicitud: { type: Types.ObjectId, ref: 'Solicitud' }, */
    proyecto: { type: Types.ObjectId, ref: 'Proyecto' },
    expediente: { type: Types.ObjectId, ref: 'Expediente' },
 
    video: { type: Boolean, default: false },
    examen: { type: Boolean, default: false },
    terminos: { type: Boolean, default: false },
    online: { type: Boolean, default: false }

}, { collection: 'alumnos' });


AlumnoSchema.method('toJSON', function() {
    const { __v, password,/*  fecha_nacimiento, */ ...object } = this.toObject(); 
    /* const bDate = new Date(fecha_nacimiento);
    object.fecha_nacimiento =  bDate.toISOString().substring(0,10); */
    return object;
})

AlumnoSchema.pre('save', async function(next){

    // Calcular Edad
    let hoy = new Date( moment().format("YYYY-MM-DD") );
    let cumple = new Date(this.fecha_nacimiento);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    let m = hoy.getMonth() - cumple.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
        edad--;
    }
    
    this.edad = edad;
    // FIN Calcular Edad



    // Calcular % Avance
    let porcentaje = ( this.creditos_acumulados * 100 ) / 260;
    let t = porcentaje.toString();
    this.porcentaje_avance = t.match(/(\d*.\d{0,2})/)[0];
    // FIN Calcular % Avance

    const periodoActual = await Periodo.findOne({isActual:true});
    this.periodo_registro = periodoActual;
    
    next();
});
 

module.exports = model('Alumno', AlumnoSchema)