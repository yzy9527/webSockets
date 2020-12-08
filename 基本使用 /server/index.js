const WebSocket = require('ws')

const wss = new WebSocket.Server({port: 9527})

wss.on('connection', function connection(ws) {
    console.log('连接')
    //接受客户端的消息
    ws.on('message',function (msg) {
        console.log(msg)
    })
    //发送消息给客户端
    ws.send('message from server')
})
