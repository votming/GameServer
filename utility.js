

module.exports = {
    log: function (...args){
        console.log(`${new Date().toLocaleTimeString()}: `,...args);
    },
    getInt64Bytes: function (x) {
        let y= Math.floor(x/2**32);
        return [y,(y<<8),(y<<16),(y<<24), x,(x<<8),(x<<16),(x<<24)].map(z=> z>>>24)
    }
};
