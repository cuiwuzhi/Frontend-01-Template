var parser = require('./parser')
module.exports = function(source,map){
    //得到parse之后的tag树
    let tree = parser.parseHTML(source)
    //console.log(tree.children[1].children[0].content)
    //生成组件的代码
    let template = null,script = null;
    for (const node of tree.children) {
        if(node.tagName==="template"){//把template变成template的唯一一个child：不然挂上去的element还有template标签
            template = node.children.filter(child=>child.type!=='text')[0]
        }
        if(node.tagName==="script"){
            script = node
        }
        //后面可以再找出css的代码
    }
    //把template转换成create
    let visit = (node)=>{
        //处理文本节点
        if(node.type === "text"){//因为要转换成js代码，因此stringify文本节点的内容
            return JSON.stringify(node.content)
        }
        //生成节点的代码
        let attrs = {}
        if(node.attributes){
            for (const att of node.attributes) {
                if(att.name === 'attr'){
                    attrs[att.value.attrName] = att.value.attrValue
                }
            }
        }
        
        //递归的查询template的子节点
        let children = (node.children || []).map(childNode=>visit(childNode))
        return  `create("${node.tagName}",${JSON.stringify(attrs)},${children})`//children 需要用逗号分隔，所以children是个map就可以
    }
   
    
   return `
import {create,Text,Wrapper} from './createElement'; 
export class Carousel{
    constructor(){
        this.children = []
    }
    setAttribute(name,value){
        this[name] = value
    }
    appendChild(child){
        this.children.push(child)
    }
    render(){
        return ${visit(template)}
    }
    mountTo(parent){
        this.render().mountTo(parent)
    }
}`
}