
require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/chat', require('./routes/chat'));

app.get('/', (req, res) => {
  res.redirect('/chat');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`⚡ Chatbot jalan di http://localhost:${PORT}`);
});
