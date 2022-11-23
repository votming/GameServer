
class Player{
    client=null;
    id=0;
    username="";
    posX=0;
    posY=0;
    posZ=0;

    rotX=0;
    rotY=0;
    rotZ=0;
    rotW=0;

    constructor(id, username, x,y,z) {
        this.id=id;
        this.username=username;
        this.posX = x;
        this.posY = y;
        this.posZ = z;

    }
}

module.exports = Player;
