const app = require('express')();
const express = require('express');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.use('/public', express.static('public'));

let clients = [];

io.on('connection', socket => {

    socket.on('username', uname => {

        let client = new Client(uname, socket.id);

        for ( let i = 0, len = clients.length; i < len; ++i ) {
            let c = clients[ i ];

            if ( c.username === uname ) {
                io.emit('unapproved');
                break;
            }
            clients.push(client);

            console.log('User \'' + client.getUsername + '\' connected');
            io.emit('user connected', client.getUsername, clients);
            io.emit('approved');
        }

        if(clients.length === 0){

            clients.push(client);

            console.log('User \'' + client.getUsername + '\' connected');
            io.emit('user connected', client.getUsername, clients);
            io.emit('approved');
        }

        socket.on('disconnect', () => {
            for ( let i = 0, len = clients.length; i < len; ++i ) {
                let c = clients[ i ];

                if ( c.clientId === socket.id ) {
                    clients.splice(i, 1);
                    console.log('User \'' + c.username + '\' disconnected');
                    io.emit('user disconnected', c.username);
                    break;
                }
            }
        });

        socket.on('chat message', msg => {
            if ( msg.trim().length !== 0 ) {
                io.emit('chat message', msg, client.getUsername);
            }
        });
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});

class Client {
    constructor(username, clientId) {
        this.username = username;
        this.clientId = clientId;
    }
    get getUsername(){
        return this.username
    }
}