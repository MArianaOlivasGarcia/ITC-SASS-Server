const { Router, response } = require('express');
const router = Router();

const libre = require('libreoffice-convert-win');

const path = require('path');
const fs = require('fs');


router.get('/test', (req, res ) => {

  const inicio_servicio = new Date("2021-02-02");
  const nueva = new Date( inicio_servicio.setDate(inicio_servicio.getDate() + 3) )
  console.log(nueva)

  res.json({
    hola: 'Hola' 
  })

})



router.post('/test', async(req, res = response) => {

    const extend = '.pdf'
    const enterPath = path.join(__dirname, '../uploads/expedientes/17530051/17530051-ITC-VI-PO-002-06.docx');
    const outputPath = path.join(__dirname, `../uploads/expedientes/17530051/17530051-ITC-VI-PO-002-06.pdf` );
    

    const file = fs.readFileSync(enterPath);
    // Convert it to pdf format with undefined filter (see Libreoffice doc about filter)
    libre.convert(file, extend, undefined, (err, done) => {
      
      if (err) {
        console.log(`Error converting file: ${err}`);
      }
    
      // Here in done you have pdf file which you can save or transfer in another stream
      fs.writeFileSync(outputPath, done);
     
     });
    

    res.json({
      status: true
    })



})


module.exports = router;