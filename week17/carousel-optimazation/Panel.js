import {create,Text,Wrapper} from './createElement'
export class Panel{
    constructor(){
        this.children = []
    }
    
    setAttribute(name,value){//也可以用setAttribute/getAttribute去获取data：in constructor this.attributes = new Map() this.properties = new Map()
        this[name] = value
    }

    appendChild(child){
       this.children.push(child)
    }
    
    mountTo(parent){
        console.log(this)
        this.render().mountTo(parent)
    }
    //如何给每个children里面套一个容器？
    render(){
        return <div class="panel" style="border:1px solid lightgreen;width:300px"> 
            <h1 style="background-color:lightgreen;width:300px;margin:0;">{this.title}</h1>
            <div style="width:300px;min-height:300px">
                {this.children}
            </div>
        </div>
     }
}