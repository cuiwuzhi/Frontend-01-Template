const http = require('http');
const https = require('https');
const unzipper = require('unzipper');
const { join } = require('path');

const server = http.createServer((req, res) => {
  if(req.url.match(/^\/auth/)){//'/auth?code=ca67f99da93a0b86dfb5'
    return auth(req,res)
  }
  if(!req.url.match(/^\/?/)){//Redirect favicon
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
    return
  }
  
  const options = {
    hostname: 'api.github.com',
    port: 443,
    path: `/user`,
    method: 'GET',
    headers:{
      Authorization:`token ${req.headers.token}`,
      'User-Agent':'toy-publish-server'
    }
  }
  const request = https.request(options,(response)=>{
    let body = ""
    response.on('data',(d)=>{
      //result will be chunks
      body += d.toString()
    })  
    response.on('end',()=>{
      let user = JSON.parse(body)
      console.log(user)
      //此处应该进行权限检查，检查user是否有权限可以发布
        let writeStream = unzipper.Extract({ path: '../server/public' })
        req.pipe( writeStream)
        req.on('end',()=>{
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('okay');
        })

    })  
  });
  request.on('error',e=>{
    console.error(e)
  })
  request.end()
})

function auth(req,res){
  let code = req.url.match(/code=([^&]+)/)[1]
  let state = "123abc"
  let client_id = "Iv1.b2a9a2149bf510c6"
  let client_secret = "13a2f5992d5c0107d7b1e8c123a9e31d42be7342"

  let redirect_uri = encodeURIComponent("http://localhost:8081/auth")

  let params = `code=${code}&state=${state}&client_secret=${client_secret}&client_id=${client_id}&redirect_uri=${redirect_uri}`

  const options = {
    hostname: 'github.com',
    port: 443,
    path: `/login/oauth/access_token?${params}`,
    method: 'POST',
  }
  const request = https.request(options,(response)=>{
    response.on('data',(d)=>{
      //regExp accesstoken
      //access_token=f3f7bd7dc3d6ba6f2e0fa40ab9ca49e9f9fdd41f&expires_in=28800&refresh_token=r1.e48f8e866a8fb47bf0a0849319aedbd8ab8fdefadc6365ca349a95daf2beef743157968001d5bd93&refresh_token_expires_in=15893999&scope=&token_type=bearer
      let result = d.toString().match(/access_token=([^&]+)/)
      if(result){
        let token =result[1]
        res.writeHead(200, { 
          'access_token':token,
          'Content-Type': 'text/html' });
          
        //实际并不需要一定要有个可点击的publish
        res.end(`<a href="http://localhost:8080/publish?token=${token}">publish</a>`);  
      }else{
        res.writeHead(200, { 
          'Content-Type': 'text/plain' });
        res.end('error')
      }
    })  
  });
  request.on('error',e=>{
    console.error(e)
  })
  request.end()
}

server.listen(8081)

