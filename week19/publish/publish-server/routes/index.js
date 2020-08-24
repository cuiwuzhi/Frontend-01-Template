var express = require('express');
var router = express.Router();
const fs = require('fs');



/* GET home page. */
router.post('/', function(request, res, next) {
  console.log(request)
  let body = [];
  request.on('data', (chunk) => {
      body.push(chunk);
  }).on('end', () => {
      body = Buffer.concat(body).toString();
      console.log(boy)
      // at this point, `body` has the entire request body stored in it as a string
  });
  fs.writeFileSync("../server/public/"+request.query.filename, request.body.content)
  // res.render('index', { title: 'Express' });
  res.send('hey')
  res.end()
});

module.exports = router;
