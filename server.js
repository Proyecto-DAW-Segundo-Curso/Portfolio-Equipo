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

const miembrosDetalle = `
SELECT 
    u.id,
    u.nombre, 
    u.apellido, 
    u.titulacion,
    -- Tecnologías y su nivel
    GROUP_CONCAT(DISTINCT CONCAT(t.nombre, ' (Nivel: ', n.descripcion, ')') SEPARATOR ', ') AS tecnologias,
    -- Idiomas y su nivel
    GROUP_CONCAT(DISTINCT CONCAT(i.nombre_idioma, ' (Nivel: ', n2.descripcion, ')') SEPARATOR ', ') AS idiomas
FROM Usuario u
LEFT JOIN usuario_tecnologias ut ON u.id = ut.id_usuario
LEFT JOIN Tecnologias t ON ut.id_tecnologia = t.id
LEFT JOIN Nivel n ON ut.id_nivel = n.id
LEFT JOIN usuario_idioma ui ON u.id = ui.id_usuario
LEFT JOIN Idiomas i ON ui.id_idioma = i.id
LEFT JOIN Nivel n2 ON ui.id_nivel = n2.id
GROUP BY u.id
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

      db.query(miembrosDetalle, (err, miembrosDetalle) => {
        if (err) {
          console.error('Error al obtener los detalles de los miembros:', err);
          return res.status(500).send('Error al obtener los detalles de los miembros');
        }

        res.render('index', { trabajos, miembros, miembrosDetalle });
      });
      // res.render('index', { trabajos, miembros });
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

      res.render('miembro', { miembro: results[0], proyectos });
    
    });

    // res.render('miembro', { miembro: results[0] });
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
