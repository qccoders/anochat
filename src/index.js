const path = require('path');
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');
const url = require('url');

const port = 3000;
const app = express();

app.use(cors());
app.use('/', express.static(path.join(__dirname, '../public')))

const router = express.Router();
app.use('/api', router);

const chats = [{name:"lobby", clients:[]}];

router.post('/chats', (req, res) => {
  const chatId = uuidv4();
  chats.push({name:chatId, clients:[]});
  console.log("chat created " + chatId)
  res.status(201)
    .json(chatId);
});

router.get('/chats', (req, res) => {
  res.status(200)
    .json(chats);
});

const webSocketServer = new WebSocket.Server({ port: 8080 });
const getChatById = (id) => {
  const foundChat = chats.find(chat => {
    console.log(chat); 
    if (chat.name === id){
      return true;
    }
   return false;
  })
  return foundChat;
} 
webSocketServer.on('connection', (webSocket, request) => {
  const { chatId } = url.parse(request.url, true).query;

  if ((chatId || '').length === 0) {
    console.log('no chat specified');
    webSocket.terminate();
    return;
  }

  const foundChat = getChatById(chatId);
  foundChat.clients.push(webSocket);
  console.log(`new client connected to chat ${chatId}!`);
  webSocket.on('message', message => {
    
    console.log('[%s] received: %s', chatId, message);
    const foundChat = getChatById(chatId);
    if (foundChat === undefined) {
      console.log(`unknown chat ${chatId}`);
      webSocket.terminate();
      return;
    }
    console.log("foundChat", foundChat)
    webSocketServer.clients.forEach(client => {
      // console.log(client);
      if (client.readyState !== WebSocket.OPEN) {
        return
      }
      if (foundChat.clients.includes(client)) {
        console.log("match");
        client.send(message);
      }
      else {
        console.log("no match");
      }
    });
  });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));