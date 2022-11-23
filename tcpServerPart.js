var net = require('net');
const utils = require('./utility');
const Packet = require('./packet');
const Client = require('./client');
var shortid = require('shortid');

class TCP {
    clientId=0;
    server=null;
    clients = [];
    rooms = [];
    client = null;

    constructor(clients,rooms) {
        this.clients = clients;
        this.rooms = rooms;
        const tcpServer = net.createServer(function(socket) {
            console.log("[TCP] Got client, Clients count: ",clients.length+1);
            let id = shortid.generate();//clients.length>0 ? clients.last().id : 1;
            let client = new Client(id, clients, rooms);
            client.tcp.connect(socket);
            clients.push(client);
        }).on('end', ()=>{
            utils.log('[TCP] Server stopped');
        }).on('error', (err)=>{
            utils.log('[TCP] Huge error occurred! Err: '+err);
        })
        utils.log('[TCP SERVER STARTED]');
        tcpServer.listen(8081, '0.0.0.0');
        this.server = tcpServer;
    }
}

module.exports = TCP;
