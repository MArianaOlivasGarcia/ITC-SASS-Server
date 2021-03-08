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
    archivoOriginal: { type: String },
    archivo: { type: String },
    
    fecha_inicial: { type: String, /* default: moment().format("YYYY-MM-DD")  */},
    fecha_limite: { type: String, /* default: moment().format("YYYY-MM-DD")  */},
    fecha_entrega: { type: String },
    fecha_validacion: { type: String },

    usuario_valido: { type: Types.ObjectId, ref: 'Usuario'}, 

    error: { 
        observacion: { type: String },
        motivo: { type: String },
    },

    // STATUS DE VALIDACION
    // El documento ya esta aprobado
    aceptado: { type: Boolean, default: false},
    // El documento es rechazado
    rechazado: { type: Boolean, default: false},
    // El documento fue enviado a revisión
    pendiente: { type: Boolean, default: false},
    

    //------ STATUS DE TAREA
    // El item esta disponible
    disponible: { type: Boolean, default: false},
    // El item no esta iniciado
    iniciado: { type: Boolean, default: false},
    // Item no finalizado
    proceso: { type: Boolean, default: false },
    // El item ya finalizo, esta terminado
    finalizado: { type: Boolean, default: false },

    //--- CARACTERISTICAS
    // Requiere reenvio
    reenvio_required: { type: Boolean, default: false },
    // el item es de vinculacion a alumno
    isEntrante: { type: Boolean, default: false},

    // Documento que no se genera, como carta de aceptacion, documentos externos
    entrega: { type: Boolean, default: false },

    
    // Se entrega bimestralmente
    isBimestral: { type: Boolean }, 
    // Es una evaluación
    isEvaluacion: { type: Boolean },
    // Es una evaluación final
    isEvaluacionFinal: { type: Boolean },
    // Es auto evaluación
    isAutoEvaluacion: { type: Boolean },
    // Si es bimestral, numero de bimestre que corresponde 
    numero_bimestre: { type: Number },


}, { collection: 'items'});



ItemExpedienteSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
})  


ItemExpedienteSchema.pre('save', async function(next) {

  
    const solicitud = await Solicitud.findOne({alumno:this.alumno});
    const { inicio_servicio, termino_servicio } = solicitud;

    // Periodo del Expediente
    const expediente = await Expediente.findById(this.expediente);
    this.periodo = expediente.periodo;

    const { apertura } = expediente;
    


    // Cuando es carta aceptacion, 
    if ( this.codigo == 'CARTA-ACEPTACION' ) {
        this.fecha_inicial = moment(apertura).format("YYYY-MM-DD");
        this.fecha_limite =  moment(apertura).add(20, 'days').format("YYYY-MM-DD");
    } else if ( this.codigo == 'CARTA-TERMINACION' ) {
        this.fecha_inicial = moment(termino_servicio).format("YYYY-MM-DD");
        this.fecha_limite =  moment(termino_servicio).add(20, 'days').format("YYYY-MM-DD");
    } else if ( this.codigo == 'ITC-VI-PO-002-05' ) {
        this.fecha_inicial = moment(apertura).add(20, 'days').format("YYYY-MM-DD");
        this.fecha_limite =  moment(apertura).add(20, 'days').format("YYYY-MM-DD");
    } else if ( this.codigo == 'ITC-VI-PO-002-07' ) {
        this.fecha_inicial = moment(apertura).add(20, 'days').format("YYYY-MM-DD");
        this.fecha_limite =  moment(apertura).add(40, 'days').format("YYYY-MM-DD");
    } else if ( this.codigo == 'ITC-VI-PO-002-11' ) {
        this.fecha_inicial = moment(termino_servicio).format("YYYY-MM-DD");
        this.fecha_limite =  moment(termino_servicio).add(20, 'days').format("YYYY-MM-DD");
    } else if ( this.isBimestral ) {

        if ( this.numero_bimestre == 1 ) {

            this.fecha_inicial = moment(inicio_servicio).add(2, 'months').format("YYYY-MM-DD");
            this.fecha_limite =  moment(inicio_servicio).add(2, 'months').add(5, 'days').format("YYYY-MM-DD");

        } else if ( this.numero_bimestre == 2 ) {

            this.fecha_inicial = moment(inicio_servicio).add(4, 'months').format("YYYY-MM-DD");
            this.fecha_limite =  moment(inicio_servicio).add(4, 'months').add(5, 'days').format("YYYY-MM-DD");    
        
        } else if ( this.numero_bimestre == 3 ) {

            this.fecha_inicial = moment(inicio_servicio).add(6, 'months').format("YYYY-MM-DD");
            this.fecha_limite =  moment(inicio_servicio).add(6, 'months').add(5, 'days').format("YYYY-MM-DD");

        }


    }


    next();
    
})


module.exports = model('Item', ItemExpedienteSchema)