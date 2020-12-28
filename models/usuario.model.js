const { Schema, model, Types } = require('mongoose');

const UsuarioSchema = Schema({

    nombre: { type: String, required: true },
    foto: { type: String },
    username: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'USER_ROLE' },
    gestion: { type: Types.ObjectId, required: true, ref: 'Carrera' },
    online: { type: Boolean, default: false }

}, { collection: 'usuarios', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

UsuarioSchema.method('toJSON', function() {
    const { __v, password, created_at, updated_at, ...object } = this.toObject();
    
    return object;
})

module.exports = model('Usuario', UsuarioSchema)