var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    io = require("socket.io");

var server = http.createServer(function(request, response) {
    var uri = url.parse(request.url).pathname,
        filename = '';
    
    if (uri.substr(-1) === '/') {
        uri += 'index.html';
    }
    filename = path.join(process.cwd(), uri);
    
    path.exists(filename, function(exists){
        if(!exists) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found \n");
            response.end();
            return;
        }
        
        fs.readFile(filename, "binary", function(err, file) {
            var reasonPhrase = {};
            
            if(err) {
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err + "\n");
                response.end();
                return;
            }
            
            if ( uri.substr(-4) === '.css') {
                reasonPhrase = {"Content-Type": "text/css"}
            }
            
            response.writeHead(200, reasonPhrase);
            response.write(file, "binary");
            response.end();
        });
    });
});

function getTimestamp() {
    var currTime = new Date(),
        months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    return currTime.getDate() + ' ' + months[currTime.getMonth()] + ' ' + currTime.getHours() + ':' + currTime.getMinutes() + ':' + currTime.getSeconds();
}

server.listen(8081);
sys.puts(getTimestamp() + " - Server running at http://localhost:8081/");

var socket = io.listen(server);
socket.on('connection',function(client) {
    client.on('message', function(data){

        sys.puts(getTimestamp() + " - Message: " + JSON.stringify(data));
        socket.broadcast(data);
    });
    client.on('disconnect', function() { });
}); 