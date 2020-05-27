# 每周总结



# 布局方式：flex

## 第一步 预处理
- 搞清楚主轴和交叉轴

var mainSize,mianStart, mainEnd, mainSign, mainBase,
    crossSize, crossStart, crossEnd, crossSign,  crossBase,


## 第二步 收集元素进行（hang）
- 根据主轴尺寸，把元素分进行
- 若设置了no-wrap,则强行分配进第一行

## 第三步 计算主轴
- 找出所有flex元素
- 把主轴方向的剩余尺寸按比列分配这些元素
- 若剩余空间为负数，所有flex元素为0，等比压缩剩余元素

## 第三步 计算交叉轴方向
- 更具每一行中最大元素尺寸计算行高
- 根据行高flex-align和item-align，确定元素具体位置




# 绘制

## 绘制单个元素
- 绘制需要依赖一个图形环境
- 我们这里采用了npm包images (npm install images)
- 绘制在一个viewport上进行
- 与绘制相关的属性：background-color，border，background-image等

## 绘制dom
- 递归调用子元素的绘制方法完成DOM树的绘制
- 忽略一些不需要绘制的节点
- 实际浏览器中，文字绘制是难点，需要字体库，忽略
- 实际浏览器中，还会对一些图层做compositing，忽略
