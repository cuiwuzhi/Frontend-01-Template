# Carousel组件优化
## 添加支持child
> 如何实现tabpanel，将每个child都包裹一个div?:this.children.map返回一个jsx
> optianl作业：将carousel也改造成一个内容性的组件

## 为什么有组件的概念？
> 组件通常代表一个ui的元素，组件的特性properties,methods,inherit(这三个也是对象的特性),attribute代表了声明式编程相关的特性，config带来了全局相关的能力， state体现了组件内部状态的变化，event能从组件接受东西,lifecycle定义组件的方式,children使得能够以树形的结构去描述一个复杂的界面。提供了下一个层次的一组抽象能力，很适用于ui的一种抽象方式
## 组件化的方案到底如何承载，是非常自由的
> 用什么样的方式去承载，可以用不同的语言/方式.如react的hooks用一个函数来把一个组件相关的东西去描述清楚，去掉了properties,methods,inherit这三个相关的东西,properties和attributes是一回事，也没有config，state和event会完全把组件重新render,省了不少事。

## 学习组件系统的理论知识，获得一些设计组件系统的灵感，不用拘泥于react/vue等某种形式之中

## 学习组件系统的用处：可以自己写一个组件系统，当再去看react/vue的时候，不用再去理解一边他们相关的概念，而是了解一个组件系统的终点在哪里，轻松上手一个组件系统的框架

> 我们自己写的组件没有重新render的功能，跟react有很大的区别,react是有event/state变化的时候，马上进行reander，当然操作的是微dom，操作完去做比对，再考虑要不要更新真正的dom。重新render的模式：不需要考虑patch的模式，也不用考虑set/get attribute函数

除了树形的组件，有时候还有列表的需求ListView

## 管理组件的css
> 用cssloader把组件的css用js依赖进来
> css只需要append一次

## 如何封装组件的css，不让它的style污染全局?
> 自定义自己的css-loader;自定义loader，有了parser之后，将carousel的name作为css rule的前缀,不然别的全局变量污染组件的style。自定义laoder不是唯一的scope方案，最好的方案是给每个组件添加root上的attribute。


# 工具链：开发过程中使用到的工具
jenkins
git
webpack
travis
eslint
babel
gulp
create-react-app
umi
gitlab
vscode
mocha
http-server
vue-cli
mock
husky
prettier
axios
yeoman
postman
dva
jest
easymock
swagger
wireshark

工具分类：
- init工具
- develop工具：cli交互工具/版本管理工具/语法矫正工具/scaffold工具
- test工具
- deploy工具：打包工具/cicd工具
> 初始化工具往往决定了后面几类工具的选择

## 练习：如何用yeoman来做一个generator（如create-react-app/ ng create就是个工程的generator）
> yeoman是generator的generator
### yeoman的突出的三种能力
  - 从用户出收集信息的能力
  - npm操作的能力
  - 对文件/template的能力
### yeoman的generator如下是按行执行的：
``` var Generator = require('yeoman-generator');
module.exports = class extends Generator {
    // The name `constructor` is important here
    constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);
  }
  async prompting() {
    this.answers = await this.prompt([{
      type    : 'input',
      name    : 'title',
      message : 'Your project title',
    }]);
  }
  writing() {
    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('public/index.html'),
      { title: this.answers.title } // user answer `title` used
    );
  }
};
```
目前开发脚手架工具，要么用yeoman要么自研
自研怎么做，需要解决以下的问题？
- 输入
- npm：
  - 如何控制terminal的cursor：https://stackoverflow.com/questions/10585683/how-do-you-edit-existing-text-and-move-the-cursor-around-in-the-terminal/10830168
    ```
        var tty = require('tty');
        var ttys = require('ttys');
        var rl = require('readline');

        var stdin = ttys.stdin;
        var stdout = ttys.stdout;

        // stdout.write('hello  world\n');
        // stdout.write('\033[1A');
        // stdout.write('keelia\n');

        //node readlin 就是对上面的封装
        const readline = require('readline');
        const { futimesSync } = require('fs');

        const nodeRl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
        });

        // nodeRl.question('What do you think of Node.js? ', (answer) => {
        //   // TODO: Log the answer in a database
        //   console.log(`Thank you for your valuable feedback: ${answer}`);

        //   nodeRl.close();
        // });

        async function ask(question) {
            return new Promise((resolve,reject)=>{
                nodeRl.question(question, (answer) => {
                    resolve(answer)
                });
            })
        }

        void async function(params) {
            console.log(await ask('What do you think of Node.js? '))
            nodeRl.close();
        }()
        ```
  - 控制字符 stdin
- 文件模版：状态机/正则
