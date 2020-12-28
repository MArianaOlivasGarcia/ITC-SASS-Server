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




module.exports = {
    generarJWT
}