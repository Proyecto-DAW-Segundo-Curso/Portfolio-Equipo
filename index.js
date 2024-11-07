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
  res.render('home')
});

app.get('/clientes', (req, res) => {
  // Renderiza la vista home
  res.render('clientes')
});



// Levanto el servidor en puerto 3005
app.listen(3005)
