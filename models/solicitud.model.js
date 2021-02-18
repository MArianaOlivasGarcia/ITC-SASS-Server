const { Schema, model, Types } = require('mongoose');
const Proyecto = require('./proyecto.model');
const Periodo = require('./periodo.model');


const SolicitudSchema = Schema({

    codigo: { type: String, default: 'ITC-VI-PO-002-02'},
    alumno: { type: Types.ObjectId, ref: 'Alumno', required: true },
    proyecto: { type: Types.ObjectId, ref: 'Proyecto', required: true },
    
    fecha_solicitud: { type: Date, default: Date.now() },
    // Usuario que valido o rechazo
    usuario_valido: { type: Types.ObjectId, ref: 'Usuario'}, 
    fecha_validacion: { type: Date },

    // Fecha Realizacion Servicio Social
    inicio_servicio: { type: Date },
    termino_servicio: { type: Date },
   
    
    // Estado de la solicitud
    pendiente: { type: Boolean, default: true },
    aceptado: { type: Boolean, default: false },
    rechazado: { type: Boolean, default: false },
    error: {
        motivo: { type: String },
        observacion: { type: String },
    },

    archivo: { type: String },
    periodo: { type: Types.ObjectId, ref: 'Periodo'}, 
    

}, {collection: 'solicitudes'});


SolicitudSchema.method('toJSON', function() {
    const { __v, fecha_solicitud, inicio_servicio, termino_servicio, ...object } = this.toObject();
    
    const fsDate = new Date(fecha_solicitud);
    object.fecha_solicitud = fsDate.toISOString().substring(0,10);

    if( inicio_servicio && termino_servicio ){
        const isDate = new Date(inicio_servicio);
        const tsDate = new Date(termino_servicio);
        object.inicio_servicio = isDate.toISOString().substring(0,10);
        object.termino_servicio = tsDate.toISOString().substring(0,10);
    }

    
    return object;
})


SolicitudSchema.pre('save', async function(next) {

    // ASIGNAR FECHAS DE INCIIO Y TERMINO DE SERVICIO IGUAL A TODOS 
/*     const proyecto = await Proyecto.findById(this.proyecto).populate('periodo');
    const fechaInicio = proyecto.periodo.fecha_inicio;
    this.inicio_servicio = new Date(fechaInicio);
    this.termino_servicio =  new Date(fechaInicio.setMonth(fechaInicio.getMonth() + 6 )); */
    // FIN ASIGNAR FECHAS DE INCIIO Y TERMINO DE SERVICIO IGUAL A TODOS 
  
    const periodoProximo = await Periodo.findOne({isProximo:true});
    this.periodo = periodoProximo;


    next();
    
})



module.exports = model('Solicitud', SolicitudSchema);