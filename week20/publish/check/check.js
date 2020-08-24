var page = require('webpage').create();
page.open('http://localhost:8080/', function(status) {
  if(status === "success") {
      var body = page.evaluate(function() {
          var toString = function(pad,element){
                var children = element.childNodes
                var childrenString = ''
                for (var i = 0; i < children.length; i++) {
                    childrenString+=toString("    "+ pad,children[i]) + '\n'
                }
                var name = element.tagName || '#text: ' + JSON.stringify(element.textContent)
                return pad + name + (children.length > 0 ? '\n'+ childrenString :'') 
            }
            return toString('',document.body);
      });
      console.log(body);
  }
  phantom.exit();
});