var utils = require('./utility')
// --------------------creating a udp server --------------------
var udp = require('dgram');
const Packet = require('./packet');
const Client = require('./client');
const {clientPackets, serverPackets,getPacketTypeById, getPacketTypeByName} = require('./packetTypes');
class UDP{
    clients = [];
    server = null;
    rooms = [];

    constructor(clients,rooms) {
        this.clients = clients;
        this.rooms = rooms;
        let server = udp.createSocket('udp4');

        server.on('error',(err)=>{
            utils.log(`[UDP] Huge error occurred. Error: ${err}`);
            server.close();
        });

        server.on('connect', (msg,info)=>{
            utils.log('[UDP] New user is connected');
        });

        server.on('message',function(msg,info){
            let packet = new Packet({'data': msg});
            let clientId = packet.readString();
            let packetId = packet.readInt();
            let client = clients.find(x=>x.id===clientId);

            if(client===undefined || client===null){
                console.log("[UDP] NO CLIENT FOUND!",clientId)
                return;
            }

            if(client.udp.endPoint === null || client.udp.endPoint!==info.address)
            {
                utils.log('[UDP] Client has no udp registered. Saving new connection');
                client.udp.connect(info.address,info.port,server);
                let answerPacket = new Packet({'id':serverPackets.udpHandshake.id});
                answerPacket.writeString('Your udp connection saved on server!');
                client.udp.sendData(answerPacket);
            }else{
                if(packetId===undefined)
                    utils.log(`[UDP] Something went wrong, packet is undefined`);

                let packetType = getPacketTypeById(clientPackets,packetId);
                if(packetType===undefined || packetType===null)
                    utils.log(`[UDP] Wrong packet id (${packetId})`);

                packetType.callback(client,new Packet({'data':packet.readBytes(packet.unreadLength())}))
            }
            try{
            }catch(err){
                console.log(`[UDP] Error while processing income message. Error: ${err}`);
            }

        });

        server.on('listening',function(){
            utils.log('[UDP SERVER STARTED]');
        });

        server.on('close',function(){
            utils.log('[UDP] Socket is closed!');
        });

        server.bind(8081);
        this.server = server;
    }
}

module.exports = UDP;


/*setTimeout(function(){
    server.close();
},8000);*/





/*
 function toBytesInt32 (num) {
    let buffer = Buffer.alloc(4);
    buffer[3]=(num & 0xff000000) >> 24;
    buffer[2]=(num & 0x00ff0000) >> 16;
    buffer[1]=(num & 0x0000ff00) >> 8;
    buffer[0]=(num & 0x000000ff);
    return buffer;
}
function sendPacket(server, info, msg){
    console.log("Sending message: "+msg);
    packetType = toBytesInt32(2)
    stringSize = toBytesInt32(msg.length)
    let packet = Buffer.concat([packetType,stringSize,Buffer.from(msg),toBytesInt32(1)]);
    packetSize = toBytesInt32(packet.length)//packet.byteLength
    packet = Buffer.concat([packetSize,packet]);
    server.send(packet,info.port,info.address,function(error){
        if(error){
            client.close();
        }else{
            console.log('Data sent !!!');
        }

    });
}
*/
