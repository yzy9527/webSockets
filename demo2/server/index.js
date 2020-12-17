const WebSocket = require('ws')
const http = require('http')
const wss = new WebSocket.Server({port: 9527})
const server = http.createServer()
const jwt = require('jsonwebtoken')

const timeInterval = 1000

//多聊天室
//使用roomid ，对相同的roomid进行广播
let group = {}

wss.on('connection', function connection(ws) {
    //初始心跳连接状态
    ws.isAlive = true

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
        console.log('msg', msgObj)
        //鉴权
        if (msgObj.event === 'auth') {
            jwt.verify(msgObj.message, 'secret', (err, decode) => {
                if (err) {
                    //鉴权失败
                    ws.send(JSON.stringify({
                        event: 'noauth',
                        message: 'please auth again'
                    }))
                    console.log('auth error')
                    return
                } else {
                    console.log(decode)
                    ws.isAuth = true
                    return
                }
            })
            return
        }
        //拦截非鉴权的请求
        if (!ws.isAuth) {
            return
        }
        //心跳检测
        if (msgObj.event === 'heartbeat' && msgObj.message === 'pong') {
            ws.isAlive = true
            return
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

server.on('upgrade', function upgrade(request, socket, head) {
    wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
    });
});

setInterval(_ => {
    console.log('fff')
    wss.clients.forEach(ws => {
        if (!ws.isAlive) {
            // 房间连接数减一
            group[ws.roomid]--
            //关闭连接
            return ws.terminate()
        }
        //主动发送心跳检测请求
        //当客户端发起了消息之后，主动设置flag为在线
        ws.isAlive = false
        ws.send(JSON.stringify({
            event: 'heartbeat',
            message: 'ping',
            num: group[ws.roomid]
        }))
    })
},timeInterval)

server.listen(8080);
