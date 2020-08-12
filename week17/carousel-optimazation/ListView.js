import {create,Text,Wrapper} from './createElement'
export class ListView{
    constructor(){
        this.children = []
        this.state = Object.create(null)
    }
    
    setAttribute(name,value){//也可以用setAttribute/getAttribute去获取data：in constructor this.attributes = new Map() this.properties = new Map()
        this[name] = value
    }

    getAttribute(name){//也可以用setAttribute/getAttribute去获取data：in constructor this.attributes = new Map() this.properties = new Map()
        return this[name]
    }

    appendChild(child){
       this.children.push(child)
    }
    
    mountTo(parent){
        this.render().mountTo(parent)
    }
    //如何给每个children里面套一个容器？this.children.map返回一个jsx
    render(){
        let data = this.getAttribute('data')
        //直接把children[0]上传入的函数穿进data.map中
        return <div class="list-view" style="width:300px"> 
            {data.map(this.children[0])}
        </div>
     }
}