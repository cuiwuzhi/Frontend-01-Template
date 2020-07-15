import { Wrapper, Text, create } from './createElement'

class Carousel {
  constructor () {
    this.position = 0
    this.children = []
    this.root = null
  }
  setAttribute (name, value) {
    this[name] = value
  }
  appendChild (child) {
    this.children.push(child)
  }
  mountTo (parent) {
    const render = this.render()

    this.root = render.root
    render.mountTo(parent)

    this.autoplay && this.loop()
    this.listenDrag()
  }
  loop () {
    let run = () => {
      this.next()
      setTimeout(run, this.duration)
    }
    setTimeout(run, this.duration)
  }
  // 如果是通过拖动完成 直接移动到下一张
  next (fromDrag) {
    let nextPosition = (this.position + 1) % this.data.length
    let current = this.root.children[this.position]
    let next = this.root.children[nextPosition]

    if (fromDrag) {
      current.style.transition = 'ease 0.5s'
      next.style.transition = 'ease 0.5s'

      current.style.transform = `translateX(${-100 - 100 * this.position}%)`
      next.style.transform = `translateX(${-100 * nextPosition}%)`

      this.position = nextPosition
      return
    }

    current.style.transition = 'ease 0s'
    next.style.transition = 'ease 0s'

    current.style.transform = `translateX(${ -100 * this.position}%)`
    next.style.transform = `translateX(${100 - 100 * nextPosition}%)`

    setTimeout(() => {
      current.style.transition = 'ease 0.5s'
      next.style.transition = 'ease 0.5s'

      current.style.transform = `translateX(${-100 - 100 * this.position}%)`
      next.style.transform = `translateX(${-100 * nextPosition}%)`

      this.position = nextPosition
    })
  }
  // 上一张只可能是通过拖拽
  prev () {
    let prevPosition = (this.position - 1 + this.data.length) % this.data.length
    let current = this.root.children[this.position]
    let prev = this.root.children[prevPosition]

    current.style.transition = 'ease 0.5s'
    prev.style.transition = 'ease 0.5s'

    current.style.transform = `translateX(${100 - 100 * this.position}%)`
    prev.style.transform = `translateX(${ -100 * prevPosition}%)`

    this.position = prevPosition
  }
  listenDrag () {
    this.root.addEventListener('mousedown', e => {
      const startX = e.clientX
      const width = this.root.offsetWidth
      console.dir(this.root, width)
      let prevPosition = (this.position - 1 + this.data.length) % this.data.length
      let nextPosition = (this.position + 1) % this.data.length
      // debugger
      let current = this.root.children[this.position]
      let prev = this.root.children[prevPosition]
      let next = this.root.children[nextPosition]

      current.style.transition = 'ease 0s'
      prev.style.transition = 'ease 0s'
      next.style.transition = 'ease 0s'

      current.style.transform = `translateX(${-width * this.position}px)`
      prev.style.transform = `translateX(${-width - width * prevPosition}px)`
      next.style.transform = `translateX(${width - width * nextPosition}px)`

      let mousemoveHandler = e => {
        const offset = e.clientX - startX > width / 2 ? width / 2 :
          e.clientX - startX < -width / 2 ? -width / 2 : e.clientX - startX

        current.style.transform = `translateX(${offset - width * this.position}px)`
        prev.style.transform = `translateX(${offset - width - width * prevPosition}px)`
        next.style.transform = `translateX(${offset + width - width * nextPosition}px)`
      }

      let mouseupHandler = e => {
        let dirEnum = {
          left: 1,
          right: 2
        }
        const offset = e.clientX - startX

        let dir
        offset > 100 && (dir = dirEnum.left)
        offset < -100 && (dir = dirEnum.right)

        if (!dir) {
          current.style.transition = 'ease .5s'
          prev.style.transition = 'ease .5s'
          next.style.transition = 'ease .5s'

          current.style.transform = `translateX(${-width * this.position}px)`
          prev.style.transform = `translateX(${-width - width * prevPosition}px)`
          next.style.transform = `translateX(${width - width * nextPosition}px)`
        } else {
          dir === dirEnum.right && this.next(true)
          dir === dirEnum.left && this.prev()
        }

        document.removeEventListener('mouseup', mouseupHandler)
        document.removeEventListener('mousemove', mousemoveHandler)
      }

      document.addEventListener('mouseup', mouseupHandler)
      document.addEventListener('mousemove', mousemoveHandler)
    })
  }
  render () {
    // this.listenDrag()
    return <div class='carousel'>
             {this.data.map(url => {
                const item = <img src={url} alt='carouselItem' class='carousel-item' />
                item.addEventListener('dragstart', e => e.preventDefault())
              
                return item
              })}
           </div>
  }
}

let data = [
  'https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg',
  'https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg',
  'https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg',
  'https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg'
]
let component = <Carousel data={data} duration={2000} autoplay>
                </Carousel>
component.mountTo(document.body)
console.log(component)