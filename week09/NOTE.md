# 第九周学习总结

# CSS
## Animation
* @keyframes
* animation
	* animation-name
	* animation-duration
	* animation-timing-function
	* animation-delay
	* animation-iteration-count
	* animation-direction

## Transition
* transition-property
* transition-duration
* transition-timing-function
* transition-delay

## 颜色
* CMYK：Cyan-青色，Magenta-品红，Yellow-黄色，blacK-黑色
* RGB：Red-红色，Green-绿色，Blue-蓝色
* HSL：Hue-颜色（0-360），Saturation-饱和度（0-100%），Lightness-亮度（0-100%，黑-白）
* HSV：Hue-颜色（0-360），Saturation-饱和度（0-100%），Value-明度（0-100%，黑-白）

# 形状
* data:image/svg+xml,\<svg\>...\</svg\>

# HTML
## 合法元素
* DocumentType: <!Document html>
* ElementL: \<tag\>\</tag\>
* Text: text
* Comment: \<!-- xxx --\>
* ProcessingInstruction: \<?a 1?\>
* CDATA: \<![CDATA[]]\>

## 字符引用
* \&#161; = !
* \&amp; = &
* \&lt; = <
* \&gt; = >
* \&quot; = "

# DOM
## 导航类操作
* parentNode
* childNodes
* firstChild
* lastChild
* nextSibling
* previousSibling

## 修改操作
* appendChild
* insertBefore
* removeChild
* replaceChild

## 高级操作
* compareDocumentPosition：比较两个节点的位置关系
* contains：是否包含另一个节点
* isEqualNode：两个节点是否完全相同
* cloneNode(deep)：拷贝一个节点，支持深度拷贝

## 事件
* 捕获
* 冒泡
