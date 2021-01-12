const jwt = require('jsonwebtoken')

const generarJWT = (uid) => {

    return new Promise((resolve, reject) => {

        const payload = { uid };

        jwt.sign(payload, process.env.JWT_SEED, {
            expiresIn: '24h'
        }, (err, token) => {

            if (err) {
                reject('No se puso generar en JWT');
            } else {
                resolve(token)
            }

        })

    })

}



const comprobarJWT = ( bearerToken = '') => {

    try {
        
        const token = bearerToken.split(' ')[1];
        const {uid}  = jwt.verify(token, process.env.JWT_SEED)

        return [true, uid];

    } catch(error){
        return [false, null];
    }

}




module.exports = {
    generarJWT,
    comprobarJWT
}