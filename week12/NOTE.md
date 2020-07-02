# 第12周学习记录
- 作业:
  + [使用LL算法构建AST](./ll.html)
  + [Trie字典树](./Trie.html)
  + [KMP](./KMP.html)
  + [WildCard](./WildCard.html)

## 使用LL算法构建AST

### 四则运算
- TokenNumber: 0-9的组合
- Operator: \+ \- \* \\ 之一
- Whitespace: \<SP>
- LineTerminator: \<LF> \<CR>

```bash
// BNF
<Expression> ::=
  <AdditiveExrpression><EOF>

<AdditiveExpression>::=
  <MultiplicativeExpression>
  |<AdditiveExpression><+><MultiplicativeExpression>
  |<AdditiveExpression><-><MultiplicativeExpression>

<MultiplicativeExpression>::=
  <Number>
  |<MultiplicativeExpression><*><Number>
  |<MultiplicativeExpression></><Number>
```

`tips: 正则重点掌握[]()^$等`

## 字符串分析算法
- 字典树
  + 大量字符串的完整模式匹配
- KMP
  + 长字符串中找子串
- WildCard 通配符算法
  + 长字符串中找子串升级版
- 正则
  + 字符串通用模式匹配
- 状态机
  + 通用的字符串分析
- LL LR
  + 字符串多层级结构分析

### 参考名词: 
- LR： [LR](https://zh.wikipedia.org/wiki/LR%E5%89%96%E6%9E%90%E5%99%A8) 分析器是一种自底向上（bottom-up）的上下文无关语法分析器。LR 意指由左（Left）至右处理输入字符串，并以最右边优先派生（Right derivation）的推导顺序（相对于 LL 分析器）建构语法树。能以此方式分析的语法称为 LR 语法。而在 LR(k) 这样的名称中，k 代表的是分析时所需前瞻符号（lookahead symbol）的数量，也就是除了目前处理到的输入符号之外，还得再向右引用几个符号之意；省略 （k）时即视为 LR(1)，而非 LR(0)。

- LL： [LL](https://zh.wikipedia.org/wiki/LL%E5%89%96%E6%9E%90%E5%99%A8) 分析器是一种处理某些上下文无关文法的自顶向下分析器。因为它从左（Left）到右处理输入，再对句型执行最左推导出语法树（Left derivation，相对于 LR 分析器）。能以此方法分析的文法称为 LL 文法。