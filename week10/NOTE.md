#####  CSSOM
是CSS的对象模型，包含描述样式表和规则等css的模型部分（CSSOM），和跟元素视图相关的View（CSSOM View）部分

##### CSSOM (CSS中样式表的模型)
```
document.styleSheets

document.styleSheets[0].insertRule("p { color:pink; }", 0)
document.styleSheets[0].removeRule(0)

document.styleSheets[0].cssRules

window.getComputedStyle(elt, pseudoElt); // 获取一个元素最终经过计算得到的属性

```

##### CSSOM View
- 窗口API，操作浏览器窗口的位置、尺寸等
  - moveTo(x, y) 窗口移动到屏幕的特定坐标
  - moveBy(x, y) 窗口移动特定距离
  - resizeTo(x, y) 改变窗口大小到特定尺寸
  - resizeBy(x, y) 改变窗口大小特定尺寸
  - 规定了 window.open() 的第三个参数
  ```
  window.open("about:blank", "_blank" ,"width=100,height=100,left=100,right=100" )
  ```

- 滚动API
  - 视口滚动API
    - window.scrollX
    - window.scrollY
    - window.scroll(x, y), scrollTo()
    - scrollBy(x, y)
  - 元素滚动 API
    - element.scrollTop
    - element.scrollLeft
    - element.scrollWidth
    - element.scrollHeight
    - element.scroll(x, y)
    - element.scrollBy(x, y)
    - element.scrollInfoView(arg)
  - 布局API
    - 全局尺寸信息
      - window.innerHeight (视口高度)
      - window.innerWidth  (视口宽度)
      - window.outerWidth (浏览器窗口宽度)
      - window.outerHeight (浏览器窗口高度)
      - window.devicePixelRatio (物理像素与css像素单位的倍率关系)
      - window.screen 
        - window.screen.width （设备屏幕宽度）
        - window.screen.height （设备屏幕高度）
        - window.screen.availWidth
        - window.screen.availHeight
        - window.screen.colorDepth
        - window.screen.pixelDepth
    - 元素布局信息
      - getClientRects() 返回列表，包含元素对应的每一个盒占据的客户端矩形区域，x, y, width, height
      - getBoundingClientRect(), 元素对应的所有盒的包裹的矩形区域