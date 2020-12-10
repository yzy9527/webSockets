const WebSocket = require('ws')

const wss = new WebSocket.Server({port: 9527})

//多聊天室
//使用roomid ，对相同的roomid进行广播
let group = {}

wss.on('connection', function connection(ws) {
    console.log('连接')
    //接受客户端的消息
    ws.on('message', function (msg) {
        const msgObj = JSON.parse(msg)
        if (msgObj.event === 'enter') {
            ws.name = msgObj.message
            ws.roomid = msgObj.roomid
            if (typeof group[ws.roomid] === 'undefined') {
                group[ws.roomid] = 1
            } else {
                group[ws.roomid]++
            }
        }
        // console.log(msg)
        // 广播消息
        wss.clients.forEach(client => {
            //如果不是自己的客户端 加上ws !== client
            // 为了获取实时在线人数
            // 相同的roomid进行广播
            if (client.readyState === WebSocket.OPEN && client.roomid === ws.roomid) {
                msgObj.name = ws.name
                // 获取在线人数
                msgObj.num = group[ws.roomid]
                //发送消息给客户端
                client.send(JSON.stringify(msgObj))
            }
        })
    })

    ws.on('close', function () {
        if (ws.name) {
            group[ws.roomid]--
        }
        let msgObj = {}
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN && client.roomid === ws.roomid) {
                msgObj.name = ws.name
                msgObj.num = group[ws.roomid]
                msgObj.event = 'out'
                client.send(JSON.stringify(msgObj))
            }
        })
    })
})
