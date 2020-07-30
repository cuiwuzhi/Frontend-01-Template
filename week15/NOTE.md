# 组件化 ： 实现 一个single file component 的webpack loader
## loader目标：将sfc文件转换成js文件，即将sfc转换成js class共其他文件使用
## loader的参数:接受source(源sfc的代码文本)，返回js class代码文本
## loader的实现：
### parser： 类似html的parser（树型结构）
- 注意：在script标签中的i<10这样的小于号，不再是html标签，因此需要区分。解决办法是，当时用html parser时，在script标签里面。只寻找\</script>。参照：https://html.spec.whatwg.org/multipage/parsing.html#script-data-less-than-sign-state
- 改造html parser的script标签处理，当前element标签是script时，切换到script标签检测，以免在script标签中写小于号时，触发html parser的情况。
### loader的完善：
- 处理css
- 处理script中的内容
### 用parser之后的node tree，生成组件的代码
- 其实就是将node tree转化成可以被main.js识别的carousel class
- 重点是render函数：
  - 循环遍历template的node child，收集node的attribute和children，作为createEelement的传参```export function create(Cls,attributes,...children){）```


> laoder的处理流程： loader实现对.view文件的js转换，由babel loader处理js代码中import export的东西，然后全部交给webpack去处理代码

> 组件可以有3种关系来实现复用：
- 基于树形结构的父子关系
- render函数中的组合使用
- 组件的继承
> createElement函数实现的重点包括：
- 怎么定义atribute和property的关系
- 对原有html组件的包装
- 组件的状态管理
- 组件的更新(mountTo知道什么时候更新，需要用到range。可能还需要用到虚拟dom的处理)

> 一个组件体系中，不同的组件之间怎么分类，也是更大层面需要考虑的问题

组件化的实现有sfc,jsx，wpf（很全面：https://docs.microsoft.com/en-us/dotnet/api/system.windows.uielement?view=netcore-3.1）等

### 动画
> 如何停止css动画？(see ./cssAnimationDemo)
> - 改transition：transition="none";但是元素并没有停在当前位置，而是直接停在了当前动画结束的尾部
> - 需要得到元素当前的位置getBoundingClientRect
> - css动画并不总是可控，因此可以考虑用js实现动画

- 最重要的两类动画：
  - timeline
  - animation
- 用户如何使用动画？
- 考虑用户如何使用动画？
  - 属性动画
    ```
    let animation = new Animation(object,property,start,end,duration,delay,timingFucntion)
    let animation2 = new Animation(object2,property2,start,end,duration,delay,timingFucntion)

    animation.start()
    animation2.start()

    animation.stop()

    animation.pause()
    animation.resume()
    ```
- 如果有两个animation，想去同时控制它们的start和stop的话，需要把多个animation进行编排，两个animation之间可能会有时间差，因此多个animation 吗时候，仅用一个animation class是不方便管理的，而当用到settimeout/setinreval/requestanimationframe(动画至少需要使用其一)，在触发这些函数的时候，会损耗性能，不方便进行管理。最好是每一帧只调用一个函数，节约性能。解决方案：
    ```
    let timeline = new Timeline(); 
    timeline.add(animation); 
    timeline.add(animation2)```

- 然后start换成timeline去操作:
  ```
    timeline.start();
    timeline.stop()
    timeline.pause()
    timeline.resume()```
  
- 这样就可以把animation所有的特性集成到timneline里，timeline也是多个动画的编排的工具。统一操作一个timeline里面所有的动画。做游戏的时候，可以控制多个时间线

> transform 不会触发重排
 
