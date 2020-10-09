const path = require('path');
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');

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

const webSocketServer = new WebSocket.Server({ port: 8080 });
 
webSocketServer.on('connection', function connection(webSocket) {
  console.log(`new client connected! ${webSocketServer.clients.length} total.`);

  webSocket.on('message', message => {
    console.log('received: %s', message);
    webSocketServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));