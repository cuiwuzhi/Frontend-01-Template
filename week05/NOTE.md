# 浏览器工作原理-HTTP 协议
## 基于 ABNF 语义定义的 HTTP 消息格式
### 1. ABNF (扩充巴科斯-瑙尔范式)操作符
+ **空白字符**：用来分隔定义中的各个元素 
    ` method SP request-target SP HTTP-version CRLF `
+ **选择** /：表示多个规则都是可供选择的规则 
    `start-line = request-line / status-line`
+ **值范围** %c##-##：
    `OCTAL = "0" / "1" / "2" / "3" / "4" / "5" / "6" / "7" 与 OCTAL = %x30-37等价`
+ **序列组合()**：将规则组合起来，视为单个元素
+ **不定量重复 m\*n：
        `* 元素表示零个或更多元素：*(header-field CRLF) `
        `1* 元素表示一个或者更多元素，2*4元素表示两个至四个元素`
+ **可选序列[]**：
    `[message-body]`
### 2. ABNF (扩充巴科斯-瑙尔范式) 核心规则
规则 | 形式定义 | 意义
------ | ------------ | -----
ALPHA | %x41-5A / %x61-7A | 大写和小写 ACSII 字母（A-Z,a-z）
DIGIT | %x30-39 | 数字（0-9）
HEXDIG | DIGIT / "A" / "B" / "C" / "D" / "E" / "F" | 十六进制数字（0-9，A-F, a-f）
DQUOTE | %x22 | 双引号
SP | %x20 | 空格
HTAB | %x09 | 横向制表符
WSP | SP / HTAB | 空格或横向制表符
LWSP | *(WSP / CRLF WSP) | 直线空白（晚于换行）
VCHAR | %21-7E | 可见（打印）字符
CHAR | %x01-7F | 任何7-位 US-ASCII 字符，不包括 NUL(%x00)
OCTET | %x00-FF | 8位数据
CTL | %x00-1F / %x7F | 控制字符
CR | %x0D | 回车
LF | %x0A | 换行
CRLF | CR LF | 互联网标准换行
BIT | "0" / "1" | 二进制数字  
### 3. 基于 ABNF 描述的 HTTP 协议
 ```
HTTP-message = start-line *(header-field CRLF) CRLF [message-body]
   start-line = request-line / status-line
      request-line = method SP request-target SP HTTP-version CRLF
      status-line = HTTP-version SP status-code SP reason-phrase CRLF
   header-field = field-name ":" OWS field-value OWS
     OWS = *(SP / HTAB)
        field-name = token
        field-value = *(field-content / obs-fold)
   message-body = *OCTET  二进制的方式传递 
```
### 4.常见方法
* GET：主要的获取信息方法，大量的性能优化都针对该方法
* HEAD: 类似 GET 方法，但服务器不发送 BODY,用以 获取 HEAD 元数据，幂等方法
* POST: 常用于提交 HTML FORM 表单、新增资源等
* PUT: 更新资源，带条件时是幂等方法
* DELETE:  删除资源，幂等方法
* CONNECT:  建立 tunnel 隧道
* OPTIONS: 显示服务器对访问资源支持的方法，幂等方法
* TRACE:  回显服务器收到的请求，用于定位问题，有安全风险
### 5.两种传输HTTP 包体的方式
#### 5.1 定长包体
  * 发送 HTTP 消息时能够确定包体的全部长度
    * 使用 Content-Length 头部明确指明包体长度
      * Content-Length = 1*DIGIT
        *用10进制（不是16进制）表示包体中的字节个数，且必须与实际传输的包体长度一致
#### 5.2 不定长包体的 chunk 传输方式
  * 发送 HTTP 消息时不能确定包体的全部长度
    * 使用 Transfer-Encoding 头部指明使用 Chunk 传输方式
      * 含 Transfer-Encoding 头部后 Content-Length 头部应被忽略
  * **Transfer-Encoding 头部**
    * tranfer-coding = "chunked" / "compress" / "deflate" / "gzip" / transfer-extension
    * Chunked transfer encoding 分块传输编码：Transfer-Encoding: chunked
      * chunked-body = *chunk   
                                  last-chunk
                                  trailer-part
                                  CRLF
      * chunk = chunk-size [chunk-ext] CRLF chunk-data CRLF
        * chunk-size -- 1*HEXDIG : **注意这里是16进制而不是10进制**
        * chunk-data -- 1*OCTET   : 1个或多个十六进制数据
      * last-chunk = 1*("0") [chunk-ext] CRLF
      * trailer-part = *(header-filed CRLF)  : 0个或多个头部字段
      
## 作业中需要注意的点
### 1. chunk-size 为16进制数不是10进制，与 Content-Length 不同
```
//size 为十六进制数而不是十进制
this.size *= 16;  
this.size += parseInt(char, 16);
```
### 2. 响应包体中的字符如何计算字符长度
*注：由于不同字符所占字节数不同，需要区分字符长度*
```
//判断字符所占字节数
let charCode = char.charCodeAt(); //获取字符码点
let byteNum = 1;
if(charCode <= 0x007F) {  //占一个字节
  byteNum = 1;
} else if(charCode <= 0x07FF) { //占两个字节
  byteNum = 2;
} else if(charCode <= 0xFFFF) { //占三个个字节
  byteNum = 3;
} else if(charCode <= 0x10FFFF){
  byteNum = 4;
}
```
### 3. chunk 块的格式
```
chunked-body = *chunk （多个 chunk 块）  
last-chunk (以多个0表示，通常用一个0表示最后 chunk 块）
trailer-part(可有可无)
CRLF
```
