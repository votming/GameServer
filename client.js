const Packet = require('./packet')
const utils = require('./utility')
const Player = require('./player')
const dataBufferSize = 4096;

const {clientPackets, serverPackets, getPacketTypeById, getPacketTypeByName} = require('./packetTypes');

/*const {serverPackets,clientPackets} = require('./index')*/


class Client {
    id = 0;
    player = null;
    tcp = null;
    udp = null;
    room = 0;
    clients = [];
    rooms = [];
    name = "";
    login = "";
    isHost = false;

    constructor(client_id, clients, rooms) {
        this.clients = clients;
        this.rooms = rooms;
        this.id = client_id;
        this.tcp = new TCP(this);
        this.udp = new UDP(this);
    }

    sendIntoGame(playerName){
        let player = new Player(this.id, playerName, 0,1,-5);
        this.player = player;
        for(let i=0;i<this.room.players.length;i++){
            let _ingamePlayer = this.room.players[i];
            if(_ingamePlayer.id!==this.id){
                serverPackets.spawnPlayer.callback(this,_ingamePlayer);
            }
        }
        for(let i=0;i<this.room.players.length;i++){
            let _ingamePlayer = this.room.players[i];
            serverPackets.spawnPlayer.callback(_ingamePlayer,this);
        }
    }

    exit(){
        let room = this.room;
        if(room==null)
            return;
        let players = room.players;
        if(players===undefined || players===null)
            return;
        for(let i=0; i<players.length;i++){
            if(players[i].id===this.id){
                players.splice(i,1);
                if(room.players.length === 0){
                    let removeIndex = this.rooms.map(_room => _room.id).indexOf(this.room.id);
                    ~removeIndex && this.rooms.splice(removeIndex, 1);
                }
                this.room = null;
                return;
            }
        }
    }

    delete(){
        let removeIndex = this.clients.map(_client => _client.id).indexOf(this.id);
        ~removeIndex && this.clients.splice(removeIndex, 1);
    }
}

class TCP {
    socket = null;
    client = null;

    id = 0;
    stream;
    receivedData = null;
    receivedBuffer = [];

    constructor(client) {
        this.client = client;
        this.id = client.id;
    }

    connect(socket) {
        this.socket = socket;

        this.socket.on('data', (data)=>{
            //utils.log("[TCP] Got message from client: ", data);
            if (data.length <= 0) {
                console.log('[TCP] SOMETHING WENT WRONG!! NO MESSAGE CAME');
                return;
            }
            this.handleData(data);
            try{
            }catch(err){
                console.log(`[TCP] Error while processing income message. Error: ${err}`);
            }
        }).on('end', () => {
            utils.log(`[TCP] Client ${this.client.name} left`)
            this.client.exit();
            this.client.delete();
        }).on('error', (err) => {
            utils.log(`[TCP] Client ${this.client.name}. Error occurred! err: ${err}`)
        }).on('close', () => {
            this.client.exit();
            this.socket.end();
        });
        serverPackets.tcpHandshake.callback(this.client);
    }

    sendData(packet) {
        packet.insertInt(packet.buffer.length);
        //utils.log('[TCP] Send message: ',packet.buffer);
        this.socket.write(packet.buffer);
    }

    handleData(data) {
        let packetLength = 0;
        let _packet = new Packet({'data': data});

        if (_packet.unreadLength() >= 4) {
            packetLength = _packet.readInt();
            if (packetLength <= 0)
                return true;
        }
        while (packetLength > 0 && packetLength <= _packet.unreadLength()) {
            let packetId = _packet.readInt(); // Пришел пакет. Берем его ID
            let incomingPacket = null;
            if(_packet.unreadLength()>0){
                let packetBytes = _packet.readBytes(packetLength-4); // Берем из пакета все данные
                incomingPacket = new Packet({'data': packetBytes});  // Создаем на основе этих данных новый пакет который дальше будем обрабатывать
            }
            let packetType = getPacketTypeById(clientPackets, packetId); //Ищем пакет на стороне сервера

            if(packetType!==undefined) // Если пакет есть, то вызываем его обработку
            {
                packetType.callback(this.client, incomingPacket)
            }
            else
            {
                throw new Error("SOMETHING WENT WRONG!! WRONG PACKET ID!! ID: "+packetId);
            }
            if (_packet.unreadLength() >= 4) {
                packetLength = _packet.readInt();
                if (packetLength <= 0)
                    return true;
            }
        }
        if (packetLength <= 1)
            return true;
        return false;
    }
}

class UDP {
    id=0;
    client = null;
    endPoint = null;
    port;
    socket = null;

    constructor(client) {
        this.client = client;
        this.id = client.id;
    }

    connect(endPoint, port, server){
        this.endPoint = endPoint;
        this.port = port;
        this.server = server;
    }

    handleData(_packetData) {
        let _packetLength = _packetData.readInt();
        let _packetBytes = _packetData.readBytes(_packetLength);
        if(_packetBytes===undefined || _packetBytes<4)
            return;
        //console.log("INFO",_packetBytes);
        let _packet = new Packet({'data':_packetBytes})
        let _packetId = _packet.readInt();
        //console.log('[UDP] Packet processed! Packet id: ',_packetId);
        //Server.packetHandlers[_packetId](id, _packet);
    }
    sendData(packet) {
        packet.writeLength();
        //utils.log('[UDP] Send message: ',packet.buffer);
        this.server.send(packet.buffer,this.port,this.endPoint,function(error){
            if(error){
                this.server.close();
                console.log('[UDP] CANT SEND PACKET :(');
            }else{
                //console.log('Data sent !!!');
            }
        });
    }
}


function sendTCPData(socket, packet) {
    packet.insertInt(packet.buffer.length);
    socket.write(packet.buffer);
}




module.exports = Client;
