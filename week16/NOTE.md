> 组件系统的基石：动画 | 手势

# 手势
#### touchEvent VS mouseEvent
- touchEvent 没有像mouseevent在事件上的x/y，而是在touchlist(可能有多个touch)，其中的每个touch object上
- touchevent和mouseevent有不同的抽象，要对他们合理的统一抽象，才能使得组件同时支持touch和mouse，不至于产生touch的场景下同时触发了mouse事件等的bug
- 给组件写手势库来区分touch和mouse
- 手机的系统手势可以关闭的，保护组件的手势不被识别成系统手势而造成退出app
- 多指手势会产生transform，rotate，scale
- 比较有名的手势库hammerJS

## 实现手势库
### 抽象touch/mouse事件：统一监听touch/mouse事件
- 鼠标如何监听事件?
    ``` let elememnt = document.body
    elememnt.addEventListener("mousedown",(event)=>{
        start(event)
        let mousemove = event=>{
            move(event)
        }
        let mouseend = event=>{
            end(event)
            document.removeEventListener("mousemove",mousemove)
            document.removeEventListener("mouseup",mouseend)
        }
        document.addEventListener("mousemove",mousemove)
        document.addEventListener("mouseup",mouseend)
    })```
- touch如何监听？
  - touch事件不需要像mouseevent那样在document上监听的，touch在哪个上启动，就会在哪个上面触发，天然的目标锁定
  - touchstart和touchmove中的event.changedTouches[0]未必是同一个元素，changedTouches中的identifier就是用来区分的
  - touchcancel（如中途突然有个弹窗/事件,或者手势被识别成了系统手势，因此实现的时候要考虑touchcancel被触发的情况，要为每种手势设计cancel的情况下会产生什么样的效果）和touchend只会触发其中一个
    ```elememnt.addEventListener("touchstart",event=>{
        for (const touch of event.changedTouches) {//changedTouches是数组：可能触发多指操作
            start(touch)
            }
        })

        elememnt.addEventListener("touchmove",event=>{
            for (const touch of event.changedTouches) {
                move(touch)
            }
        })

        elememnt.addEventListener("touchend",event=>{
            for (const touch of event.changedTouches) {
                end(touch)
            }
        })

        elememnt.addEventListener("touchcancel",event=>{
            for (const touch of event.changedTouches) {
                cancel(touch)
            }
        })```
- 合并mouse和touch的抽象：对start/move/end的行为做抽象
    ```let start = (point)=>{
        console.log('start',point.clientX,point.clientY)
    }
    let move = (point)=>{
        console.log('move',point.clientX,point.clientY)
    }
    let end = (point)=>{
        console.log('end',point.clientX,point.clientY)
    }
    let cancel = (point)=>{
        console.log('cancel')
    }```
- 完备的手势库还需要考虑：mousedown的时候区别下左右键，pointerEvent也要考虑（实现了pointerEvent的设备商是不需要监听鼠标和touch事件的）
### 判断4种手势 ：tap/pan(panstart/panmove/panend)/flick/press(pressstart/pressend)
-  4种手势的关系
   -  start之后很快的end：tap事件
   -  start之后过了几秒：pressstart - 移动10px（一般业界用的数字，但还是需要用dpr去算一下） ： panstart
   -  start之后过了几秒：pressstart - end ： pressend
   -  start之后移动了如10px：panstart
   -  panstart - move :panmove - move ：panmove -end ：panend
   -  panstart - move :panmove - move ：panmove -end且速度>XX ：panend + flick
   -  flick是panend的一个变形，有可能是和panend一起同时触发
- 处理不同的start和move之间的关系-context：为了算出移动距离起点的距离，需要在start时候存储起点，因为start要处理touch和mouse两类事件，且可能被触发多次start，所以不能仅从传入的point去存储起点，而应该同时传入point来自的context，在start事件被触发时，把它的context传入全局的contexts对象中
- 在context中设置事件标志存储isTap/isPan/isPress
- 考虑双击事件的话需要延迟tap才知道是不是双击，因为第一次触发的时候一定会识别成tap。tap/singletap/doubletap来识别双击
- Listener还可以加入考虑gesture库的用户自定义的逻辑，如是否capture或者是否passive等
- flick事件跟速度有关，有两种可能：快速的扫动，或者press时候，在end的时候已很快的速度扫出，看自己要不要处理后者。现在在pan之后去处理flick逻辑，看end之前300ms内的速度有多快，大于2.5就认为是触发了flick事件，不然就是pan/press。
- 2.5这个速度可根据具体情况/用研数据去做调整

### 事件派发
> 模仿成一个dom事件去派发:https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
> listner/recorgnaizer/dispatcher 可以考虑分开，做用户自动移

### 手势应用：练习将手势库应用到carousel组件
1. 思考：什么时候stop carousel的animation？gesture start的时候；stop animation的时候，还要清除nextpic settimeout的id
2. 处理拖拽的逻辑