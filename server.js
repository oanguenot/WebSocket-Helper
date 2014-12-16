
var https 			= require('https'),				// HTTPS module
    http            = require('http'),              // HTTP module
    fs              = require('fs'),                // File System
	WebSocketServer = require('websocket').server,	// Websocket module
	express         = require('express'),			// Static Web content handler
    app             = express();					// Start express

var secure_port= 8886,
    unsecure_port = 8887;

var options = {
  key: fs.readFileSync('privatekey.pem'),
  cert: fs.readFileSync('certificate.pem')
};

app.use(express.static(__dirname + '/public'));

// Create the HTTP server
var server = http.createServer(app);
server.listen(unsecure_port, function() {
    console.log(new Date() + ' unsecure server listening on port ' + unsecure_port);
});

// Create the HTTPS server
var serverSecure = https.createServer(options, app);
serverSecure.listen(secure_port, function() {
    console.log((new Date()) + ' secure server listening on port ' + secure_port);
});

// Create the unsecure websocket server
var wsServer = new WebSocketServer({
    httpServer: server
});

var secureWsServer = new WebSocketServer({
    httpServer: serverSecure
});


// Manage connection on unsecure socket
wsServer.on('request', function(r){

    // Only accept connection with this protocol and origin
    var connection = r.accept('json', r.origin);

    console.log(new Date() + ' Unsecure Peer ' + connection.remoteAddress + ' connected');

    // When receiving a client message
    connection.on('message', function(evt) {	
    	// The string message that was sent to us
    	var msgString = evt.utf8Data;
    	console.log("Received", msgString);
        connection.send("Hello little client...");
        setTimeout(function() {
            connection.send("An other message 3s after");
        }, 3000);
    });

    connection.on('close', function(reasonCode, description) {
    	// Client is disconnected
    	console.log((new Date()) + ' Unsecure Peer ' + connection.remoteAddress + ' disconnected');
    });
});

// Manage connection on secure socket
secureWsServer.on('request', function(r){

    // Only accept connection with this protocol and origin
    var connection = r.accept('json', r.origin);

    console.log(new Date() + ' Secure Peer ' + connection.remoteAddress + ' connected');

    // When receiving a client message
    connection.on('message', function(evt) {    
        // The string message that was sent to us
        var msgString = evt.utf8Data;
        console.log("Received", msgString);
        connection.send("Hello little client...");
        setTimeout(function() {
            connection.send("An other message 3s after");
        }, 3000);
    });

    connection.on('close', function(reasonCode, description) {
        // Client is disconnected
        console.log((new Date()) + ' Secure Peer ' + connection.remoteAddress + ' disconnected');
    });
});

