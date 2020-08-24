# 练习：用yeoman generator串联起来完整的工具链
1. 创建toy-tool文件夹作为即将创建的generator的文件夹，npm init；
2. 创建 yeoman generator：npm install --save yeoman-generator
3. 创建 generators/app/index.js作为generator代码，并npm link
4. 构建generator：
   1. templates，作为新项目的基础文件/库：
      1. package.json配置dependencies
      2. lib基础库
      3. entry：main.js index.html
      4. 配置webpack.config

# publish
## 发布过程中的重点：
- 完成一个auth，验证用户的身份
- 接受提交上来的文件，并且能存到一定的位置
- 版本管理，历史上每个版本的发布都有历史记录
- 多用户权限管理

## 实现功能： 
1.  在publish-server中给server里面，添加一些文件
2.  通过http请求去指定这个文件的内容
3.  编写一个命令行的publish-tool，让publish工具去访问pulish-server，让publish-server根据发来的内容给server里面添加文件

## 练习：两层server实现以上的功能，server+publish-server一并部署到虚拟机上，然后就可以用publish-tool用publish-server提供真正文件的server。
都用express的generator去生成server的初始版本
### server port3000 :用户访问
> express的模版是发布了多少个页面就有多少个模版
1. install express
2. npx express-generator

## publish-server port8081:内部访问
1.  npx express-generator --no-view
2.  npm install (很多generator现在不负责npm intall)
3.  不需要界面的，只跟工具链publish-tool做对接，将publish-tool传上来的文件，传入server中
4.  解压tool传来的文件压缩包

## publish-tool
1. 向publish-server发送多个文件的压缩：npm install archiver --save
    1.  打包一个目录并且把它上传到publish-server
    2.  然后再publish-server端解压：npm install unzipper






