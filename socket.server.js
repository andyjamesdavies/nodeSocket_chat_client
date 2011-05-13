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
            if(err) {
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err + "\n");
                response.end();
                return;
            }
            
            response.writeHead(200);
            response.write(file, "binary");
            response.end();
        });
    });
});

server.listen(8081);

sys.puts("Server running at http://localhost:8081/");

var socket = io.listen(server);
socket.on('connection',function(client) {
    client.on('message', function(data){ 
        console.log("Message: " + JSON.stringify(data));
        socket.broadcast(data);
    });
    client.on('disconnect', function() { });
}); 