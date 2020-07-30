import { enableGesture } from './gesture';
export function create(Cls,attributes,...children){
    let o;
    if(typeof Cls === "string"){//小写div会被传入成string
        o = new Wrapper(Cls)
    }else{
        o = new Cls()
    }
    for (const name in attributes) {
        o.setAttribute(name,attributes[name])
    }
    let visit = (children)=>{
        for (const child of children) {
            if(typeof child === 'string'){
                child = new Text(child)
            }else if( typeof child === 'object' && child instanceof Array){
                 visit(child)
                 continue
            }
            o.appendChild(child)
         }
    }

    visit(children)
    
    return o
}

export class Wrapper{
    constructor(type){
        this.children = []
        this.root = document.createElement(type)
    }
    set class(v){//property
        console.log('Parent::class',v)
    }
    set id(v){//property
        console.log('Parent::id',v)
    }
    get style(){
        return this.root.style
    }

    setAttribute(name,value){//attribute
        this.root.setAttribute(name,value)
        if(name.match(/^on([\s\S]+)$/)){//捕获on事件，使得可以加dom事件
            //小写第一个字母
            let eventName = RegExp.$1.replace(/^[\s\S]/,c=>c.toLocaleLowerCase())
            this.addEventListener(eventName,value)
        }
        if(name === "enableGesture"){//因为enableGesture是作用在dom element上的，因此需要改造wrapper，让它可以针对某些特殊的attrs做特殊的处理
            enableGesture(this.root)
        }
    }

    appendChild(child){
        this.children.push(child)
    }
    
    mountTo(parent){
        parent.appendChild(this.root)
       
        //mountTo是生命周期的函数，所以把child挂上去的时候，不发生在appendchild时，而应该是把自己挂上去的时候，再把自己的child挂上去
        for (const child of this.children) {
            child.mountTo(this.root)
        }
    }
    addEventListener(){//type,handler,config
        this.root.addEventListener(...arguments)
    }
}
export class Text{//text 不用回有child/attr/pperos
    constructor(text){
        this.children = []
        this.root = document.createTextNode(text)
    }
    mountTo(parent){
        parent.appendChild(this.root)
    }
}