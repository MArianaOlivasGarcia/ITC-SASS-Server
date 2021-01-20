
const getEstructuraExpediente = ( idExpediete, idAlumno ) => {

    return [
        {
            alumno: idAlumno,
            numero: 1,
            expediente: idExpediete,
            titulo: 'Solicitud de Servicio Social',
            codigo: 'ITC-VI-PO-002-02',
            disponible: true,
        },{
            alumno: idAlumno,
            numero: 2,
            expediente: idExpediete,
            titulo: 'Carta de Asignación de Servicio Social',
            codigo: 'ITC-VI-PO-002-03',
        },{
            alumno: idAlumno,
            numero: 3,
            expediente: idExpediete,
            titulo: 'Carta Compromiso de Servicio Social',
            codigo: 'ITC-VI-PO-002-05',
        },{
            alumno: idAlumno,
            numero: 4,
            expediente: idExpediete,
            titulo: 'Plan de trabajo del (la) prestante',
            codigo: 'ITC-VI-PO-002-07',
        },{
            alumno: idAlumno,
            numero: 5,
            expediente: idExpediete,
            titulo: 'Presentación de Servicio Social',
            codigo: 'ITC-VI-PO-002-06',
            entrante: true
        },{
            alumno: idAlumno,
            numero: 7,
            expediente: idExpediete,
            titulo: 'Aceptación de Servicio Social',
            codigo: 'CARTA-ACEPTACION',
            entrega: true,
        },{
            alumno: idAlumno,
            numero: 8,
            expediente: idExpediete,
            titulo: '1° Reporte Bimestral de Servicio Social',
            codigo: 'ITC-VI-PO-002-08',
            reenvio_required: true
        },{
            alumno: idAlumno,
            numero: 9,
            expediente: idExpediete,
            titulo: '1° Auto-Evaluación Cualitativa y de Desarrollo del (la) Prestador',
            codigo: 'ITC-VI-PO-002-09',
            reenvio_required: true
        },{
            alumno: idAlumno,
            numero: 10,
            expediente: idExpediete,
            titulo: '1° Evaluación Cualitativa  de Desempeño del (la) Prestador (a) emitido por la Instancia',
            codigo: 'ITC-VI-PO-002-10',
            reenvio_required: true
        },{
            alumno: idAlumno,
            numero: 11,
            expediente: idExpediete,
            titulo: '2° Reporte Bimestral de Servicio Social',
            codigo: 'ITC-VI-PO-002-08',
            reenvio_required: true
        },{
            alumno: idAlumno,
            numero: 12,
            expediente: idExpediete,
            titulo: '2° Auto-Evaluación Cualitativa y de Desarrollo del (la) Prestador',
            codigo: 'ITC-VI-PO-002-09',
            reenvio_required: true
        },{
            alumno: idAlumno,
            numero: 13,
            expediente: idExpediete,
            titulo: '2° Evaluación Cualitativa  de Desempeño del (la) Prestador (a) emitido por la Instancia',
            codigo: 'ITC-VI-PO-002-10',
            reenvio_required: true
        },{
            alumno: idAlumno,
            numero: 14,
            expediente: idExpediete,
            titulo: '3° Reporte Bimestral de Servicio Social',
            codigo: 'ITC-VI-PO-002-08',
            reenvio_required: true
        },{
            alumno: idAlumno,
            numero: 15,
            expediente: idExpediete,
            titulo: '3° Auto-Evaluación Cualitativa y de Desarrollo del (la) Prestador',
            codigo: 'ITC-VI-PO-002-09',
            reenvio_required: true
        },{
            alumno: idAlumno,
            numero: 16,
            expediente: idExpediete,
            titulo: '3° Evaluación Cualitativa de Desempeño del (la) Prestador (a) emitido por la Instancia',
            codigo: 'ITC-VI-PO-002-10',
            reenvio_required: true
        },{
            alumno: idAlumno,
            numero: 17,
            expediente: idExpediete,
            titulo: 'Constancia de Terminación y Liberación del Servicio Social',
            codigo: 'ITC-VI-PO-002-15',
            entrante: true
        }
    ];
  
}


module.exports = {
  getEstructuraExpediente
}
  