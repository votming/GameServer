
function boolToBytes(_bool) {
    let buffer = Buffer.allocUnsafe(1);
    buffer.writeInt8(_bool, 0);
    return buffer;
}

function bytesToBool(_bytes) {
    return _bytes.readInt8(0);
}

function intToBytes(num) {
    let buffer = Buffer.allocUnsafe(4);
    buffer.writeInt32LE(num, 0);
    return buffer;
}

function bytesToInt(array) {
    return array.readInt32LE(0);
}

function floatToBytes(x) {
    let buf = Buffer.allocUnsafe(4)
    let bufTemp = buf;
    buf.writeFloatLE(x, 0);
    return buf;
}

function bytesToFloat(_bytes) {
    return _bytes.readFloatLE(0);
}


class Packet {

    buffer = Buffer.allocUnsafe(0);//byte array
    readableBuffer = [];
    readPos = 0;

    constructor(options = {}) {
        this.readPos = 0;

        if ('id' in options)
            this.writeInt(options['id']);

        if ('data' in options)
            this.setBytes(options['data']);
    }

    setBytes(_bytes) {
        this.writeByteArray(_bytes);
    }

    writeLength() {
        let _len = intToBytes(this.buffer.length);
        this.buffer = Buffer.concat([_len, this.buffer]);
    }

    insertInt(_int) {
        let _val = intToBytes(_int);
        this.buffer = Buffer.concat([_val, this.buffer]);
    }

    length() {
        return this.buffer.length;
    }

    unreadLength() {
        return this.buffer.length - this.readPos;
    }

    reset(_reset) {
        if (_reset === true) {
            this.buffer = Buffer.allocUnsafe(0);
            this.readableBuffer = null;
            this.readPos = 0;
        } else {
            this.readPos -= 4;
        }
    }

    writeByteArray(_bytes) {
        this.buffer = Buffer.concat([this.buffer, _bytes]);
    }

    writeFloat(_float) {
        this.buffer = Buffer.concat([this.buffer, floatToBytes(_float)]);
    }

    writeBool(_bool) {
        this.buffer = Buffer.concat([this.buffer, boolToBytes(_bool === true ? 1 : 0 & 0x000000ff)]);
    }

    writeString(_str, utf8 = false) {
        if (utf8)
            _str = Buffer.from(_str).toString('base64')
        this.writeInt(_str.length);
        this.buffer = Buffer.concat([this.buffer, Buffer.from(_str)]);
    }


    writeInt(_int) {
        this.buffer = Buffer.concat([this.buffer, intToBytes(_int)]);
    }


    readByte(_moveReadPos = true) {
        if (this.buffer.length > this.readPos) {
            let val = this.buffer[this.readPos];
            if (_moveReadPos) {
                this.readPos += 1;
            }
            return val;
        } else {
            console.log("[ERROR] readByte - There's no bytes to read");
        }
    }

    readBytes(_length, _moveReadPos = true) {
        if (this.buffer.length > this.readPos) {
            let _buffer = Buffer.allocUnsafe(_length);
            this.buffer.copy(_buffer, 0, this.readPos, this.readPos + _length);
            if (_moveReadPos) {
                this.readPos += _length;
            }
            return _buffer;
        } else {
            console.log("[ERROR] readBytes - There's no bytes to read");
        }
    }

    readInt(_moveReadPos = true) {
        if (this.buffer.length > this.readPos) {
            let _buffer = Buffer.allocUnsafe(4);
            this.buffer.copy(_buffer, 0, this.readPos, this.readPos + 4);
            if (_moveReadPos) {
                this.readPos += 4;
            }
            return bytesToInt(_buffer);
        } else {
            console.log("[ERROR] readInt - There's no bytes to read");
        }
    }

    readFloat(_moveReadPos = true) {
        if (this.buffer.length > this.readPos) {
            let _buffer = Buffer.allocUnsafe(4);
            this.buffer.copy(_buffer, 0, this.readPos, this.readPos + 4);
            if (_moveReadPos) {
                this.readPos += 4;
            }
            return bytesToFloat(_buffer);
        } else {
            console.log("[ERROR] readFloat - There's no bytes to read");
        }
    }

    readBool(_moveReadPos = true) {
        if (this.buffer.length > this.readPos) {
            let _buffer = Buffer.allocUnsafe(1);
            this.buffer.copy(_buffer, 0, this.readPos, this.readPos + 1);
            if (_moveReadPos) {
                this.readPos += 1;
            }
            return bytesToBool(_buffer) === 1;
        } else {
            console.log("[ERROR] readBool - There's no bytes to read");
        }
    }

    readString(utf8 = false, _moveReadPos = true) {
        if (this.buffer.length > this.readPos) {
            let _len = this.readInt();
            let _buffer = Buffer.allocUnsafe(_len);
            this.buffer.copy(_buffer, 0, this.readPos, this.readPos + _len);
            if (_moveReadPos) {
                this.readPos += _len;
            }
            return utf8 === true ? Buffer.from(_buffer.toString(), 'base64').toString() : _buffer.toString();
        } else {
            console.log("[ERROR] readString - There's no bytes to read");
        }
    }

}


module.exports = Packet
