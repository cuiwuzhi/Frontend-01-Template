const http = require('http');
const fs = require('fs');
const querystring = require('querystring')
const archiver = require('archiver');
const child_process = require('child_process');
const https = require('https');

let packagename = './package'
let redirect_uri = encodeURIComponent("http://localhost:8081/auth")//publish-server 的地址和端口:可以给个id代表publish-ID，实际上应该从request的里面去拿publish id
//一般pubnlish-server需要用内网的url，不是在用户的机器上的，这里使用localhost起了server和tool
child_process.exec(`open https://github.com/login/oauth/authorize?client_id=Iv1.b2a9a2149bf510c6&redirect_uri=${redirect_uri}&scope=read%3Auser&state=123abc`)

const server = http.createServer((request, res) => {
  console.log("real publish!!",request.url)

    let token = request.url.match(/token=([^&]+)/) && request.url.match(/token=([^&]+)/)[1]
    if(!token){//处理/favicon.ico
      return
    }
    const options = {
        host: 'localhost',
        port: 8081,
        path: '/?filename=package.zip',
        method: 'POST',
        headers: {
          'token':token,
          'Content-Type': 'application/octet-stream',
        }
      };

      var archive = archiver('zip', {
          zlib: { level: 9 } // Sets the compression level.
      });
      archive.directory(packagename, false);
    
      archive.finalize();
      const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        
      });
      
      req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
      });
      archive.pipe(req)

      archive.on('end',()=>{
        req.end();
        // console.log('publich success')
        res.end('publich success')
        server.close()
      })
})
server.listen(8080)
