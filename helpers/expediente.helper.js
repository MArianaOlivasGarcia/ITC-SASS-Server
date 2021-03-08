
const getEstructuraExpediente = ( expediente, alumno, numeroControl ) => {

    
    return [
        {   alumno: alumno,
            numero: 1,
            expediente: expediente,
            titulo: 'Carta de Presentación de Servicio Social',
            codigo: 'ITC-VI-PO-002-06',
            archivo: `${numeroControl}-ITC-VI-PO-002-06.pdf`,
            isEntrante: true,
            disponible: true,
            iniciado: true,
            finalizado: true,
/*             aceptado: true,
 */        },{
            alumno: alumno,
            numero: 2,
            expediente: expediente,
            titulo: 'Carta de Aceptación de Servicio Social',
            codigo: 'CARTA-ACEPTACION',
            entrega: true,
            disponible: true
        },{   
            alumno: alumno,
            numero: 3,
            expediente: expediente,
            titulo: 'Carta de Asignación de Servicio Social',
            codigo: 'ITC-VI-PO-002-03',
            isEntrante: true,
        },{
            alumno: alumno,
            numero: 4,
            expediente: expediente,
            titulo: 'Carta Compromiso de Servicio Social',
            codigo: 'ITC-VI-PO-002-05',
            reenvio_required: true
        },{
            alumno: alumno,
            numero: 5,
            expediente: expediente,
            titulo: 'Plan de trabajo del (la) prestante',
            codigo: 'ITC-VI-PO-002-07',
            reenvio_required: true
        },{
            alumno: alumno,
            numero: 6,
            expediente: expediente,
            titulo: '1° Reporte Bimestral de Servicio Social',
            isBimestral: true,
            numero_bimestre: 1,
            codigo: 'ITC-VI-PO-002-08',
            reenvio_required: true
        },{
            alumno: alumno,
            numero: 7,
            expediente: expediente,
            titulo: '1° Auto-Evaluación Cualitativa y de Desarrollo del (la) Prestador',
            codigo: 'ITC-VI-PO-002-09',
            isBimestral: true,
            isAutoEvaluacion: true,
            numero_bimestre: 1,
            reenvio_required: true
        },{
            alumno: alumno,
            numero: 8,
            expediente: expediente,
            titulo: '1° Evaluación Cualitativa  de Desempeño del (la) Prestador (a) emitido por la Instancia',
            codigo: 'ITC-VI-PO-002-10',
            isBimestral: true,
            isEvaluacion: true,
            numero_bimestre: 1,
            reenvio_required: true
        },{
            alumno: alumno,
            numero: 9,
            expediente: expediente,
            titulo: '2° Reporte Bimestral de Servicio Social',
            codigo: 'ITC-VI-PO-002-08',
            isBimestral: true,
            numero_bimestre: 2,
            reenvio_required: true
        },{
            alumno: alumno,
            numero: 10,
            expediente: expediente,
            titulo: '2° Auto-Evaluación Cualitativa y de Desarrollo del (la) Prestador',
            codigo: 'ITC-VI-PO-002-09',
            isBimestral: true,
            isAutoEvaluacion: true,
            numero_bimestre: 2,
            reenvio_required: true
        },{
            alumno: alumno,
            numero: 11,
            expediente: expediente,
            titulo: '2° Evaluación Cualitativa  de Desempeño del (la) Prestador (a) emitido por la Instancia',
            codigo: 'ITC-VI-PO-002-10',
            isBimestral: true,
            isEvaluacion: true,
            numero_bimestre: 2,
            reenvio_required: true
        },{
            alumno: alumno,
            numero: 12,
            expediente: expediente,
            titulo: '3° Reporte Bimestral de Servicio Social',
            codigo: 'ITC-VI-PO-002-08',
            isBimestral: true,
            numero_bimestre: 3,
            reenvio_required: true
        },{
            alumno: alumno,
            numero: 13,
            expediente: expediente,
            titulo: '3° Auto-Evaluación Cualitativa y de Desarrollo del (la) Prestador',
            codigo: 'ITC-VI-PO-002-09',
            isBimestral: true,
            isAutoEvaluacion: true,
            numero_bimestre: 3,
            reenvio_required: true
        },{
            alumno: alumno,
            numero: 14,
            expediente: expediente,
            titulo: '3° Evaluación Cualitativa de Desempeño del (la) Prestador (a) emitido por la Instancia',
            codigo: 'ITC-VI-PO-002-10',
            isBimestral: true,
            isEvaluacion: true,
            numero_bimestre: 3,
            reenvio_required: true
        },{
            alumno: alumno,
            numero: 15,
            expediente: expediente,
            titulo: 'Evaluación desempeño final por el (la) prestador',
            codigo: 'ITC-VI-PO-002-11',
            reenvio_required: true,
            isEvaluacionFinal: true
        },{
            alumno: alumno,
            numero: 16,
            expediente: expediente,
            titulo: 'Carta de Terminación de Servicio Social',
            codigo: 'CARTA-TERMINACION',
            entrega: true,
        },{
            alumno: alumno,
            numero: 17,
            expediente: expediente,
            titulo: 'Constancia de Terminación y Liberación del Servicio Social',
            codigo: 'ITC-TERMINACION',
            isEntrante: true
        }
    ];

}


const getEstructuraExpedienteBasica = () => {

    return [
        {   
            titulo: 'Carta de Aceptación de Servicio Social',
            codigo: 'CARTA-ACEPTACION',
        },{
            titulo: 'Carta Compromiso de Servicio Social',
            codigo: 'ITC-VI-PO-002-05',
        },{
            titulo: 'Plan de trabajo del (la) prestante',
            codigo: 'ITC-VI-PO-002-07',
        },{
            titulo: 'Reporte Bimestral de Servicio Social',
            codigo: 'ITC-VI-PO-002-08',
        },{
            titulo: 'Auto-Evaluación Cualitativa y de Desarrollo del (la) Prestador',
            codigo: 'ITC-VI-PO-002-09',
        },{
            titulo: 'Evaluación Cualitativa  de Desempeño del (la) Prestador (a) emitido por la Instancia',
            codigo: 'ITC-VI-PO-002-10',
        },/* {
            titulo: '2° Reporte Bimestral de Servicio Social',
            codigo: 'ITC-VI-PO-002-08',
        },{
            titulo: '2° Auto-Evaluación Cualitativa y de Desarrollo del (la) Prestador',
            codigo: 'ITC-VI-PO-002-09',
        },{
            titulo: '2° Evaluación Cualitativa  de Desempeño del (la) Prestador (a) emitido por la Instancia',
            codigo: 'ITC-VI-PO-002-10',
        },{
            titulo: '3° Reporte Bimestral de Servicio Social',
            codigo: 'ITC-VI-PO-002-08',
        },{
            titulo: '3° Auto-Evaluación Cualitativa y de Desarrollo del (la) Prestador',
            codigo: 'ITC-VI-PO-002-09',
        },{
            titulo: '3° Evaluación Cualitativa de Desempeño del (la) Prestador (a) emitido por la Instancia',
            codigo: 'ITC-VI-PO-002-10',
        }, */{
            titulo: 'Evaluación desempeño final por el (la) prestador',
            codigo: 'ITC-VI-PO-002-11',
        },{   
            titulo: 'Carta de Terminación de Servicio Social',
            codigo: 'CARTA-TERMINACION',
        },
    ];
}


module.exports = {
  getEstructuraExpediente,
  getEstructuraExpedienteBasica
}
  