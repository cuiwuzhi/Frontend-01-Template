export class Timeline{
    constructor(){
        this.animations = new Set()//用set性能更好
        this.addTimes = new Map()
        this.finishedAnimations = new Set()
        this.requestID = null
        this.state = 'inited'
        //把tich放在constructor里面，能使用剪头函数，this就被保证下来了，写在外面this就取决于调用天它的obj
        //且cancelrequestanimation的时候也是传入同样函数实现cancel
        this.tick = ()=>{//每一帧执行的函数用tick来实现
            let t =  Date.now() - this.startTime 
            //for循环换所有的animation
            for (const animation of this.animations) {
                let {object,property,template,start,end,delay,timingFunction,duration} = animation
                let addTime = this.addTimes.get(animation)
                let progression = timingFunction((t - delay - addTime)/duration)//-01之间的数，代表当前进展的百分比

                if(t < delay + addTime){//还没到时间
                    continue
                }
                if(t > duration + delay + addTime){
                    //fix在动画终点位置与实际传入的end位置不统一的情况：强制将progress = 1
                    progression = 1
                    this.animations.delete(animation)
                    this.finishedAnimations.add(animation)
                }
                
                let value = animation.valueFromProgression(progression)
                object[property] = template(value) //value算出来的是数字，但是属性经常是字符串，因此需要template来做转换
            }
            
            if(this.animations.size){
                this.requestID = requestAnimationFrame(this.tick)
            }else{
                this.requestID = null
            }
        }

    }
  
    start(){
        if(this.state!== 'inited'){
            return
        }
        this.state = 'playing'
        this.startTime = Date.now()
        this.tick()
    }
    pause(){
        if(this.state!== 'playing'){
            return
        }
        this.state = 'paused'
        this.pauseTime = Date.now()//记住pause的当前时间，才能在后面实现resume
        //取消掉下一个tich
        if(this.requestID!== null){
            cancelAnimationFrame(this.requestID)
            this.requestID = null
        }
    }

    resume(){//此时多次点击resume就会出错，因此需要用state去管理
        if(this.state!== 'paused'){
            return
        }
        this.state = 'playing'
        this.startTime += Date.now() - this.pauseTime//重新设置startTime
        this.tick()
    }

    reset(){//清零全部变量
        if(this.state === 'playing'){
            this.pause()
        }
        this.animations = new Set()
        this.addTimes = new Map()
        this.finishedAnimations = new Set()
        this.requestID = null
        this.startTime = Date.now()
        this.pauseTime = null
        this.state = 'inited'
    }

    restart(){//把finished的animation保存起来（同时addTimes这时候也没必要清空了）
        if(this.state === 'playing'){
            this.pause()
        }
        console.log(this.finishedAnimations)
        for (const animation of this.finishedAnimations) {
            this.animations.add(animation)
        }
        this.finishedAnimations = new Set()
        this.requestID = null
        this.state = 'playing'
        this.startTime = Date.now()
        this.pauseTime = null
        this.tick()
    }

    //希望可以在任何时刻可以在同样一个timeline里面开启多个animation
    add(animation,addTime){//加animation的时候需要知道这个animation是从多长时间之后开始执行，还是从0（马上）开始
        this.animations.add(animation)
        //Fixed:如果timeline.start的时候没有animation，就取消了timeline了，后面在加上的时候就失效了:因此add的时候没有启动动画的时候，就tick起来
        if(this.state === 'playing'&& this.requestID == null){
            this.tick()
        }
        if(this.state === 'playing'){
            this.addTimes.set(animation,addTime !== void 0 ? addTime : Date.now() - this.startTime)//addTime是个时间段(也与progress动画的进程有关的)，要么是从加入进来立即执行，要么是传入个addTime，注意与deley的区分，deley是在每个animation自己身上的，自己决定
        }else{
            this.addTimes.set(animation,addTime !== void 0 ? addTime : 0)
        }
    }

    //一个timeline里面的相对时间都是一样的，这是tiemline的一个重要意义
}

export class Animation{
    constructor(object,property,start,end,duration,delay,timingFunction,template){//template属性值的转换函数
        this.object = object;
        this.template = template
        this.property = property;
        this.start = start;
        this.end = end;
        this.duration = duration;
        this.delay = delay || 0;
        //(有start和end参与的函数)跟当前时间相关，如ease,linear,easeIn,easeOut
        this.timingFunction = timingFunction;
    }
    //具备修改颜色的能力
    valueFromProgression(progression){//将value的计算逻辑移入anmation类来
        return  this.start + progression * (this.end-this.start)
    }
}

export class ColorAnimation{//这时候start/end可能是个rgb的值
    constructor(object,property,start,end,duration,delay,timingFunction,template){//template一般并非必须穿
        this.object = object;
        this.template = template || ((v)=>`rgba(${v.r},${v.g},${v.b},${v.a})`)
        this.property = property;
        this.start = start;
        this.end = end;
        this.duration = duration;
        this.delay = delay || 0;
        //(有start和end参与的函数)跟当前时间相关，如ease,linear,easeIn,easeOut
        this.timingFunction = timingFunction;
    }
    //具备修改颜色的能力
    valueFromProgression(progression){
        return {
            r:this.start.r + progression * (this.end.r - this.start.r),
            g:this.start.g + progression * (this.end.g - this.start.g),
            b:this.start.b + progression * (this.end.b - this.start.b),
            a:this.start.a + progression * (this.end.a -this.start.a)
        }
    }

}
//拓展：编写别的animation类型时候，就像类似colorAnimation这样去重写valueFromProgression即可
//还可以给animation类加上速度属性（2倍速播放等），播放方向（正向反向等）

/*
考虑用户如何使用动画？
属性动画
let animation = new Animation(object,property,start,end,duration,delay,timingFucntion)
let animation2 = new Animation(object2,property2,start,end,duration,delay,timingFucntion)

animation.start()
animation2.start()

animation.stop()

animation.pause()
animation.resume()

如果有两个animation，想去同时控制它们的start和stop的话，需要把多个animation进行编排，两个animation之间可能会有时间差，因此多个animation 吗时候，仅用一个animation class是不方便管理的，而当用到settimeout/setinreval/requestanimationframe，在触发这些函数的时候，会损耗性能，不方便进行管理。

解决方案：
let timeline = new Timeline()
timeline.add(animation)
timeline.add(animation2)
//然后start换成timeline去操作

timeline.start()
timeline.stop()
timeline.pause()
timeline.resume()
//这样就可以把animation所有的特性集成到timneline里，timeline也是多个动画的编排的工具。统一操作一个timeline里面所有的动画。做游戏的时候，可以控制多个时间线
 */