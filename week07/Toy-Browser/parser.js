const EOF = Symbol("EOF")
let currentToken = null;
let currentAttribute = null;

let stack = [{
    type:'documnet',
    children:[]
}]
const layout = require("./layout.js")

let currentTextNode= null;

const css = require("css");  //引用css包

//加入一个新的函数，addCSSRules
//这里我们把css规则暂存到一个数组里
let rules = [];
function addCSSRules(text){
    var ast = css.parse(text); // 返回一个ast
    // console.log(JSON.stringify(ast, null,  "   "));
    rules.push(...ast.stylesheet.rules);
               
}

function match(element, selector){
    if(!selector || !element.attributes){
        return false;
    }
    if(selector.charAt(0) == "#"){
        var attr = element.attributes.filter(attr => attr.name === "id")[0]
        if(attr && attr.value === selector.replace("#","")){
            return true;
        }else if(selector.charAt(0) == "."){
            var attr = element.attributes.filter(attr => attr.name === "id")[0]
            if(attr && attr.value === selector.replace(".","")){
                return true;
            }
        }else{
            if(element.tagName === selector){
                return true;
            }
        }
    }
}

function specificity(selector){
    var p = [0,0,0,0];
    var selectorParts = selector.split(" ");
    for(var part of selectorParts){
        if(part.charAt(0) == "#"){
            p[1] += 1;
        }else if(part.charAt(0) == "."){
            p[2] += 1;
        }else {
            p[3] += 1;
        }
    }
    return p;
}

function compare(sp1,sp2){
    if(sp1[0] - sp2[0]){
        return sp1[0] - sp2[0]
    }

    if(sp1[1] - sp2[1]){
        return sp1[1] - sp2[1]
    }

    if(sp1[2] - sp2[2]){
        return sp1[2] - sp2[2]
    }

    return sp1[3] - sp2[3]
}

function computeCSS(element){
    var elements = stack.slice().reverse();
    if(!element.computedStyle){
        element.computedStyle = {};
    }
    let matchd = false;
    for(let rule of rules){
        var selectorParts = rule.selectors[0].split(" ").reverse();
        if(!match(element,selectorParts[0]))
            continue;
        var j = 1;
        for(var i = 0; i < elements.length;i++){
            if(match(elements[i],selectorParts[j])){
                j++;
            }
        }
        if(j >= selectorParts.length){
            matchd = true
        }
        if(matchd){
            var sp = specificity(rule.selectors[0]);
            console.log(sp)
            var computedStyle = element.computedStyle;
            for(var declaration of rule.declarations){
                if(!computedStyle[declaration.property])
                    computedStyle[declaration.property] = {}
                if(!computedStyle[declaration.property].specificity){
                    computedStyle[declaration.property].value = declaration.value
                    computedStyle[declaration.property].specificity = sp
                } else if(compare(computedStyle[declaration.property].specificity, sp) < 0){
                    computedStyle[declaration.property].value = declaration.value
                    computedStyle[declaration.property].specificity = sp;
                }   
            }
        }
    }
}

function emit(token){
    
    let top = stack[stack.length-1];  // 栈顶

    if(token.type == "startTag"){
        console.log("startTag",  token)
        let element = {
            type:'element',
            children:[],
            attributes:[]
        }

        element.tagName = token.tagName;

        for(let p in token){
            if(p != "type" && p != "tagName"){
                // 属性
                element.attributes.push({
                    name:p,
                    value:token[p]
                });
            }
        }
        // 计算css 
        computeCSS(element);

        top.children.push(element)
        element.parent = top;

        if(!token.isSelfClosing){
            stack.push(element)
        }

        currentTextNode = null;

    }else if(token.type == "endTag"){
        if(top.tagName != token.tagName){
            throw new Error("tag start end doesn't match!")
        } else {
            // 匹配上结束标签 就可以出栈
            if(top.tagName === "style"){
                addCSSRules(top.children[0].content)
            }
            stack.pop()
        }

        console.log(top)
        layout(top)
        

        currentTextNode = null;

    } else if(token.type == "text"){
        // console.log(token)
        if(currentTextNode == null){

            currentTextNode = {
                type: "text",
                content: ""
            }

            top.children.push(currentTextNode)
        }
        currentTextNode.content += token.content;
    }

}

function data(c){
     //三种标签：开始<，结束EOF，自封闭
    if(c === "<"){
        //开始标签
        return tagOpen;
    } 
    // else if(c === "&"){
    //     return ;
    // } 
    else if(c === EOF){
        // Emit an end-of-file token. 提交一个结束标识
        emit({
            type:"EOF"
        })
        return ;
    } else{
        // Emit the current input character as a character token.
        emit({
            type:"text",
            content:c
        })
        return data;
    }
}

function tagOpen(c){
    if(c === "/"){
        //结束标签
        return endTagOpen;
    } else if(c.match(/^[a-zA-Z]$/)){
        //标签名
        //新建一个 token 暂且认为是开始标签
        currentToken = {
            type:"startTag",
            tagName:""
        }
        return tagName(c) // Reconsume 传入c 直接去下一步处理
    } else {
        emit({
            type:"text",
            content:c
        })
        return;
    }
}

function tagName(c){
    if(c.match(/^[\t\n\f ]$/)){          // 制表符、换行符、换页符、空格
        return beforeAttributeName;    //处理属性 
    } else if(c.match(/^[a-zA-Z]$/)){   // 匹配上字母，还是标签名的一部分
        currentToken.tagName += c
        // .toLowerCase();
        return tagName;
    } else if( c === "/"){              // 自封闭标签
        return selfClosingStartTag;
    } else if(c === ">"){               // 获取到了标签名
        emit(currentToken)
        return data;
    } else {
        currentToken += c;
        return tagName;
    }
}

//属性
function beforeAttributeName(c){
    
    if(c.match(/^[\t\n\f ]$/)){// 等待匹配属性
        return beforeAttributeName;
    } else if(c === ">" || c === "/" || c == EOF){
        return afterAttributeName(c); // 属性结束
    } else if(c === "="){
       // return beforeAttributeValue;   // 属性值
    } else {
        // 普通字符
        currentAttribute = {
            name:"",
            value:""
        }
        return attributeName(c)
    }
}

function attributeName(c){
    if(c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF){
        return afterAttributeName(c)
    } else if(c === "="){
        return beforeAttributeValue;
    }else if(c == "\u0000"){  // Null
        // return "parse error";
    }else if(c == "\'" || c == "'" || c == "<"){
        // return "parse error";
    }else {
        currentAttribute.name += c;
        return attributeName;
    }
}

function beforeAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF){
        return  beforeAttributeValue
    } else if(c === "\""){
        return doubleQuotedAttributeValue;
    }else if(c == "\'"){
        return singleQuotedAttributeValue;
    } else if(c == ">"){
        // emit()
        // return data;
    } else {
        return unquotedAttributeValue(c);
    }
}

function doubleQuotedAttributeValue(c){
    if(c === "\""){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } 
    // else if(c === "&"){
    //     return
    // } 
    else if(c === EOF){
        return
    } else if(c === "\u0000"){
        return 
    } else{
        currentAttribute.value += c;
        console.log(currentAttribute.value )
        return doubleQuotedAttributeValue
    }
}

function singleQuotedAttributeValue(c){
    if(c === "\'"){
        // set 设置currentAttribute对
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    }
    //  else if(c === "&"){
    //     // Set the return state to the attribute value (single-quoted) state. Switch to the character reference state.
    //     return
    // } 
    else if(c === EOF){
        return
    } else if(c === "\u0000"){
        return 
    } else{
        currentAttribute.value += c;
        return doubleQuotedAttributeValue
    }
}

function unquotedAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/)){
        currentToken[currentAttribute.name] = currentAttribute.value;

        return  beforeAttributeName;
    } else if(c === "/"){
        currentToken[currentAttribute.name] = currentAttribute.value;

        return selfClosingStartTag;
    } else if(c == ">"){
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken)
        return data;
    } else if(c == "\u0000"){

    } else if(c == "\"" || c == "'" || c == "<" ||c == "=" || c == "`"){

    } else if(c == EOF){

    } else {
        currentAttribute.value += c;
        return unquotedAttributeValue;
    }
}

function afterQuotedAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/)){
        return  beforeAttributeName;
    } else if(c === "/"){
        return selfClosingStartTag;
    } else if(c == ">"){
        currentToken[currentAttribute.name] = currentAttribute.value;
        console.log(currentAttribute)
        emit(currentToken)
        return data;
    } else if(c == EOF){

    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

//自封闭标签
function selfClosingStartTag(c){
    if(c === ">"){
        currentToken.isSelfClosing = true;
        // currentToken = {
        //     type:'selfClosingStartTag'
        // }
        emit(currentToken)
        return data;
    } else if(c == EOF){
        
    } else {

    }
}

//12.2.5.7 End tag open state
function endTagOpen(c){
    if(c.match(/^[a-zA-Z]$/)){
        currentToken = {
            type:"endTag",
            tagName:""
        }
        //标签名
        return tagName(c);
    } else if(c === ">"){
        // return endTagName;
    } else if(c == EOF){
        return ;
    } else {
        return ;
    }

}

function afterAttributeName(c){
    if(c.match(/^[\t\n\f ]$/)){// 等待匹配属性
        return afterAttributeName; 
    } else if(c === "/"){
        return selfClosingStartTag; // 属性结束
    } else if(c === "="){
        return beforeAttributeValue;   // 属性值
    } else if(c === ">"){
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken)
        return data;
    } else if(c == EOF){
        // emit()

    } else {
        currentToken[currentAttribute.name] = currentAttribute.value;
        // 普通字符
        currentAttribute = {
            name:"",
            value:""
        }
        return attributeName(c)
    }
}

//使用状态机 进行状态迁移 解析标签
module.exports.parseHTML = function parseHTML(html){
    // console.log(html);
    let state = data;
    for(let c of html){
    	state = state(c);
    }
    state = state(EOF)
    return stack[0]
}