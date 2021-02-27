const { Schema, model, Types } = require('mongoose');
const Expediente = require('./expediente.model');
const Solicitud = require('./solicitud.model');
const moment = require('moment-timezone')
/* moment.locale('es-mx');
moment.tz('America/Cancun'); */

const ItemExpedienteSchema = Schema({
    
    alumno: { type: Types.ObjectId, ref:'Alumno', required: true},

    // AutoIncrementable
    numero: { type: Number },

    expediente: { type: Types.ObjectId, ref:'Expediente', required: true},
    periodo: { type: Types.ObjectId, ref:'Periodo'},
    titulo: { type: String },
    codigo: { type: String },
    archivoTemp: { type: String },
    archivo: { type: String },
    
    fecha_inicial: { type: String, default: moment().format("YYYY-MM-DD") },
    fecha_limite: { type: String, default: moment().format("YYYY-MM-DD") },
    fecha_entrega: { type: String },
    fecha_validacion: { type: String },

    usuario_valido: { type: Types.ObjectId, ref: 'Usuario'}, 

    error: { 
        observacion: { type: String },
        motivo: { type: String },
    },

    // Estados
    // El documento ya esta aprobado
    aceptado: { type: Boolean, default: false},
    // El documento es rechazado
    rechazado: { type: Boolean, default: false},
    // El documento fue enviado a revisión
    pendiente: { type: Boolean, default: false},
    
    
    // Requiere reenvio
    reenvio_required: { type: Boolean, default: false },
    // el item es de vinculacion a alumno
    isEntrante: { type: Boolean, default: false},
    // Documento que no se genera
    entrega: { type: Boolean, default: false },


    // El item esta disponible
    disponible: { type: Boolean, default: false},
    // El item no esta iniciado
    iniciado: { type: Boolean, default: false},
    // Item no finalizado
    proceso: { type: Boolean, default: false },
    // El item ya finalizo, esta terminado
    finalizado: { type: Boolean, default: false },

    isBimestral: { type: Boolean },
    isEvaluacion: { type: Boolean },
    numero_bimestre: { type: Number },


}, { collection: 'items'});



ItemExpedienteSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
})  


ItemExpedienteSchema.pre('save', async function(next) {

  
    const solicitud = await Solicitud.findOne({alumno:this.alumno});
    const { inicio_servicio, termino_servicio } = solicitud;


    const fis = new Date(inicio_servicio);
    const fts = new Date(termino_servicio);
    
    if ( this.isBimestral && this.numero_bimestre == 1) {
        
        this.fecha_inicial = new Date(fis.setMonth( fis.getMonth() + 2 )).toISOString().slice(0,10);
        this.fecha_limite = new Date(fis.setMonth( fis.getMonth() + 4 )).toISOString().slice(0,10);

    } else if ( this.isBimestral && this.numero_bimestre == 2) {
        
        this.fecha_inicial = new Date(fis.setMonth( fis.getMonth() + 4 )).toISOString().slice(0,10);
        this.fecha_limite = this.fecha_inicial;

    } else if ( this.isBimestral && this.numero_bimestre == 3) {
        
        this.fecha_inicial = fts.toISOString().slice(0,10);
        this.fecha_limite = this.fecha_inicial;

    } 

    

    /*const periodoProximo = await Periodo.findOne({isProximo:true})
      this.periodo = periodoProximo*/

    const expediente = await Expediente.findById(this.expediente);
    this.periodo = expediente.periodo;

    next();
    
})


module.exports = model('Item', ItemExpedienteSchema)