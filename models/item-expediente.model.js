const { Schema, model, Types } = require('mongoose');
const Expediente = require('./expediente.model');
const Periodo = require('./periodo.model');

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
    
    fecha_inicial: { type: Date, default: Date.now() },
    fecha_limite: { type: Date, default: Date.now() },
    fecha_entrega: { type: Date },
    fecha_validacion: { type: Date },

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
    entrante: { type: Boolean, default: false},
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


}, { collection: 'items'});



ItemExpedienteSchema.method('toJSON', function() {
    const { __v, updated_at, fecha_inicial, fecha_limite, fecha_entrega, fecha_validacion, ...object } = this.toObject();

    const fiDate = new Date(fecha_inicial);
    const flDate = new Date(fecha_limite);
 
   if( fecha_entrega ){
       const feDate = new Date(fecha_entrega);
       object.fecha_entrega    = feDate.toISOString().substring(0,10);
    }

    if ( fecha_validacion ) {
        const fvDate = new Date(fecha_validacion);
        object.fecha_validacion = fvDate.toISOString().substring(0,10);
    }

    object.fecha_inicial    = fiDate.toISOString().substring(0,10);
    object.fecha_limite     = flDate.toISOString().substring(0,10);
    

    return object;
})  


ItemExpedienteSchema.pre('save', async function(next) {

    
    /* const periodoProximo = await Periodo.findOne({isProximo:true});
    this.periodo = periodoProximo;
 */

    const expediente = await Expediente.findById(this.expediente);
    this.periodo = expediente.periodo;

    next();
    
})


module.exports = model('Item', ItemExpedienteSchema)