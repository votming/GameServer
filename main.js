/*


const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

socket.on('message', (msg,rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
})

console.log("udp started");
socket.bind(8081);
*/

function getInt64Bytes(x) {
    let y= Math.floor(x/2**32);
    return [y,(y<<8),(y<<16),(y<<24), x,(x<<8),(x<<16),(x<<24)].map(z=> z>>>24)
}

function Log(msg){
    console.log(`${new Date().toLocaleTimeString()}: ${msg}`);
}
var buffer = require('buffer');
var net = require('net');
class Packet{
    static types = {welcome:1}
}

var packetType = Buffer.alloc(4);
var packetSize = Buffer.alloc(4);
var stringSize = Buffer.alloc(4);
function toBytesInt32 (num) {
    let buffer = Buffer.alloc(4);
    buffer[3]=(num & 0xff000000) >> 24;
    buffer[2]=(num & 0x00ff0000) >> 16;
    buffer[1]=(num & 0x0000ff00) >> 8;
    buffer[0]=(num & 0x000000ff);
    return buffer;
}
function sendPacket(socket, msg){
    console.log("Sending message: "+msg);
    packetType = toBytesInt32(1)
    stringSize = toBytesInt32(msg.length)
    let packet = Buffer.concat([packetType,stringSize,Buffer.from(msg),toBytesInt32(0)]);
    packetSize = toBytesInt32(packet.length)//packet.byteLength
    packet = Buffer.concat([packetSize,packet]);
    socket.write(packet);
}

const tcpServer = net.createServer(function(socket) {
    //socket.bytesRead=4096;
    //socket.bytesWritten=4096;
    Log('Got client');
    let x = 'hey';
    let y = 'some testing string2';
    let z = 'some testing string3';
    sendPacket(socket,x);
    sendPacket(socket,"sup my homies, today we're gonna try to make some multiplayer game haha. It's so awesome to work with sockets!sup my homies, today we're gonna try to make some multiplayer game haha. It's so awesome to work with sockets!sup my homies, today we're gonna try to make some multiplayer game haha. It's so awesome to work with sockets!111");
    socket.on('data', function(data){
        Log("data from client: "+data.toString('utf8'));
        console.log(data);
    }).on('end',()=>{
        Log('client left')
    }).on('error',(err)=>{
        Log(err)
    }).on('close',()=>{
        Log('close fired')
    });
}).on('end', ()=>{
    Log('client disconnected');
}).on('error', (err)=>{
    Log(err);
})
Log("tcp started");
tcpServer.listen(8081, '0.0.0.0');



var udp = require('dgram');

// --------------------creating a udp server --------------------

// creating a udp server
var server = udp.createSocket('udp4');

// emits when any error occurs
server.on('error',function(error){
    Log('Error: ' + error);
    server.close();
});

server.on('connect', (msg,info)=>{
    Log('new user is connected');
});
// emits on new datagram msg

var i=0;
var lastSec = 0;
var currSec=0;
server.on('message',function(msg,info){
    currSec = Math.round(Date.now()/1000);
    if(currSec!=lastSec)
    {
        Log('udp: '+i);
        lastSec=currSec;
        i=0;
    }
    i++;
    //console.log('Data received from client : ' + msg.toString());
    //console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);

//sending msg
    /*server.send(msg,info.port,'localhost',function(error){
        if(error){
            client.close();
        }else{
            //console.log('Data sent !!!');
        }

    });*/

});

//emits when socket is ready and listening for datagram msgs
server.on('listening',function(){
    var address = server.address();
    var port = address.port;
    var family = address.family;
    var ipaddr = address.address;
    Log('Server is listening at port' + port);
    Log('Server ip :' + ipaddr);
    Log('Server is IP4/IP6 : ' + family);
});

//emits after the socket is closed using socket.close();
server.on('close',function(){
    Log('Socket is closed !');
});

server.bind(8081);

/*setTimeout(function(){
    server.close();
},8000);*/
