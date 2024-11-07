const express = require("express");
const express_hbs = require("express-handlebars");

// Creamos el servidor de apps express
const app = express();

// Caché
// app.enable('view cache');

// Configuracion handlebars
app.engine('handlebars', express_hbs.engine());
app.set('view engine', "handlebars");

// Configuramos ruteo
app.get('/', (req, res) => {
  // Renderiza la vista home
  res.render('home', {
    title: 'Este es mi site web',
    subtitle: 'Gracias por venir',
    arrLang: ['Js', 'C#', 'Phyton', 'Java'],
    content: 'Qué dise usteer enim dolor commodo',
  });
});

app.get('/clientes', (req, res) => {
  // Renderiza la vista home
  res.render('clientes')
});

const mysite = require('./routes/misitio');
app.use('/misitio', mysite);

// Recursos estáticos del sitio nuevo
app.use(express.static('public'));

// Levanto el servidor en puerto 3005
app.listen(3005)
