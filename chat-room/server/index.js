const WebSocket = require('ws')

const wss = new WebSocket.Server({port: 9527})

let num = 0

wss.on('connection', function connection(ws) {
    console.log('连接')
    //接受客户端的消息
    ws.on('message',function (msg) {
        const msgObj = JSON.parse(msg)
        if (msgObj.event === 'enter'){
            ws.name = msgObj.message
            num++
        }
        // console.log(msg)
        // 广播消息
        wss.clients.forEach(client=>{
            //如果不是自己的客户端 加上ws !== client
            // 为了获取实时在线人数
            if(client.readyState === WebSocket.OPEN){
                msgObj.name = ws.name
                // 获取在线人数
                msgObj.num = num
                //发送消息给客户端
                client.send(JSON.stringify(msgObj))
            }
        })
    })

    ws.on('close',function(){
        if (ws.name){
            num--
        }
        let msgObj = {}
        wss.clients.forEach(client=>{
            if(client.readyState === WebSocket.OPEN){
                msgObj.name = ws.name
                msgObj.num = num
                msgObj.event = 'out'
                client.send(JSON.stringify(msgObj))
            }
        })
    })
})
