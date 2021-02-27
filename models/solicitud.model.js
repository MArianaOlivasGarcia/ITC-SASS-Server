const { Schema, model, Types } = require('mongoose');
const Periodo = require('./periodo.model');
const moment = require('moment-timezone');

const SolicitudSchema = Schema({

    codigo: { type: String, default: 'ITC-VI-PO-002-02'},
    alumno: { type: Types.ObjectId, ref: 'Alumno', required: true },
    proyecto: { type: Types.ObjectId, ref: 'Proyecto', required: true },
    
    fecha_solicitud: { type: String, default: moment().format("YYYY-MM-DD") },
    // Usuario que valido o rechazo
    usuario_valido: { type: Types.ObjectId, ref: 'Usuario'}, 
    fecha_validacion: { type: String },

    // Fecha Realizacion Servicio Social
    inicio_servicio: { type: String },
    termino_servicio: { type: String },
   
    
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
    const { __v, ...object } = this.toObject();
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