var buffer = require('buffer');
var udp = require('dgram');
// creating a client socket
var client = udp.createSocket('udp4');

const Packet = require('./packet')
//buffer msg
var data = Buffer.from('siddheshrane');
var message = null;
function sendMessage(msg){
    //console.log('Seding: '+msg);
    let packet = new Packet({'id':3});
    packet.writeString('Привет, это тестовое сообщение с клиента, тебе потом здесь будет приходить json объект, который тебе конечно не придется парсить, но тебе нужно будет его передать дальше, а то как же мы по сети играть будем, если ты не сможешь трансферить пакеты между клиентами');
    client.send(packet.buffer);

    message = null;
}

client.on('message',function(msg,info){
    console.log('Data received from server : ' + msg.toString());
    console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);
});

//sending msg
/*client.send(data,8081,'localhost',function(error){

    if(error){
        client.close();
    }else{
        console.log('Data sent !!!');
    }
});

var data1 = Buffer.from('hello');
var data2 = Buffer.from('world');

//sending multiple msg
client.send([data1,data2],8081,'localhost',function(error){
    if(error){
        client.close();
    }else{
        console.log('Data sent !!!');
    }
});*/
client.on('connect', (msg,info)=>{
    sendMessage('finally got on server')
    var i=0;
    var lastSec = 0;
    var currSec=0;

    sendMessage(i+"");
    /*while(true){
        currSec = Math.round(Date.now()/1000);
        if(currSec!=lastSec)
        {
            console.log(i);
            lastSec=currSec;
            i=0;

            const memory = process.memoryUsage();
            console.log((memory.heapUsed / 1024 / 1024 / 1024).toFixed(4), 'GB');
        }
        i++
        sendMessage(i+"");
    }*/
});


var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that
    // with toString() and then trim()
    sendMessage(d.toString().trim())
});


var res = client.connect(8081,'5.61.32.218');
