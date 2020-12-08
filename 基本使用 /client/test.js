const WebSocket = require('ws')

const ws = new WebSocket('ws://127.0.0.1:9527')

ws.on('open',function () {
    console.log('客户端已连接到服务端')
    ws.send('client say hello to server')
    ws.on('message',function (msg) {
        console.log(msg)
    })
})
