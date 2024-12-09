const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql2');
require('dotenv').config(); // Variables de entorno

// Configuración de Handlebars
const exphbs = require('express-handlebars');
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Conexión a la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err.stack);
    process.exit(1); // Salir si no se puede conectar
  }
  console.log('Conectado a la base de datos');
});

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

const trabajos = `
SELECT 
    Equipo.nombre_equipo AS Equipo,
    Trabajos.titulo AS Trabajo,
    Trabajos.descripcion AS Descripcion,
    Trabajos.Empresa AS Empresa,
    Trabajos.tecnologias_aplicadas AS Tecnologias
FROM 
    Equipo
INNER JOIN 
    Trabajos ON Equipo.id = Trabajos.idEquipo
WHERE 
    Equipo.id = 1; -- Cambiar el 1 por el ID del equipo deseado
`

const miembros = `
SELECT 
    Usuario.id,
    Usuario.nombre,
    Usuario.apellido,
    Usuario.titulacion,
    Usuario.contacto_usuario,
    Usuario.servicios,
    Equipo.nombre_equipo
FROM 
    Usuario
LEFT JOIN 
    Equipo ON Usuario.id_equipo = Equipo.id`

    // u.id AS id_usuario,
    // u.nombre,
    // u.apellido,
    // u.titulacion,
    // t.nombre AS tecnologia,
    // n.descripcion AS nivel_tecnologia,

//     LEFT JOIN 
//     usuario_tecnologias ut ON u.id = ut.id_usuario
// LEFT JOIN 
//     tecnologias t ON ut.id_tecnologia = t.id
// LEFT JOIN 
//     nivel n ON ut.id_nivel = n.id



const miembrosIdiomas = `
SELECT 
    i.nombre_idioma AS idioma,
    n2.descripcion AS nivel_idioma
FROM 
    usuario u
LEFT JOIN 
    usuario_idioma ui ON u.id = ui.id_usuario
LEFT JOIN 
    idiomas i ON ui.id_idioma = i.id
LEFT JOIN 
    nivel n2 ON ui.id_nivel = n2.id
WHERE 
    u.id = ?
`

const miembrosTecnologias = `
SELECT 
    t.nombre AS tecnologia,
    n.descripcion AS nivel_tecnologia
FROM 
    usuario u
LEFT JOIN 
    usuario_tecnologias ut ON u.id = ut.id_usuario
LEFT JOIN 
    tecnologias t ON ut.id_tecnologia = t.id
LEFT JOIN 
    nivel n ON ut.id_nivel = n.id
WHERE 
    u.id = ?
`

// Rutas
// Página principal: Muestra trabajos y miembros
app.get('/', (req, res) => {
  db.query('SELECT * FROM trabajos', (err, trabajos) => {
    if (err) {
      console.error('Error al obtener los trabajos:', err);
      return res.status(500).send('Error al obtener los trabajos');
    }

    db.query(miembros, (err, miembros) => {
      if (err) {
        console.error('Error al obtener los miembros:', err);
        return res.status(500).send('Error al obtener los miembros');
      }

      res.render('index', { trabajos, miembros });
    });
  });
});

// Página de detalles de un miembro
app.get('/miembro/:id', (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM usuario WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error al obtener el miembro:', err);
      return res.status(500).send('Error al obtener el miembro');
    }

    if (results.length === 0) {
      return res.status(404).send('Miembro no encontrado');
    }

    db.query('SELECT * FROM proyectos_personales WHERE id_usuario = ?', [id], (err, proyectos) => {
      if (err) {
        console.error('Error al obtener los proyectos personales:', err);
        return res.status(500).send('Error al obtener los proyectos personales');
      }

      db.query(miembrosIdiomas, [id], (err, miembrosIdiomas) => {
        if (err) {
          console.error('Error al obtener los detalles de los idiomas:', err);
          return res.status(500).send('Error al obtener los detalles de los idiomas');
        }

        db.query(miembrosTecnologias, [id], (err, miembrosTecnologias) => {
          if (err) {
            console.error('Error al obtener los detalles de las tecnologías:', err);
            return res.status(500).send('Error al obtener los detalles de las tecnologías');
          }          
        console.log(proyectos);
        res.render('miembro', { miembro: results[0], proyectos: proyectos, miembrosIdiomas: miembrosIdiomas, miembrosTecnologias: miembrosTecnologias });
        });
      });   
    });
  });
});

// Trabajos realizados
app.get('/trabajos', (req, res) => {

  db.query(trabajos, (err, trabajos) => {
    if (err) {
      console.error('Error al obtener los trabajos:', err);
      return res.status(500).send('Error al obtener los trabajos');
    }
      res.render('trabajos', { trabajos });
  });
});



// Página de contacto
app.get('/contacto', (req, res) => {
  db.query('SELECT * FROM usuario ', (err, contacto) => {
    if (err) {
      console.error('Error al obtener datos de contacto:', err);
      return res.status(500).send('Error al obtener datos de contacto');
    }

    res.render('contacto', { contacto });
  });
});

// Inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
