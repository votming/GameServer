const Packet = require('./packet');
var shortid = require('shortid');
const Room = require('./room')
const utils = require('./utility')

const serverPackets = {
    tcpHandshake: {
        id: 1,
        callback: (client) => {
            console.log("[server] calling callback for: tcpHandshake")
            let packet = new Packet({'id': 1}); //Тип пакета
            packet.writeString('Welcome to the server!'); // Сообщение для клиента
            packet.writeString(client.id); // Его id
            console.log('client.id',client.id);
            client.tcp.sendData(packet);
        }
    }, tcpRegistering: {
        id: 2,
        callback: (client, result) => {
            console.log("[server] calling callback for: tcpRegistering")
            let packet = new Packet({'id': 2}); //Тип пакета
            packet.writeBool(result);
            client.tcp.sendData(packet);
        }
    }, udpHandshake: {
        id: 3,
        callback: () => {
            console.log("[server] calling callback for: udpHandshake")
        }
    }, joinRoom: {
        id: 4,
        callback: (client, successfullyConnected=false,  isHost=false, roomId="") => {
            console.log("[server] calling callback for: joinRoom")
            let packet = new Packet({'id': 4}); //Тип пакета
            packet.writeBool(successfullyConnected);
            packet.writeBool(isHost);
            packet.writeString(roomId);
            client.tcp.sendData(packet);
            if(isHost){
                serverPackets.updateRoom.callback(client);
            }
        }
    }, roomsInfo: {
        id: 5,
        callback: (client, rooms) => {
            console.log("[server] calling callback for: roomsInfo")
            let packet = new Packet({'id': 5}); //Тип пакета
            packet.writeInt(rooms.length);
            for(let i=0;i<rooms.length;i++){
                packet.writeString(rooms[i].id);
                packet.writeInt(rooms[i].players.length);
            }
            client.tcp.sendData(packet);
        }
    }, updateRoom: {
        id: 6,
        callback: (client) => {
            console.log("[server] calling callback for: updateRoom")
            let packet = new Packet({'id': 6}); //Тип пакета
            let room = client.room;
            packet.writeInt(room.players.length);
            //console.log("writing players", room.players);
            for(let i=0;i<room.players.length;i++){
                //console.log("PLAYER", room.players[i]);
                //console.log("id",room.players[i].id);
                packet.writeInt(room.players[i].id);
                //console.log("name",room.players[i].name);
                packet.writeString(room.players[i].name);
            }
            client.tcp.sendData(packet);
        }
    }, newChatMessage: {
        id: 7,
        callback: (client, message) => {
            console.log("[server] calling callback for: newChatMessage")
            let packet = new Packet({'id': 7}); //Тип пакета
            packet.writeString(message,true)
            client.tcp.sendData(packet);
        }
    }, spawnPlayer: {
        id: 8,
        callback: (client, target) => {
            //console.log("[server] calling callback for: spawnPlayer")
            let player = target.player;
            if(player!==null)
            {
                //console.log("player IS NOT null, sending")
                let packet = new Packet({'id': 8}); //Тип пакета
                packet.writeString(player.id);
                packet.writeString(player.username);
                packet.writeFloat(player.posX);
                packet.writeFloat(player.posY);
                packet.writeFloat(player.posZ);
                /*packet.writeFloat(player.rotX);
                packet.writeFloat(player.rotY);
                packet.writeFloat(player.rotZ);
                packet.writeFloat(player.rotW);*/
                //console.log(client.id+" SEND PACKET ID"+8)
                client.tcp.sendData(packet);
            }else{
                //console.log("player is null, sending")
            }
        }
    }, positionPlayer: {
        id: 9,
        callback: (client, target) => {
            //console.log("[server] calling callback for: positionPlayer")
            let packet = new Packet({'id': 9}); //Тип пакета
            packet.writeString(message,true)
            client.tcp.sendData(packet);
        }
    }, rotationPlayer: {
        id: 10,
        callback: (client, target) => {
            //console.log("[server] calling callback for: rotationPlayer")
            let packet = new Packet({'id': 10}); //Тип пакета
            packet.writeString(message,true)
            client.tcp.sendData(packet);
        }
    }, startGame: {
        id: 11,
        callback: (client) => {
            //console.log("[server] calling callback for: rotationPlayer")
            let packet = new Packet({'id': 11}); //Тип пакета
            client.tcp.sendData(packet);
        }
    }, syncPosition: {
        id: 12,
        callback: (client, packet) => {
            //console.log("[server] calling callback for: rotationPlayer")
            //let packet = new Packet({'id': 11}); //Тип пакета
            packet.insertInt(12);
            client.udp.sendData(packet);
        }
    }, syncAllIngameObjectsRequest: {
        id: 13,
        callback: (client, requester) => {
            //console.log("[server] calling callback for: rotationPlayer")
            let packet = new Packet({'id': 13}); //Тип пакета
            packet.writeString(requester.id)
            client.udp.sendData(packet);
        }
    }, syncAllIngameObjectsResponse: {
        id: 14,
        callback: (client, packet) => {
            //console.log("[server] calling callback for: rotationPlayer")
            packet.insertInt(14);
            client.udp.sendData(packet);
        }
    }
}

const clientPackets = {
    tcpHandshakeAnswer: {
        id: 1,
        callback: (client, packet) => {
            utils.log(`ПРИШЕЛ ПАКЕТ WELCOME от ${client.login} [room ${client.room.id}]`);
            let login = packet.readString();
            let password = packet.readString();
            let b = false;
            if((login==='test' || login==='ginger'|| login==='votming' || login==='kislolord') && password==='123'){
                b = true;
                client.name=login;
                client.login=login;
            }

            serverPackets.tcpRegistering.callback(client, b);
        }
    }, tcpRegisteringAnswer: {
        id: 2,
        callback: () => {
            utils.log(`ПРИШЕЛ ПАКЕТ REGISTERING`);
        }
    }, udpHandshakeAnswer: {
        id: 3,
        callback: () => {
            utils.log(`ПРИШЕЛ ПАКЕТ UDPHANDSHAKE`);
        }
    }, createRoom: {
        id: 4,
        callback: (client, packet) => {
            utils.log(`ПРИШЕЛ ПАКЕТ createRoom от ${client.login}`);
            let id = null;
            while(true) {
                id = shortid.generate().substring(0,4).toUpperCase();
                if (!(id in client.rooms))
                    break;
            }
            let room = new Room(id,client.rooms);
            room.players.push(client);
            client.rooms.push(room);
            client.room = room;
            serverPackets.joinRoom.callback(client, true, true, room.id);
        }
    }, joinRoom: {
        id: 5,
        callback: (client,packet) => {
            utils.log(`ПРИШЕЛ ПАКЕТ joinRoom от ${client.login}`);
            let roomId = packet.readString();
            let room = client.rooms.find(x=>x.id===roomId);
            if(room){
                //console.log('ROOM EXISTS');
                //console.log(room.players)
                room.players.push(client);
                //console.log(room.players)
                client.room = room;
                serverPackets.joinRoom.callback(client, true, false, roomId);
                for(let i=0;i<room.players.length;i++){
                    serverPackets.updateRoom.callback(room.players[i]);
                    serverPackets.newChatMessage.callback(room.players[i], `${client.name} присоединился`);
                }
            }else{
                //console.log('ROOM NOT EXISTS');
                serverPackets.joinRoom.callback(client, false);
            }
        }
    }, getRooms:{
        id:6,
        callback: (client,packet) => {
            utils.log(`ПРИШЕЛ ПАКЕТ getRooms от ${client.login}`);
            let page=0;
            if(packet!=null)
                page = packet.readInt();
            let rooms = client.rooms.slice(page*5,5);
            serverPackets.roomsInfo.callback(client, rooms);
        }
    }, leaveRoom:{
        id:7,
        callback: (client,packet) => {
            utils.log(`ПРИШЕЛ ПАКЕТ leaveRoom от ${client.login} [room ${client.room.id}]`);
            //client
            let room = client.room;
            utils.log(room.players.length);
            //let removeIndex = room.players.map(_player => _player.id).indexOf(client.id);
            //~removeIndex && room.players.splice(removeIndex, 1);
            client.exit();
            utils.log(room.players.length);
            for(let i=0;i<room.players.length;i++){
                serverPackets.updateRoom.callback(room.players[i]);
                serverPackets.newChatMessage.callback(room.players[i], `${client.name} вышел`);
            }
        }
    }, sendChatMessage:{
        id:8,
        callback: (client,packet) => {
            utils.log(`ПРИШЕЛ ПАКЕТ sendChatMessage от ${client.login} [room ${client.room.id}]`);
            let message = packet.readString(true);
            //console.log(client.id, "send message: ",message);
            message = `${client.name}: ${message}`;
            let room = client.room;
            for(let i=0;i<room.players.length;i++){
                serverPackets.newChatMessage.callback(room.players[i],message);
            }
        }
    }, positionPlayer:{
        id:9,
        callback: (client,packet) => {
            utils.log(`ПРИШЕЛ ПАКЕТ positionPlayer от ${client.login} [room ${client.room.id}]`);
            let message = packet.readString(true);
            //console.log(client.id, "send message: ",message);
            message = `${client.name}: ${message}`;
            let room = client.room;
            for(let i=0;i<room.players.length;i++){
                serverPackets.newChatMessage.callback(room.players[i],message);
            }
        }
    }, rotationPlayer:{
        id:10,
        callback: (client,packet) => {
            utils.log(`ПРИШЕЛ ПАКЕТ rotationPlayer от ${client.login} [room ${client.room.id}]`);
            let message = packet.readString(true);
            //console.log(client.id, "send message: ",message);
            message = `${client.name}: ${message}`;
            let room = client.room;
            for(let i=0;i<room.players.length;i++){
                serverPackets.newChatMessage.callback(room.players[i],message);
            }
        }
    }, startGame:{
        id:11,
        callback: (client,packet) => {
            utils.log(`ПРИШЕЛ ПАКЕТ startGame от ${client.login} [room ${client.room.id}]`);
            let room = client.room;
            for(let i=0;i<room.players.length;i++){
                room.players[i].isHost = false;
                serverPackets.startGame.callback(room.players[i]);
            }
            client.isHost = true;
        }
    }, spawnPlayer:{
        id:12,
        callback: (client,packet) => {
            utils.log(`ПРИШЕЛ ПАКЕТ startGame от ${client.login} [room ${client.room.id}]`);
            client.sendIntoGame(client.name);
        }
    }, myMovement:{
        id:13,
        callback: (client,packet) => {
            utils.log(`ПРИШЕЛ ПАКЕТ myMovement от ${client.login} [room ${client.room.id}]`);
            let roomPlayers = client.room.players;
            for(let i = 0;i<roomPlayers.length;i++){
                if(roomPlayers[i].id!==client.id)
                    serverPackets.syncPosition.callback(roomPlayers[i], packet);
            }
        }
    }, syncAllIngameObjectsRequest:{
        id:14,
        callback: (client,packet) => {
            utils.log(`ПРИШЕЛ ПАКЕТ syncAllIngameObjects от ${client.login} [room ${client.room.id}]`);
            let roomPlayers = client.room.players;
            let hostClient = roomPlayers.find(x=>x.isHost===true);
            serverPackets.syncAllIngameObjectsRequest.callback(hostClient,client);
        }
    }, syncAllIngameObjectsResponse:{
        id:15,
        callback: (client,packet) => {
            utils.log(`ПРИШЕЛ ПАКЕТ syncAllIngameObjectsResponse от ${client.login} [room ${client.room.id}]`);
            let requesterId = packet.readString();
            let requester = client.clients.find(x=>x.id===requesterId);
            serverPackets.syncAllIngameObjectsResponse.callback(requester,new Packet({'data':packet.readBytes(packet.unreadLength())}));
        }
    }
}

var getPacketTypeById = (array, id) => {
    return Object.entries(array).find(x=>x[1]['id']===id)[1];
}
var getPacketTypeByName = (array, name) => {
    return Object.entries(array).find(x=>x[0]===name)[1];
}

module.exports = {clientPackets, serverPackets,getPacketTypeById, getPacketTypeByName}
