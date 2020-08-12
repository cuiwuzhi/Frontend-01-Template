# Dev Tools
> 命令：
- init
- add:加模块/页面，init工具的一个补充
- dev
- build
- test
- publish

## Server
- build（构建工具）:其实贯穿server和client两个领域；前端很主体的工具，前段工作基本都离不开。webpack（主要在使用的，入口出口都是js） babel（可以独立使用，也可以单独使用，常用三件套） vue jsx postcss
- watch：和build是一体的。fsevent。
- mock：假装有api，跟服务端相关的工作需要用到
- http：ws（这个包比较好的是 直接把本地启动起来变成web server）

### build
- 练习：非webpack环境下的babel是如何compile的：
  - install dependencies：npm install --save-dev @babel/core @babel/cli @babel/preset-env
  - .bablelrc config file，配置preset
  - terminal： bable demo.js
  - 输出transfotmed js，适用于多数浏览器平台

- 练习： 使用vue complier 解析js
  - 安装@vue/compiler-sfc
  - 使用它的compileTemplate方法去解析自己写的一段js代码，得到输出的object
  - https://github.com/vuejs/vue-next/blob/master/packages/compiler-sfc/__tests__/compileTemplate.spec.ts

> 总结： 构建build工具其实是对文本的处理，掌握对http的解析，html的解析，css，js的解析等。有官方工具的如：html parser，css parser，vue compiler，babel tranformer，一般使用中是官方+自研来达到业务需求。

- 练习（非重点）：npm除了当作命令，还可以当做包用:npm install npm
  - folder:npm-demo: npm init
  - npm install npm
  - main.js: 脚本执行webpack的安装
      ```
      const npm = require('npm')
      let config = {
          "name": "npm-demo",
          "version": "1.0.0",
          "description": "",
          "main": "index.js",
          "scripts": {
          "test": "echo \"Error: no test specified\" && exit 1"
          },
          "author": "",
          "license": "ISC",
          "dependencies": {
          "npm": "^6.14.7"
          }
      }
      npm.load(config,(err)=>{
          npm.install('webpack',(err)=>{
              console.log(err)
          })
      })
      console.log(npm)
      ```

### watch
fsevent：监听文件的变化，一般不写工具本身是不需要用到它的。
build了之后，要重新build，就需要完全依赖fsevent的监听处理

> build的时候，字符串处理和事件是两个最重要的底层的依赖；build涉及缓存/依赖关系计算/增量处理，会是一个比较复杂的流程。工具链不需要每个工具都自己写，大多数时候做的是选型，对工具链整体的了解。

### mock
一般跟公司内部api的绑定程度比较高

### http
https://www.npmjs.com/package/ws
ws是很好用的pkg, 配合 webpack-dev-server

## Client
- debugger：vscode devtool。  build的时候需要注意debugger
- source map
- 
### debugger
chrome的调试工具中，inspector（元素/css）/debugger（源码，断点，调试等）有区别
#### 什么是debugger？
思考：vscode中自己写的代码，跑在node的v8上，为什么vscode的代码可以跑在node的v8上（node的debugger tool就是基于v8做的）？
启动node的时候，node就会启动一个websocket：Debugger listening on ws://127.0.0.1:65236/3ad62993-ad00-4c40-a10c-bc5b9583fd6b
这个websocket地址就会被vscode去监听，他们的监听有一个协议

#### 一个debug行为中有两个对象：
- 一方面：node启动了一个debug的server，跟v8在同一个进程中，所以它可以控制v8
- 另一方面： vscode作为一个client跟server以ws互相通讯，他们之间可以传递我们在客户端上打断点，写debugger等这些命令
v8执行到被命令标记过的语句时候，就会在ws发送事件，然后可以终止进程，实现断点

#### debugger的基本的架构：
- server端：有2-3种server：node/browser/electron，每个环境中还有v8和jsc的区别。
- client端：可以在同进程/不同进程中，可以有debugger的client，debugger的client有明显特点:有打断点的能力，调试的界面
这就是一个

#### debugger的协议
思考：chrome dev tools是client还是server？ 
client
webkit里面跑的才是server

 > dev tools 作为一个client，它也有自己的协议，只要server实现了client的这个协议，就可以用dev tools去调试。只要去实现它的debugger的协议就可以了:https://chromedevtools.github.io/devtools-protocol/
 
 > server只要实现了protocal对应的命令，就可以接受dev tool的控制： https://chromedevtools.github.io/devtools-protocol/1-3/Debugger/

以上的协议中：
- client往server传的就是methods
- server往client传的就是event
- 它们互相之间都是用ws去通讯的。也不一定非要是ws也可以是rpc

> 如果像实现一个能让dev tool去调试的一个server，就去实现这些：https://chromedevtools.github.io/devtools-protocol/1-3/Debugger/。 就可以了，把method和event去都实现了就可以了


### source map
并没有形成一个固定的标准
- sourceURL指定源文件
- sourceMappingURL指定source map的文件

之前写的myloader会传入两个参数，第二个参数是map；因此在处理源文件的时候，把map文件也生成好
```
module.exports = function(source,map){
    let tree = parser.parseHTML(source)
}
```
> source map在构建的过程中生成的，在每个步骤都需要生成对应的source map
> webpack这样的工具把每个步骤的sourcemap的文件，自动的合成一个总的sourcemap文件
> webpack中每个loader都会return一个source map，然后webpack最后产出一个总的source map

练习：串联起build和watch工具：实现fsevent检测到当前dir中文件的变化，就执行一次webpack
- 把watcher.js放到dir的子集中，避免产生循环watch： src/watch.js。 让watcher只watch src的范围
- webpack.config
