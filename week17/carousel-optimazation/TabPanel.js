import {create,Text,Wrapper} from './createElement'
export class TabPanel{
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

    select(i){//select方法记录选中的child
        for (const view of this.childViews) {
            view.style.display = "none"
        }
        this.childViews[i].style.display = ""//致空采用默认display，这样css也能生效

        for (const view of this.titleViews) {
            view.classList.remove('selected')
        }
        this.titleViews[i].classList.add('selected')
    }
    
    mountTo(parent){
        this.render().mountTo(parent)
    }
    //如何给每个children里面套一个容器？this.children.map返回一个jsx
    render(){
        //给一个默认的选择
        setTimeout(()=>this.select(0),16)
        this.childViews = this.children.map(child=><div style="width:300px;min-height:300px">{child}</div>)
        this.titleViews = this.children.map((child,i)=><span onClick={()=>this.select(i)} 
            style="width:300px;min-height:300px;margin:5px 5px 0 5px;font-size:25px;cursor: pointer;text-transform: capitalize;">{child.getAttribute('title')}</span>)
        return <div class="tab-panel" style="width:300px"> 
            <h1 style="color:green;width:300px;margin:0;">{this.titleViews}</h1>
            <div style="border:1px solid lightgreen;">
                {this.childViews}
            </div>
        </div>
     }
}