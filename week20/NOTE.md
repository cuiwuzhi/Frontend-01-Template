# phantomjs & eslint

> phantomjs:检查页面最终渲染出来的结果

> eslint：检查js的风格

## 练习：基于phantomjs做无头浏览器check
1. 安装phantomjs
   1. 下载phantomjs
   2. cmd里面which node，装在node所在的bin里面
   3. phantomjs --version
2. phantomjs测试需要的步骤：
   1. 启动local的server
      1. 使用components作为demo，webpack-dev-server on localhost:8080
   2. 对页面元素做断言【phantomjs不支持let等新语法】
      1. 写check/check.js访问 localhost:8080 检查页面元素
      2. 写测试代码：
      ```
           var page = require('webpage').create();
           page.open('http://localhost:8080/', function(status) {
           if(status === "success") {
               var body = page.evaluate(function() {
                   var toString = function(pad,element){
                           var children = element.childNodes
                           var childrenString = ''
                           for (var i = 0; i < children.length; i++) {
                               childrenString+=toString("    "+ pad,children[i]) + '\n'
                           }
                           var name = element.tagName || '#text: ' + JSON.stringify(element.textContent)
                           return pad + name + (children.length > 0 ? '\n'+ childrenString :'') 
                       }
                       return toString('',document.body);
               });
               console.log(body);
           }
           phantom.exit();
       });
      ```
      1. 看body产生的代码，结构等对不对

> phantomjs用在哪里？持续集成里面的页面检测，测试页面是否正确;冒烟测试；对整个页面上的图片进行检查；

> 不合适用在服务器端渲染，不适合用在线上服务

> phantomjs相关的包：npm install mocha-phantomjs-core [不推荐]

## 练习： 使用eslint检查代码风格
1. demo/ eslint安装:npm install eslint --save-dev
2. demo/ npx eslint --init
3. demo/ npx eslint ./main.js ：使用eslint检查原始的src的文件，不是build出来的
4. demo/ 使用插件，适配react，setting中配置对应的pragma:
   ```
    settings:{
        react: {
        "createClass": "createReactClass", // Regex for Component Factory to use,
                                            // default to "createReactClass"
        "pragma": "create",  // Pragma to use, default to "React"
        "version": "detect", // React version. "detect" automatically picks the version you have installed.
                            // You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
                            // default to latest and warns if missing
                            // It will default to "detect" in the future
        "flowVersion": "0.53" // Flow version
        }
    }
   ```

> 一般不会改config里面的rules：
```
 rules: {
    "semi": "error",
    "no-unused-vars":"off"
  },
  ```
> rule可以自定义，可开发.但一般都不是自己写。

# 练习：为publish添加oauth用户系统：控制用户权限
1. 使用githubAPI：https://developer.github.com/apps/building-oauth-apps/。主要看第一步和第三部
   1. 注册一个app，得到appid, clientid, client secret
   2. 【publish-tool唤起浏览器】【这段是需要用户去发的，需要用户打开浏览器】得到code：实现用publish工具唤起https://github.com/login/oauth/authorize oauth页面
      1. 传params： https://github.com/login/oauth/authorize?client_id=Iv1.b2a9a2149bf510c6&redirect_uri=http%3A%2F%2Flocalhost%3A8000&scope=read%3Auser&state=123abc 【
      2. 拿到code：http://localhost:8000/?code=38ba696b69ce47ce22e2&state=123abc。code相当于入场券，不是真正的auth-token，state是全程带在里面防止跨站攻击用的，也要记住state
      3. node唤起浏览器，不同os唤起方式不同：https://blog.csdn.net/sleepwalker_1992/article/details/83783234
         1. publish-tool: npm install child_process
         2. 启动publish-server，然后启动publish-tool打开浏览器请求用户鉴权
         3. 用户登陆githug的这个app之后，跳转去的url：http://localhost:8081/auth?code=ca67f99da93a0b86dfb5，就是publish-server提供的服务
         4. publish-server收到request之后，如果是auth的request，就去请求github的access token
         5. publish-sever拿到access token之后需要回传给client端，让client端去存储
   3. 【publish-server】【服务端：是在node server上发的，client_secret是机密】code去换token：POST https://github.com/login/oauth/access_token 
        ```
        //这段代码应该运行在node server【服务器】中的 
        {
            let code = "588661aa7d2d7151251f"
            let state = "123abc"
            let client_id = "Iv1.b2a9a2149bf510c6"
            let client_secret = "13a2f5992d5c0107d7b1e8c123a9e31d42be7342"
            let redirect_uri = encodeURIComponent('http://localhost:8081/auth')

                let params = `code=${code}&state=${state}&client_secret=${client_secret}&client_id=${client_id}&redirect_uri=${redirect_uri}`
            let xhr = new XMLHttpRequest
            xhr.open("POST",`https://github.com/login/oauth/access_token?${params}`,true,)
            xhr.send(null)

            xhr.addEventListener('readystatechange',function(event){
                if(xhr.readyState === 4){
                    console.log(xhr.responseText)
                }
            })
        }

        ```
   4. 【publish-tool/publich-server都可以】拿到access-token：access_token=f3f7bd7dc3d6ba6f2e0fa40ab9ca49e9f9fdd41f&expires_in=28800&refresh_token=r1.e48f8e866a8fb47bf0a0849319aedbd8ab8fdefadc6365ca349a95daf2beef743157968001d5bd93&refresh_token_expires_in=15893999&scope=&token_type=bearer。然后就可以去调用github的api了 【这个access token是可以在用户的local的，客户端/服务端都可以】
      1. 调用user信息：Authorization: token OAUTH-TOKEN | GET https://api.github.com/user
      ```
       let xhr = new XMLHttpRequest
       xhr.open("GET",`https://api.github.com/user`,true,)
       xhr.setRequestHeader("Authorization", "token f3f7bd7dc3d6ba6f2e0fa40ab9ca49e9f9fdd41f")
       xhr.send(null)

       xhr.addEventListener('readystatechange',function(event){
           if(xhr.readyState === 4){
               console.log(xhr.responseText)
           }
       })
   ```

作业：用promice管理以上的步骤
