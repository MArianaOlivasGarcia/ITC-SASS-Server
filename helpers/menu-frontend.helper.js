

const getMenuFrontEnd = ( role = 'USER_ROLE' ) => {

    const menu =  [
        {
          titulo: 'DASHBOARD',
          submenu: [
            { titulo: 'Mi perfil', icono: 'fas fa-user-alt mr-2', url: 'perfil' },
            { titulo: 'Avisos', icono: 'fas fa-newspaper mr-2', url: 'avisos' },
            { titulo: 'Mensajes', icono: 'fas fa-comments mr-2', url: 'mensajes' },
          ]
        },
        /* {
          titulo: 'MANTENIMIENTO',
          submenu: [
            { titulo: 'Dependencias', icono: 'fas fa-building mr-2', url: 'dependencias' },
            { titulo: 'Banco de Proyectos', icono: 'fas fa-briefcase mr-2', url: 'proyectos' },
            { titulo: 'Alumnos', icono: 'fas fa-user-graduate mr-2', url: 'alumnos' },
            { titulo: 'Usuarios', icono: 'fas fa-users mr-2', url: 'usuarios' },
          ]
        }, */
        {
          titulo: 'SOLICITUDES',
          submenu: [
            { titulo: 'Proyectos', icono: 'fas fa-briefcase mr-2', url: 'solicitudes' }
          ]
        },
        {
          titulo: 'DOCUMENTOS',
          submenu: [
            { titulo: 'Solicitud de Servicio Social', icono: 'fas fa-file-alt mr-2', url: 'documentos/ITC-VI-PO-002-02' },
            { titulo: 'Carta de Asignación de Servicio Social', icono: 'fas fa-file-alt mr-2', url: 'documentos/ITC-VI-PO-002-03' }
          ]
        }
      ];

      if ( role == 'ADMIN_ROLE' ) {
          menu.splice(1, 0, {
            titulo: 'MANTENIMIENTO',
            submenu: [
              { titulo: 'Dependencias', icono: 'fas fa-building mr-2', url: 'dependencias' },
              { titulo: 'Banco de Proyectos', icono: 'fas fa-briefcase mr-2', url: 'proyectos' },
              { titulo: 'Alumnos', icono: 'fas fa-user-graduate mr-2', url: 'alumnos' },
              { titulo: 'Usuarios', icono: 'fas fa-users mr-2', url: 'usuarios' },
            ]
          })
      }

      return menu;
      

}

const getSubMenuFrontEnd = ( role = 'USER_ROLE' ) => {

  const submenu = [
    { titulo: 'Mi perfil', icono: 'fas fa-comments mr-2', url: 'mensajes' },
/*  { titulo: 'Ajustes', icono: 'fas fa-cogs mr-2', url: 'ajustes' }, */
    
  ];

  if ( role == 'ADMIN_ROLE' ) {
    submenu.splice(1, 0, 
      { titulo: 'Ajustes', icono: 'fas fa-cogs mr-2', url: 'ajustes' }
    )
  }

  return submenu;

}



const getMenuAlumnoFrontEnd = () => {

  return [
    {
      titulo: 'DASHBOARD',
      submenu: [
        { titulo: 'Mi perfil', icono: 'fas fa-user-graduate mr-2', url: 'perfil' },
        { titulo: 'Banco de Proyectos', icono: 'fas fa-briefcase mr-2', url: 'proyectos' },
        { titulo: 'Mi expediente', icono: 'fas fa-book mr-2', url: 'expediente' },
        { titulo: 'Avisos', icono: 'fas fa-newspaper mr-2', url: 'avisos' },
        { titulo: 'Mensajes', icono: 'fas fa-comments mr-2', url: 'mensajes' },
      ]
    }
  ];

}


module.exports = {
    getMenuFrontEnd,
    getSubMenuFrontEnd,
    getMenuAlumnoFrontEnd
}
