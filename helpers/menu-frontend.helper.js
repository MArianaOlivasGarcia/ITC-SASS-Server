

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
          titulo: 'DOCUMENTOS',
          submenu: [
            { titulo: 'Solicitud de Servicio Social', icono: 'fas fa-file-alt mr-2', url: 'documentos/SSS' },
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
    getMenuAlumnoFrontEnd
}
