const http = require('http');
const fs = require('fs');
const net = require('net');
const unzipper = require('unzipper');

// Create an HTTP tunneling proxy
const server = http.createServer((req, res) => {
  console.log(req)

  // let matched = req.url.match(/filename=([^&]+)/)
  // let filename = matched && matched[1]
  // console.log(filename)
  // if(!filename){
  //   return
  // }
  let writeStream = unzipper.Extract({ path: '../server/public' })
 // let writeStream = fs.createWriteStream("../server/public/"+filename)
  req.pipe( writeStream)
  //pipe等效于
  // req.on('data',chrunk=>{
  //   writeStream.write(chrunk)
  // })
  // req.on('end',chrunk=>{
  //   writeStream.end(chrunk)
  // })
  req.on('end',()=>{
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('okay');
  })

})
server.listen(8081)
// server.listen(8081, 'localhost', () => {

//   // make a request
//   const options = {
//     port: 1337,
//     host: '127.0.0.1',
//     headers: {
//       'Connection': 'Upgrade',
//       'Upgrade': 'websocket'
//     }
//   };

//   const req = http.request(options);
//   req.end();

//   req.on('upgrade', (res, socket, upgradeHead) => {
//     console.log('got upgraded!');
//     socket.end();
//     process.exit(0);
//   });
// });