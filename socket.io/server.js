const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
})

io.on('connection', function (socket) {
    console.log('a socket is connected')
    socket.on('inputEvent', function (msg) {
        console.log('msg from client:' + msg)
        // socket.send('server says:' + msg)
        // 广播
        socket.broadcast.emit('serverMsg', msg)
    })
})

http.listen(3000, function () {
    console.log('server is running on: 3000')
})
