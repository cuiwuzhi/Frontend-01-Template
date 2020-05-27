function getStyle(element){
    if(!element.style){
        element.style = {};
    }
    console.log(element.computedStyle)
    for(let prop in element.computedStyle){
        console.log(prop)
        var p = element.computedStyle.value;
        element.style[prop] = element.computedStyle[prop].value;

        if(element.style[prop].toString().match(/px$/)){
            element.style[prop] = parseInt(element.style[prop]);
        }

        if(element.style[prop].toString().match(/^[0-9\.]+$/)){
            element.style[prop] = parseInt(element.style[prop]);
        }
    }
    console.log(element.style)
    return element.style;
}

function layout(element){
    if(!element.computedStyle)
        return ;
    
    var elementStyle = getStyle(element);
    // 不是flex布局的不考虑
    if(elementStyle.display !== "flex"){
        return ;
    }

    var items = element.children.filter(e => e.type === 'element');
    

    // 排列
    items.sort(function (a,b){
        return (a.order || 0) - (b.order || 0)
    })

    var style = elementStyle;

    ['width','height'].forEach(size =>{
        if (style[size] === 'auto' || style[size] === ''){
            style[size] = null;
        }
    })

    // 设置默认值
    if(!style.flexDirection || style.flexDirection === "auto"){
        style.flexDirection = 'row';
    }
    if(!style.alignItems || style.alignItems === "auto"){
        style.alignItems = 'stretch';
    }
    if(!style.justifyContent || style.justifyContent === "auto"){
        style.justifyContent = 'flex-start';
    }
    if(!style.flexWrap || style.flexWrap === "auto"){
        style.flexWrap = 'nowrap';
    }
    if(!style.alignContent || style.alignContent === "auto"){
        style.alignContent = 'stretch';
    }

    // 10个重要变量 base 表示开始的位置
    // sign 代表方向的正负
    var mainSize, mainStart, mainEnd, mainSign, mainBase,
        crossSize, crossStart, crossEnd, crossSign, crossBase;
    
    if (style.flexDirection === 'row' ){
        mainSize = 'width';
        mainStart = 'left';
        mainEnd = 'right';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }
    if (style.flexDirection === 'row-reverse' ){
        mainSize = 'width';
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;
        mainBase = style.width;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }
    if (style.flexDirection === 'column' ){
        mainSize = 'height';
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }
    if (style.flexDirection === 'column-reverse' ){
        mainSize = 'height';
        mainStart = 'bottom';
        mainEnd = 'top';
        mainSign = -1;
        mainBase = style.height;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }

    // wrap-reverse 和 wrap 的行为一样，但是 cross-start 和 cross-end 互换。
    if (style.flexDirection === 'wrap-reverse' ){
        var tmp = crossStart;
        crossStart = crossEnd;
        crossEnd = tmp;
        crossSign = -1;
    }else{
        crossBase = 0;
        crossSign = 1;
    }

    // 处理特殊情况，没有设置mainSize
    // 所有子元素的宽/高相加等于mainSize
    var isAutoMainSize = false;
    if(!style[mainSize]){ // auto sizeing
        elementStyle[mainSize] = 0;
        for(var i =0; i < items.length; i++){
            var item = items[i];
            if(itemStyle[mainSize] !== null || itemStyle[mainSize] !== (void 0))
                elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize];
        }

        isAutoMainSize = true;
        // style.flexWrap = 'noWrap';
    }

    var flexLine = []; // 行
    var flexLines = [flexLine]

    var mainSpace = elementStyle[mainSize]; // 剩余空间，刚开始全空，等于mainSize
    var crossSpace = 0; // 每一行占用的高度

    for(var i = 0; i < items.length; i++){
        var item = items[i];
        var itemStyle = getStyle(item);

        // 元素没有设置主轴尺寸，为0 
        if(itemStyle[mainSize] === null){
            itemStyle[mainSize] =0;
        }



        if(itemStyle.flex){
            // 不管多少个都能放的下
            flexLine.push(item);
        } else if(style.flexWrap === 'nowrap' && isAutoMainSize){
            mainSpace -= itemStyle[mainSize];
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)){
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            }
            flexLine.push(item);
        } else {
            //flex: wrap
            if(itemStyle[mainSize] > style[mainSize]){
                // 如果item比一行还宽，只能等于行的最大宽度
                itemStyle[mainSize] = style[mainSize]
            }
            if(itemStyle[mainSize] < style[mainSize]){
                flexLine.mainSpace = mainSpace;
                flexLine.crossSpace = crossSpace;
                // 创建新行
                flexLine = [item];
                flexLines.push(flexLine);
                mainSpace = style[mainSize];
                crossSpace = 0;
            } else {
                flexLine.push(item);
            }

            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0))
                crossSpace  = Math.max(crossSpace, itemStyle[crossSize]);
            mainSpace -= itemStyle[mainSize];
        }
    }
    flexLine.mainSpace = mainSpace;
    

    if(style.flexWrap === 'nowrap' || isAutoMainSize){
        flexLine.crossSpace = (style[crossSize] !== undefined)? style[crossSize] : crossSpace;
         
    } else {
        flexLine.crossSpace = crossSpace;
    }

    if(mainSpace < 0){
        // overflow (happen only if container is single line), scale every item
        var scale = style[mainSize] / (style[mainSize] - mainSpace);
        var currentMain = mainBase;
        for(var i = 0; i < items.length;i++){
            var item = items[i];
            var itemStyle = getStyle(item);

            if(itemStyle.flex){
                itemStyle[mainSize] = 0;
            }

            itemStyle[mainSize] = itemStyle[mainSize] * scale;

            itemStyle[mainStart] = currentMain;
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
            currentMain = itemStyle[mainEnd];
        }
    }else {
        // process ench flex line
        flexLines.forEach(function (items){
            var mainSpace = items.mainSpace;
            var flexTotal = 0;
            for(var i = 0; i <items.length; i++){
                var item = items[i];
                var itemStyle = getStyle(item);
                if(itemStyle.flex !== null && (itemStyle.flex !== (void 0))){
                    flexTotal += itemStyle.flex;
                    continue;
                }
            }

            if(flexTotal > 0){
                // there id flexible felx items
                var currentMain = mainBase;
                for(var i = 0; i < items.length; i++){
                    var item = items[i];
                    var itemStyle = getStyle(item);

                    if(itemStyle.flex){
                        itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
                    
                    }
                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd]
                }
            }else {
                if(style.justifyContent == 'flex-start'){
                    var currentMain = mainBase;
                    var Step = 0;
                }
                if(style.justifyContent == 'flex-end'){
                    var currentMain = mainSpace * mainSign + mainBase;
                    var Step = 0;
                }
                if(style.justifyContent == 'center'){
                    var currentMain = mainSpace/2 * mainSign + mainBase;
                    var Step = 0;
                }
                if(style.justifyContent == 'space-between'){
                    var currentMain = mainBase;
                    var Step = mainSpace /(item.length - 1) * mainSign;
                }
                if(style.justifyContent == 'space-around'){
                    var Step = mainSpace / items.length * mainSign;
                    
                    var currentMain = step / 2 + mainBase;
                }
                for(var i = 0; i < items.length; i++){
                    var item = items[i];
                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd] + step;
                }
            }
        })
    }

    // compute the cross axis size
    // align-items, align-self
    var crossSpace;

    if(!style[crossSize]){
        crossSpace = 0;
        elementStyle[crossSize] = 0;
        for(var i =0 ; i < flexLines.length; i++){
            elementStyle[crossSize] = elementStyle[crossSize] = flexLines[i].crossSpace;
        }


    } else {
        crossSpace = style[crossSize]
        for(var i = 0; i < flexLines.length; i++){
            crossSpace -= flexLines[i].crossSpace;
        }
    }

    if (style.flexWrap === "wrap-reverse"){
        crossBase = style[crossSize]
    } else {
        crossBase = 0;
    }

    var lineSize = style[crossSize] /  flexLines.length;
    var step;
    if(style.alignContent === "flex-start"){
        crossBase += 0;
        step = 0;
    }
    if(style.alignContent === "flex-end"){
        crossBase += crossSign * crossSpace;
        step = 0;
    }
    if(style.alignContent === "center"){
        crossBase +=  crossSign * crossSpace / 2;
        step = 0;
    }
    if(style.alignContent === "space-between"){
        crossBase += 0;
        step = crossSpace / (flexLines.length - 1);
    }
    if(style.alignContent === "space-around"){
         Step = crossSpace / flexLines.length ;
                    
         crossBase += crossSign * step / 2;
    
    }
    if(style.alignContent === "stretch"){
        crossBase += 0;
        step = 0;
    }


    flexLines.forEach(function (items){
        var lineCrossSize = style.alignContent === 'stretch'?
            items.crossSpace + crossSpace / flexLines.length : 
            items.crossSpace;
        for(var i = 0; i <items.length; i++){
            var item = items[i];
            var itemStyle = getStyle(item);

            var align = itemStyle.alignSelf || style.alignItems;
        
            if(itemStyle[crossSize] === null){
                itemStyle[crossSize] = (align === 'stretch')?lineCrossSize:0;
            }

            if(align == 'flex-start'){
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
            }
            if(align == 'flex-end'){
                itemStyle[crossStart] = crossBase + crossSign * lineCrossSize;
                itemStyle[crossEnd] = itemStyle[crossEnd] + crossSign * itemStyle[crossSize];
            }
            if(align == 'center'){
                itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2;
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
            }
            if(align == 'stretch'){
                itemStyle[crossStart] = crossBase
                itemStyle[crossEnd] =  crossBase + crossSign * ((itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) ? itemStyle[crossSize] : lineCrossSize);
                itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart])
            }
        }

        crossBase += crossSign * (lineCrossSize + step);
        
    });
    console.log(items)
}


module.exports = layout;