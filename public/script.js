$(() => {
    const socket = io();

    // Submit username form, set username and show chatcontainer if approved
    $('#usernameForm').submit(e => {
        e.preventDefault();
        if ( $('#username').val().trim().length !== 0 ) {
            socket.emit('username', $('#username').val());
            $('#username').val('');
            socket.on('approved', () => {
                $('#chatContainer').show();
                $('#userContainer').hide();
            });
            socket.on('unapproved', () => {
                $('#usernameForm').append($('<span>').text('Username is currently not available'));
            });
        }
        return false;
    });

    // Sending message
    $('#msgform').submit(e => {
        e.preventDefault();
        socket.emit('chat message', $('#msginput').val());
        $('#msginput').val('');
        return false;
    });

    // If user connected, append message with connected message.
    socket.on('user connected', (username, clients) => {
        $('#msgbox').append($('<div class="boldmsg">').text(username + ' connected to the chat'));
        $('#msgbox').scrollTop($('#msgbox')[ 0 ].scrollHeight);
        clients.forEach((item, index) => {
            if ( $('#' + item.username).length ) {
                return;
            }
            $('#onlineUsers').append($('<div class="boldmsg">').attr('id', item.username).text(item.username));
        });

        // Show recieved chatmessage
        socket.on('chat message', (msg, username) => {
            $('#msgbox').append($('<div id="msg">').text(username + ': ' + msg));
            $('#msgbox').scrollTop($('#msgbox')[ 0 ].scrollHeight);
        });

        // Show disconnected message if user disconnected
        socket.on('user disconnected', username => {
            $('#msgbox').append($('<div class="boldmsg">').text(username + ' disconnected from the chat'));
            $('#msgbox').scrollTop($('#msgbox')[ 0 ].scrollHeight);
            $('#' + username).remove();
        });
    });

});