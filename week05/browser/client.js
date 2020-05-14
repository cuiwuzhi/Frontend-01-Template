const net = require('net');

class Request {
  //method, url = host + port + path
  //body: k/v
  //headers
  constructor(options) {
    this.method = options.method || 'GET';
    this.host = options.host;
    this.path = options.path || '/';
    this.port = options.port || 80;
    this.body = options.body || {};
    this.headers = options.headers || {};
    if (!this.headers["Content-Type"]) {
      this.headers["Content-Type"] = "appliction/x-www-form-urlendoed";
    }
    if (this.headers["Content-Type"] === "appliction/json") {
      this.bodyText = JSON.stringify(this.body);
    } else if (this.headers["Content-Type"] === "appliction/x-www-form-urlendoed") {
      this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&');

      this.headers["Content-Length"] = this.bodyText.length;
    }
  }
  toString() {
    return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}
\r
${this.bodyText}`;
  }
  send(connection) {
    return new Promise((resolve, reject) => {
      let parser = new ResponseParser();
      if (connection) {
        connection.write(this.toString());
      } else {
        connection = net.createConnection({
          host: this.host,
          port: this.port
        }, () => {
          connection.write(this.toString());
        });
      }
      connection.on('data', (data) => {
        console.log(data.toString());
        parser.receive(data.toString());
        if (parser.isFinished) {
          resolve(parser.response);
        }
        connection.end();
      });
      connection.on('error', (error) => {
        reject(error);
        connection.end();
      });
    });
  }
}

/**
 * 解析服务器返回信息
 * status line
 * response headers
 * response body
*/
class ResponseParser {
  constructor() {
    this.WAITING_STATUS_LINE = 0;
    this.WAITING_STATUS_LINE_END = 1;
    this.WAITING_HEADER_NAME = 2;
    this.WAITING_HEADER_SPACE = 3;
    this.WAITING_HEADER_VALUE = 4;
    this.WAITING_HEADER_LINE_END = 5;
    this.WAITING_HEADER_BLOCK_END = 6;
    this.WAITING_BODY = 7;

    this.current = this.WAITING_STATUS_LINE;
    this.statusLine = "";
    this.headers = {};
    this.headerName = "";
    this.headerValue = "";
    this.bodyParser = null;
  }

  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished;
  }

  get response() {
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
    return {
      statusCode: RegExp.$1,
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.content.join('')
    }
  }

  receive(string) {
    for (let i = 0; i < string.length; i++) {
      this.receiveChar(string.charAt(i));
    }
  }
  receiveChar(char) {
    if (this.current === this.WAITING_STATUS_LINE) {
      if (char === "\r") {
        this.current = this.WAITING_STATUS_LINE_END;
      } else if (char === '\n') {
        this.current = this.WAITING_HEADER_NAME;
      } else {
        this.statusLine += char;
      }
    }
    else if (this.current === this.WAITING_STATUS_LINE_END) {
      if (char === '\n') {
        this.current = this.WAITING_HEADER_NAME;
      }
    }
    else if (this.current === this.WAITING_HEADER_NAME) {
      if (char === '\r') {
        this.current = this.WAITING_HEADER_BLOCK_END;
      }
      else if (char === ":") {
        this.current = this.WAITING_HEADER_SPACE;
      } else {
        this.headerName += char;
      }
    }
    else if (this.current === this.WAITING_HEADER_SPACE) {
      if (char === ' ') {
        this.current = this.WAITING_HEADER_VALUE;
      }
    }
    else if (this.current === this.WAITING_HEADER_VALUE) {
      if (char === "\r") {
        this.current = this.WAITING_HEADER_LINE_END;
        this.headers[this.headerName] = this.headerValue;
        this.headerName = "";
        this.headerValue = "";
      } else {
        this.headerValue += char;
      }
    }
    else if (this.current === this.WAITING_HEADER_LINE_END) {
      if (char === '\n') {
        this.current = this.WAITING_HEADER_NAME;
      }
    }
    else if (this.current === this.WAITING_HEADER_BLOCK_END) {
      if (char === '\n') {
        this.current = this.WAITING_BODY;
        if (this.headers['Transfer-Encoding'] === 'chunked') {
          this.bodyParser = new ChunkedBodyParser();
        }
      }
    }
    else if (this.current === this.WAITING_BODY) {
      this.bodyParser.receiveChar(char);
    }
  }
}

/**
 * 解析 chunked分块返回的body体 
 * chunked-body = *chunk   
                  last-chunk
                  trailer-part
                  CRLF
    chunk = chunk-size [chunk-ext] CRLF chunk-data CRLF
        chunk-size -- 1*HEXDIG : 注意这里是16进制而不是10进制
        chunk-data -- 1*OCTET   : 1个或多个十六进制数据
    last-chunk = 1*("0") [chunk-ext] CRLF
    trailer-part = *(header-filed CRLF)  : 0个或多个头部字段
 */
class ChunkedBodyParser {
  constructor() {
    this.CHUNK_SIZE = 0;
    this.CHUNK_SIZE_LINE = 1;
    this.CHUNK_DATA = 2;
    this.CHUNK_DATA_LINE = 3;
    this.CHUNK_DATA_LINE_END = 4;
    this.CHUNK_DATA_BLOCK_END = 5;
    this.LAST_CHUNK_DATA = 6;

    this.size = 0;
    this.content = [];
    this.isFinished = false;
    this.current = this.CHUNK_SIZE;
  }
  receiveChar(char) {
    if (this.current === this.CHUNK_SIZE) {
      //通过判断字符是否为'0'判断是 chunk 还是 lastchunk 
      if (char === '0') {
        this.current = this.LAST_CHUNK_DATA;
        this.isFinished = true;
      } else if (char === '\r') {
        this.current = this.CHUNK_SIZE_LINE;
      } else {
        //size 为十六进制数而不是十进制
        this.size *= 16;
        this.size += parseInt(char, 16);
      }
    } else if (this.current === this.CHUNK_SIZE_LINE) {
      if (char === '\n') {
        this.current = this.CHUNK_DATA;
      }
    } else if (this.current === this.CHUNK_DATA) {
      this.content.push(char);
      //判断字符所占字节数
      let charCode = char.charCodeAt();
      let byteNum = 1;
      if (charCode <= 0x007F) {  //占一个字节
        byteNum = 1;
      } else if (charCode <= 0x07FF) { //占两个字节
        byteNum = 2;
      } else if (charCode <= 0xFFFF) { //占三个个字节
        byteNum = 3;
      } else if (charCode <= 0x10FFFF) {
        byteNum = 4;
      }
      this.size -= byteNum;  //减去字符长度
      if (this.size === 0) {
        this.current = this.CHUNK_DATA_BLOCK_END;
      }
    } else if (this.current === this.CHUNK_DATA_BLOCK_END) {
      if (char === '\n') {
        this.current = this.CHUNK_SIZE;
      }
    }
  }
}

void async function () {
  let request = new Request({
    method: 'POST',
    host: '127.0.0.1',
    port: '8088',
    path: '/',
    headers: {
      ["x-Foo2"]: "customed"
    },
    body: {
      name: 'zhangkuo'
    }
  });
  console.log(request.toString());
  let response = await request.send();
  console.log(response);
}();