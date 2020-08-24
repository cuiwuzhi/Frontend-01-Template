let css = require('css')
module.exports = function(source,map){
   var styleSheet = css.parse(source)
   let name = this.resourcePath.match(/([^/]+).css$/)[1]

   for (const rule of styleSheet.stylesheet.rules) {
       //把每个rule的seletor强制的替换掉
       rule.selectors = rule.selectors.map(selector=>{
          return  selector.match(new RegExp(`^.${name}`)) ? selector :`.${name} ${selector}`
       })
   }
   // console.log(css.stringify(styleSheet),typeof css.stringify(styleSheet))
   return `let style = document.createElement("style");
   style.innerHTML=${JSON.stringify(css.stringify(styleSheet))};
   document.documentElement.appendChild(style)`
}