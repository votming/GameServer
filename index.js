/*
let packet = new Packet();
packet.writeInt(123456789);
packet.writeFloat(126.235);
packet.writeString("VsemPrivet, eto tcp/udp test packet");
packet.writeBool(true);
packet.writeBool(false);
packet.writeInt(12345678);
packet.writeFloat(126.235);
packet.writeString("абвгдабвгд, эта строчка призвана протестировать конвертацию",true);
packet.writeBool(true);
packet.writeBool(false);
console.log(packet.readBytes(4,false));
console.log(packet.readInt());
console.log(packet.readFloat());
console.log(packet.readString());
console.log(packet.readBool());
console.log(packet.readBool());
console.log(packet.readInt());
console.log(packet.readFloat());
console.log(packet.readString(true));
console.log(packet.readBool());
console.log(packet.readBool());
*/
if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
}

var clients = [];
var rooms = [];

var TCP = require('./tcpServerPart')

var UDP = require('./udpServerPart')

var tcp = new TCP(clients, rooms);
var udp = new UDP(clients, rooms);

function writeInfo(){
    setTimeout(()=>{writeInfo()},1000);
    const memory = process.memoryUsage();
    console.log((memory.heapUsed / 1024 / 1024 / 1024).toFixed(4), 'GB');
    console.log(clients.length);
    if(clients.length>0 && clients[0].room!=null)
    {
        console.log(clients[0].room.id);

        console.log(rooms);
    }
}
//writeInfo();



