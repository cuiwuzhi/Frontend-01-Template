const net = require("net");
const parser = require("./parser.js")
const render = require("./render.js")
const images = require("images")

class Request{
    //method url = host + +port + path
    //body k/r  
    //content-Type有四种方式
    constructor(options){
      this.method = options.method || "GET";
      this.host = options.host;
      this.port = options.port || '80';
      this.path = options.path || '/';
      this.body = options.body || {};
      this.headers = options.headers || {};
      // 设置默认的Content-Type
      if(!this.headers["Content-Type"]){
        this.headers["Content-Type"] = "application/x-www-form-urlencoded";
      }

      if(this.headers["Content-Type"] === "application/json"){
        this.bodyText = JSON.stringify(this.body)
      }else if(this.headers["Content-Type"] === "application/x-www-form-urlencoded"){
        this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
      }

      this.headers["Content-Length"] = this.bodyText.length;
    }

    toString(){
      return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}
\r
${this.bodyText}`
    }

    send(connection) {
      return new Promise((resolve, reject)=>{
        const parser = new ResponseParser();

        if(connection){
          connection.write(this.toString());
        } else {
          connection = net.createConnection({
            host:this.host,
            port:this.port
          }, () =>{
            connection.write(this.toString())
          })
        }

        //不知道data是不是一个完整的Response
        connection.on('data', (data) => {
          parser.receive(data.toString())
          // console.log(parser.statusLine)
          // console.log(parser.headers)
          if(parser.isFinished){
            // console.log(parser.Response)
            resolve(parser.Response)
          }
          // resolve(data.toString());
          connection.end();
        });

        connection.on('error', (err) => {
          reject(err);
          connection.end()
        });

      })
    }
}

class Response{

}

class ResponseParser{
  //状态机实现Buffer
  constructor(){
    this.WAITING_STATUS_LINE = 0;
    this.WAITING_STATUS_LINE_END = 1;  //status-line结束状态标识
    this.WAITING_HEADR_NAME = 2;
    this.WAITING_HEADR_SPACE = 3;
    this.WAITING_HEADR_VALUE = 4;
    this.WAITING_HEADR_LINE_END = 5;
    this.WAITING_HEADR_BLOCK_END = 6;
    this.WAITING_BODY = 7;

    this.current = this.WAITING_STATUS_LINE; //当前状态
    this.statusLine = "";
    this.headers = {};
    this.headerName = "";
    this.headerValue = "";
    this.bodyParser = null;

  }
  get isFinished(){
      return this.bodyParser && this.bodyParser.isFinished
  }

  get Response(){
      this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)
      return {
          statusCode:RegExp.$1,
          statusText:RegExp.$2,
          headers:this.headers,
          body:this.bodyParser.conetent.join('')
      }
  }

  receive(string){
    // console.log(string)
      for(let i = 0;i < string.length; i++){
          this.receiveChar(string.charAt(i))
      }
  }

  // 每次进来一个字符
  receiveChar(char){
    // console.log(JSON.stringify(char))
    
      if(this.current === this.WAITING_STATUS_LINE){

          if(char === "\r"){
              this.current = this.WAITING_STATUS_LINE_END
          }
          // 这一个判断要不要？
          else if(char === "\n"){
            this.current = this.WAITING_HEADR_NAME
          }
          else{
              this.statusLine += char
              // console.log(this.statusLine) // HTTP/1.1 200 OK
          }
      }

      else if(this.current === this.WAITING_STATUS_LINE_END){
          if(char === "\n"){
              this.current = this.WAITING_HEADR_NAME
          }
      }

      else if(this.current === this.WAITING_HEADR_NAME){
        //headName以冒号结束
          if(char === ":"){
              this.current = this.WAITING_HEADR_SPACE;
          }else if(char === '\r') {
            //WAITING_HEADR_BLOCK_END 要吃掉一个\n
            //header 结束了
            this.current = this.WAITING_HEADR_BLOCK_END;

            if(this.headers['Transfer-Encoding'] === 'chunked'){
              // header结束 body开始
              this.bodyParser = new TrunkedBodyParser();
            }

          }else {
            this.headerName += char;
            // console.log(this.headerName)
          }
      }

      else if(this.current === this.WAITING_HEADR_SPACE){
          if(char === " "){
              this.current = this.WAITING_HEADR_VALUE;
          }
      }

      else if(this.current === this.WAITING_HEADR_VALUE){
          if(char === "\r"){
              this.current = this.WAITING_HEADR_LINE_END;
              //head是有多行的
              this.headers[this.headerName] =  this.headerValue
              this.headerName = "";
              this.headerValue = "";
          }else{
              this.headerValue += char;
              // console.log(this.headerValue)
          }
      }

      else if(this.current === this.WAITING_HEADR_LINE_END){
          if(char === "\n"){
            //循环  进入到header的下一行
            this.current = this.WAITING_HEADR_NAME;
          }
      }

      else if(this.current === this.WAITING_HEADR_BLOCK_END){
        if(char === "\n"){
            this.current = this.WAITING_BODY;
        }
      }

      else if(this.current = this.WAITING_BODY){
        // console.log(this.bodyParser)
        this.bodyParser.receiveChar(char);
      }
  }
}

class TrunkedBodyParser {
  constructor(){
      this.WAITING_LENGTH = 0
      this.WAITING_LENGTH_LINE_END = 1;
      this.READING_TRUNK = 2;
      this.WAITING_NEW_LINE = 3;
      this.WAITING_NEW_LINE_END = 4;

      // 表示剩下的字符长度
      this.length = 0;
      this.conetent = []
      this.isFinished = false;
      this.current = this.WAITING_LENGTH

  }

  receiveChar(char){
      // console.log(JSON.stringify(char))
      // console.log(this.current)
      if(this.current === this.WAITING_LENGTH){
          if(char === '\r') {
              
            // 结束
              if( this.length === 0){
                  // console.log('//////////isFinished//////////')
                  this.isFinished = true
              }
              // 获取到了长度，进入下一个状态
              this.current = this.WAITING_LENGTH_LINE_END;
          }else {
              //1a 十六进制
              this.length *= 16;
              if(char.charCodeAt(0) > 96 && char.charCodeAt(0) < 103){
                this.length += char.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
              } else if(char.charCodeAt(0) > 64 && char.charCodeAt(0) < 71){
                this.length += char.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
              }else{
                this.length += char.charCodeAt(0) - '0'.charCodeAt(0);
              }
          }
      }

      else  if(this.current === this.WAITING_LENGTH_LINE_END){
          if(char === '\n') {
              this.current = this.READING_TRUNK;
          }
      }

      
      else  if(this.current === this.READING_TRUNK){
              if(this.length > 0){
                this.conetent.push(char)
                this.length --;
              }
              if(this.length === 0) {
                  // console.log(this.conetent)
                  this.current = this.WAITING_NEW_LINE
              }
      }

      else  if(this.current === this.WAITING_NEW_LINE){
          if(char === '\r') {
              this.current = this.WAITING_NEW_LINE_END
          }
      }

      else  if(this.current = this.WAITING_NEW_LINE_END){
        if(char === '\n') {
          // 循环
            this.current = this.WAITING_LENGTH
        }
      }
  }
}

void async function(){

  let request = new Request({
    method:"POST",
    host:'127.0.0.1',
    port:'8088',
    path:"/",
    headers:{
      ["X-Foo2"]:"customed"
    },
    body:{
      name:"zhangying"
    }
  })
  // console.log(request.toString())
  let response = await request.send()
  // console.log(response)
  let dom = parser.parseHTML(response.body)
  // console.log(dom)

  var viewport = images(800,600);
  render(viewport, dom);

  viewport.save("viewport.jpg")
  
}();