var net = require('net');
const Packet = require('./packet')

var client = new net.Socket();
client.connect(8081, '5.61.32.218', function() {
    console.log('Connected');
    //client.write('Hello, server! Love, Client.');
    var i=1;
    let packet = new Packet();
    packet.writeString("some test here guys!");
    packet.insertInt(1)
    packet.insertInt(packet.buffer.length)
    client.write(packet.buffer);
    /*while(i>0){

        var start = new Date().getTime();
        while (new Date().getTime() < start + 60);
        if(i%10000==0)
        {
            console.log("Sending: "+i);

            const memory = process.memoryUsage();
            console.log((memory.heapUsed / 1024 / 1024 / 1024).toFixed(4), 'GB');
        }
        i++;
        client.write("Привет, это тестовое сообщение с клиента, тебе потом здесь будет приходить json объект, который тебе конечно не придется парсить, но тебе нужно будет его передать дальше, а то как же мы по сети играть будем, если ты не сможешь трансферить пакеты между клиентами");
    };
    client.end();*/
});
client.on('error', function(data) {
    console.log('error: ' + data);
    //client.destroy(); // kill client after server's response
});

client.on('data', function(data) {
    console.log('Received: ' + data);
    //client.destroy(); // kill client after server's response
});

client.on('close', function() {
    console.log('Connection closed');
});
client.on('end',()=>{
    console.log('destroy');
    client.destroy();
})

