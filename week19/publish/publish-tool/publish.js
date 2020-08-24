const http = require('http');
const fs = require('fs');
const querystring = require('querystring')
var archiver = require('archiver');

let packagename = './package'
// fs.stat(packagename,(error,stat)=>{
    const options = {
      host: 'localhost',
      port: 8081,
      path: '/?filename=package.zip',
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
     //   'Content-Length': stat.size
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
      // res.setEncoding('utf8');
      // res.on('data', (chunk) => {
      //   console.log(`BODY: ${chunk}`);
      // });
      // res.on('end', () => {
      //   console.log('No more data in response.');
      // });
    });
    
    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
    });
    archive.pipe(req)

    // let readStream = fs.createReadStream('./'+packagename)
    // // req.write(postData);
    // readStream.pipe(req)
    archive.on('end',()=>{
      req.end();
    })
    
    // // Write data to request body
    // let readStream = fs.createReadStream('./'+packagename)
    // // req.write(postData);
    // readStream.pipe(req)
    // readStream.on('end',()=>{
    //   req.end();
    // })
// })
