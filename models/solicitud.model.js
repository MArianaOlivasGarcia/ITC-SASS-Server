const { Schema, model, Types } = require('mongoose');

const SolicitudSchema = Schema({

    alumno: { type: Types.ObjectId, ref: 'Alumno', required: true },
    proyecto: { type: Types.ObjectId, ref: 'Proyecto', required: true },
    
    fecha_solicitud: { type: Date, default: Date.now() },
    // Usuario que valido o rechazo
    usuario_reviso: { type: Types.ObjectId, ref: 'Usuario'}, 

    // Fecha Realizacion Servicio Social
    inicio_servicio: { type: Date, required: true },
    termino_servicio: { type: Date },
   
    
    // Estado de la solicitud
    pendiente: { type: Boolean, default: true },
    aceptado: { type: Boolean, default: false },
    rechazado: { type: Boolean, default: false },
    error: {
        motivo: { type: String },
        observacion: { type: String },
    }
    

}, {collection: 'solicitudes'});


SolicitudSchema.method('toJSON', function() {
    const { __v, fecha_solicitud, inicio_servicio, termino_servicio, ...object } = this.toObject();
    
    const fsDate = new Date(fecha_solicitud);
    const isDate = new Date(inicio_servicio);
    const tsDate = new Date(termino_servicio);

    object.fecha_solicitud = fsDate.toISOString().substring(0,10);
    object.inicio_servicio = isDate.toISOString().substring(0,10);
    object.termino_servicio = tsDate.toISOString().substring(0,10);
    
    return object;
})


/* SolicitudSchema.pre('save', function(next) {

  
    let inicioServicio = new Date(this.inicio_servicio);

    let terminoServicio = inicioServicio;
    terminoServicio = terminoServicio.setMonth( terminoServicio.getMonth() + 6 );

    this.termino_servicio = new Date( terminoServicio );
    console.log(this.termino_servicio)
  
    next();
    
})

 */


module.exports = model('Solicitud', SolicitudSchema);