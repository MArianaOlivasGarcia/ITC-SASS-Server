const mongoose = require('mongoose');
/* const autoIncrement = require('mongoose-auto-increment');
 */
const dbConnection = async() => {

    try {

        console.log('init db config');

        
        /* const connection =  */await mongoose.connect(process.env.DB_CNN, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });


/*         autoIncrement.initialize(connection)
 */
        console.log('Base de datos Online');

    } catch (error) {

        console.log(error);

        throw new Error('Error en la base de datos - Hable con el admin');

    }

}

module.exports = {
    dbConnection
}