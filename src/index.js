const path = require('path');
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const port = 3000;
const app = express();

app.use(cors());
app.use('/', express.static(path.join(__dirname, '../public')))

const router = express.Router();
app.use('/api', router);

const chats = [];

router.get('/greeting', (req, res) => {
  res.status(200)
    .send('Hello, World!');
});

router.post('/chats', (req, res) => {
  const chatId = uuidv4();
  chats.push(chatId);
  console.log("chat created " + chatId)
  res.status(201)
    .json(chatId);
});

router.get('/chats', (req, res) => {
  res.status(200)
    .json(chats);
});

app.listen(port, () => console.log(`Listening on port ${port}!`));