const Packet = require('./packet')
const utils = require('./utility')

const {clientPackets, serverPackets} = require('./packetTypes');

/*const {serverPackets,clientPackets} = require('./index')*/


class Room {
    id = 0;
    clients = [];
    rooms = [];
    players = [];

    constructor(id, rooms) {
        this.id = id;
        this.rooms = rooms;
    }
}

module.exports = Room;
