## js 语言设计

### 编程语言通识

#### 语言按语法分类

    1. 非形式语言
      中文，英文
    2. 形式语言（乔姆斯基谱系）
      0型： 无限制文法
      1型： 上下文相关文法
      2型： 上下文无关文法
      3型： 正则文法

相关网站：
https://zh.wikipedia.org/wiki/終結符與非終結符
https://zh.wikipedia.org/wiki/巴科斯范式
https://github.com/AssemblyScript/assemblyscript/blob/master/src/parser.ts

## js 词法类型

InputElement（词法）

1. WhiteSpace(空格)
2. LineTerminator(换行/回车)
3. Comment(注释)
4. Token（标记）
   4.1 Punctuator
   4.2 IdentifierName

4.2.1 Keywords
4.2.2 Identifier
4.2.3 Funture reserved Keywords: enum

5. Literal
   Number(IEEE 754 Double Float)
   浮点数比较: Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON
   String
   支持码点: U+0000 ~ U+10FFFF， 但推荐只使用 U+0000 ~ U+FFFF （BMP）
   存储方式: UTF8/UTF16

   Boolean
   Null
   Undifined
   Symbol

相关网站：
unicode 官网：https://home.unicode.org/
http://www.fileformat.info/info/unicode/
