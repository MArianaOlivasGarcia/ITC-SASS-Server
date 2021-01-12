
const getEstructuraExpediente = ( idExpediete ) => {

    return [
        {
            numero: 1,
            expediente: idExpediete,
            titulo: 'Solicitud de Servicio Social.',
            template: 'ITC-VI-PO-002-02 SOLICITUD DE SERV. SOCIAL.DOC',
            codigo: 'ITC-VI-PO-002-02',
            disponible: true,
            iniciado: false
        },{
            numero: 2,
            expediente: idExpediete,
            titulo: 'Carta de Asignación de Servicio Social.',
            template: 'ITC-VI-PO-002-03 CARTA ASIGNACIÓN SERVICIO SOCIAL.DOC',
            codigo: 'ITC-VI-PO-002-03',
        },{
            numero: 3,
            expediente: idExpediete,
            titulo: 'Carta Compromiso de Servicio Social.',
            template: 'ITC-VI-PO-002-05 CARTA COMPROMISO SERV. SOCIAL.DOC',
            codigo: 'ITC-VI-PO-002-05',
        },{
            numero: 4,
            expediente: idExpediete,
            titulo: 'Plan de trabajo del (la) prestante.',
            template: 'ITC-VI-PO-002-07 PLAN DE TRABAJO DEL PRESTANTE.DOC',
            codigo: 'ITC-VI-PO-002-07',
        },{
            numero: 5,
            expediente: idExpediete,
            titulo: 'Presentación de Servicio Social.',
            template: 'ITC-VI-PO-002-06 OFICIO  DE PRESENTACION DE SERV. SOCIAL',
            codigo: 'ITC-VI-PO-002-06',
            entrante: true
        },{
            numero: 6,
            expediente: idExpediete,
            titulo: 'Presentación de Servicio Social FIRMADA.',
            codigo: 'ITC-VI-PO-002-06'
        },{
            numero: 7,
            expediente: idExpediete,
            titulo: 'Aceptación de Servicio Social.',
            codigo: 'CARTA-ACEPTACION'
        },{
            numero: 8,
            expediente: idExpediete,
            titulo: '1° Reporte Bimestral de Servicio Social.',
            template: 'ITC-VI-PO-002-08 REPORTE BIMESTRAL SERV. SOCIAL.DOC',
            codigo: 'ITC-VI-PO-002-08'
        },{
            numero: 9,
            expediente: idExpediete,
            titulo: '1° Auto-Evaluación Cualitativa y de Desarrollo del (la) Prestador.',
            template: 'ITC-VI-PO-002-09 AUTOEVALUACIÓN CUALITATIVA.DOC',
            codigo: 'ITC-VI-PO-002-09'
        },{
            numero: 10,
            expediente: idExpediete,
            titulo: '1° Evaluación Cualitativa  de Desempeño del (la) Prestador (a) emitido por la Instancia.',
            template: 'ITC-VI-PO-002-10 EVALUACIÓN CUALITATIVA  DESEMPEÑO DE LA INSTANCIA.DOC',
            codigo: 'ITC-VI-PO-002-10'
        },{
            numero: 11,
            expediente: idExpediete,
            titulo: '2° Reporte Bimestral de Servicio Social.',
            template: 'ITC-VI-PO-002-08 REPORTE BIMESTRAL SERV. SOCIAL.DOC',
            codigo: 'ITC-VI-PO-002-08'
        },{
            numero: 12,
            expediente: idExpediete,
            titulo: '2° Auto-Evaluación Cualitativa y de Desarrollo del (la) Prestador.',
            template: 'ITC-VI-PO-002-09 AUTOEVALUACIÓN CUALITATIVA.DOC',
            codigo: 'ITC-VI-PO-002-09'
        },{
            numero: 13,
            expediente: idExpediete,
            titulo: '2° Evaluación Cualitativa  de Desempeño del (la) Prestador (a) emitido por la Instancia.',
            template: 'ITC-VI-PO-002-10 EVALUACIÓN CUALITATIVA  DESEMPEÑO DE LA INSTANCIA.DOC',
            codigo: 'ITC-VI-PO-002-10'
        },{
            numero: 14,
            expediente: idExpediete,
            titulo: '3° Reporte Bimestral de Servicio Social.',
            template: 'ITC-VI-PO-002-08 REPORTE BIMESTRAL SERV. SOCIAL.DOC',
            codigo: 'ITC-VI-PO-002-08'
        },{
            numero: 15,
            expediente: idExpediete,
            titulo: '3° Auto-Evaluación Cualitativa y de Desarrollo del (la) Prestador.',
            template: 'ITC-VI-PO-002-09 AUTOEVALUACIÓN CUALITATIVA.DOC',
            codigo: 'ITC-VI-PO-002-09'
        },{
            numero: 16,
            expediente: idExpediete,
            titulo: '3° Evaluación Cualitativa de Desempeño del (la) Prestador (a) emitido por la Instancia.',
            template: 'ITC-VI-PO-002-10 EVALUACIÓN CUALITATIVA  DESEMPEÑO DE LA INSTANCIA.DOC',
            codigo: 'ITC-VI-PO-002-10'
        },{
            numero: 17,
            expediente: idExpediete,
            titulo: 'Constancia de Terminación y Liberación del Servicio Social.',
            template: 'ITC-VI-PO-002-15 CONSTANCIA DE TERMINACIÓN SERV. SOCIAL.DOC',
            codigo: 'ITC-VI-PO-002-15',
            entrante: true
        }
    ];
  
}


module.exports = {
  getEstructuraExpediente
}
  