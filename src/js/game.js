import {
  drawCircle,
  drawRectWithRadius,
  drawHalfRectWithRadius,
  roundedLine,
  loadImage,
  defineText,
  centerText,
  getMousePos,
  animate,
} from './utils.js'

export class Game {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    this.canvas.width = 856
    this.canvas.height = 605
    this.init()
  }

  init() {
    this.level = 1
    this.progress = 0
    this.money = 30
    this.moves = 30
    this.scores = 0
    this.neededScores = 160
    this.shufflesNum = 3

    this.moveActive = false
    this.modalActive = false
    this.selfDestructModal = false
    this.boosterActive = false
    this.activeBooster = null

    this.colors = {
      red: 'red',
      green: 'green',
      yellow: 'yellow',
      blue: 'blue',
      purple: 'purple',
    }

    const { red, green, yellow, blue, purple } = this.colors

    this.coords = []
    this.bonusesCoords = []

    this.map = [
      [red, yellow, green, green, yellow, yellow, red, red, red],
      [red, yellow, green, green, purple, yellow, blue, blue, red],
      [blue, blue, green, green, yellow, yellow, red, red, red],
      [blue, blue, blue, green, yellow, yellow, red, red, red],
      [blue, blue, green, green, purple, yellow, red, red, red],
      [red, green, green, green, purple, red, red, red, red],
      [red, purple, purple, purple, blue, purple, purple, purple, purple],
      [red, green, yellow, green, purple, yellow, red, red, red],
      [red, green, yellow, green, purple, yellow, red, red, red],
    ]

    this.cubesPaths = [
      { name: 'blue', path: './assets/images/blue.png' },
      { name: 'red', path: './assets/images/red.png' },
      { name: 'green', path: './assets/images/green.png' },
      { name: 'yellow', path: './assets/images/yellow.png' },
      { name: 'purple', path: './assets/images/purple.png' },
    ]

    this.imgsPaths = [
      { name: 'level-block', path: './assets/images/level-block.png' },
      { name: 'money-block', path: './assets/images/money-block.png' },
      { name: 'plus-btn', path: './assets/images/plus.png' },
      { name: 'pause-btn', path: './assets/images/pause.png' },
      { name: 'moves-round', path: './assets/images/moves.png' },
      { name: 'rounded-rectangle', path: './assets/images/rounded-rectangle.png' },
      { name: 'bomb', path: './assets/images/bomb.png' },
    ]

    this.areas = {
      pause: {
        coords: {
          x1: 776,
          y1: 5,
          x2: 843,
          y2: 72,
        },
        handler: this.pauseHandler,
      },

      bonuses: {
        coords: {
          x1: 416,
          y1: 444,
          x2: 764,
          y2: 548,
        },
        handler: this.selectBonusHandler,
      },
      field: {
        coords: {
          x1: 44,
          y1: 120,
          x2: 444,
          y2: 560,
        },
        handler: this.moveHandler,
      },
    }
  }

  //___Methods___

  async preloadCubesImgs() {
    this.cubeImages = Object.fromEntries(
      await Promise.all(
        this.cubesPaths.map(async ({ name, path }) => [name, await loadImage(path)])
      )
    )
  }
  async preloadImgs() {
    this.imgs = {}
    for (const { name, path } of this.imgsPaths) {
      this.imgs[name] = await loadImage(path)
    }
  }
  addListeners() {
    this.canvas.addEventListener('click', this.clickHandler)
  }

  clickHandler = async (event) => {
    const pos = getMousePos(this.canvas, event)

    const area = Object.values(this.areas).find(
      ({ coords }) =>
        coords.x1 <= pos.x && coords.x2 >= pos.x && coords.y1 <= pos.y && coords.y2 >= pos.y
    )
    if (!area) return

    await area.handler(pos, event)
  }

  drawField() {
    drawRectWithRadius(this.ctx, 32, 107, 400, 440, 20)
    this.ctx.lineWidth = 7
    this.ctx.strokeStyle = '#252e6d'
    this.ctx.fillStyle = '#020526'
    this.ctx.fill()
    this.ctx.stroke()
  }
  renderMap() {
    const widthCube = 42
    const heightCube = 46
    let offsetXField = 44
    let offsetYField = 120

    for (let i = 0; i < this.map.length; i++) {
      for (let j = 0; j < this.map[i].length; j++) {
        if (this.map[i][j]) {
          let cube = this.cubeImages[this.map[i][j]]
          this.ctx.drawImage(cube, offsetXField, offsetYField, widthCube, heightCube)
        }
        if (this.coords.length < this.map.length * this.map.length) {
          this.coords.push({
            x1: offsetXField,
            y1: offsetYField,
            x2: offsetXField + widthCube,
            y2: offsetYField + heightCube,
          })
        }
        offsetXField += widthCube
      }
      offsetXField = 44
      offsetYField += heightCube
    }
  }

  moveHandler = async (pos, event) => {
    if (this.moveActive || this.modalActive || this.selfDestructModal) return
    if (!this.boosterActive) {
      this.moveActive = true

      const clickedCubeIdx = this.coords.findIndex(
        ({ x1, y1, x2, y2 }) => pos.x >= x1 && pos.x <= x2 && pos.y >= y1 && pos.y <= y2
      )
      if (clickedCubeIdx === -1) return

      const clickedColor = this.getCubeByIndex(clickedCubeIdx)

      // Algorithm to find all the same cubes on click
      const selectedCubes = this.findTheSame(
        this.getCubeByIndex.bind(this),
        clickedCubeIdx,
        clickedColor
      )

      if (selectedCubes.size >= 3) {
        await this.fadeOut(selectedCubes)

        // delete selected cubes

        this.ctx.clearRect(44, 120, 400, 440)
        this.drawField()
        this.renderMap()

        await this.fallingCubes(selectedCubes)
        this.changeState(selectedCubes.size)
      }
    } else {
      //bomb
      if (this.activeBooster === 'bomb' && this.money >= 5) {
        const clickedCubeIdx = this.coords.findIndex(
          ({ x1, y1, x2, y2 }) => pos.x >= x1 && pos.x <= x2 && pos.y >= y1 && pos.y <= y2
        )
        if (clickedCubeIdx === -1) return
        const current = clickedCubeIdx

        const leftCube = current - 1
        const rightCube = current + 1
        const topCube = current - 9
        const bottomCube = current + 9
        let boomAreaIdxs = []

        // left
        if (leftCube && (leftCube + 1) % 9 && leftCube >= 0) {
          boomAreaIdxs.push(leftCube)
          if (leftCube + 9 < 81 && !(leftCube + (9 % 8) === 0)) {
            boomAreaIdxs.push(leftCube + 9)
          }
          if (leftCube - 9 >= 0) {
            boomAreaIdxs.push(leftCube - 9)
          }
        }

        // top
        if (topCube && topCube > 0) {
          boomAreaIdxs.push(topCube)
        }

        // right
        if (rightCube && !(rightCube % 9 === 0) && rightCube < 81) {
          boomAreaIdxs.push(rightCube)
          if (rightCube + 9 <= 81) {
            boomAreaIdxs.push(rightCube + 9)
          }
          if (rightCube - 9 > 0) {
            boomAreaIdxs.push(rightCube - 9)
          }
        }

        // bottom
        if (bottomCube && bottomCube <= 81) {
          boomAreaIdxs.push(bottomCube)
        }

        // current
        boomAreaIdxs.push(current)

        //
        this.changeState(boomAreaIdxs.length)
        await this.fadeOut(boomAreaIdxs)

        document.body.style.cursor = 'default'

        this.ctx.clearRect(516, 444, 100, 104)
        this.drawBonuses(1, '5')

        if (this.money >= 5) {
          this.money -= 5
          this.ctx.clearRect(600, 10, this.areas.pause.coords.x1 - 600, 50)
          this.drawMoneyBlock()
        }

        this.activeBooster = null
        this.boosterActive = false
      }
    }

    this.ctx.clearRect(44, 120, 400, 440)
    this.drawField()
    this.renderMap()
    await this.fallingCubes()
    await this.endGame()
    this.moveActive = false
  }

  getCubeAxis(index) {
    return [Math.floor(index / this.map.length), index % this.map.length]
  }
  getCubeByIndex(index) {
    const [x, y] = this.getCubeAxis(index)
    return this.map[x][y]
  }
  setCubeByIndex(index, color) {
    const [x, y] = this.getCubeAxis(index)
    this.map[x][y] = color
  }
  getCubeIndex([x, y]) {
    return x + y * this.map.length
  }
  generateCube() {
    const colors = Object.keys(this.colors)
    return colors[Math.floor(Math.random() * colors.length)]
  }
  findTheSame = (getCube, cubeIndex, colorCube) => {
    let processed = []
    let selectedCubes = new Set()
    processed.push(cubeIndex)

    while (processed.length) {
      const current = processed.shift()

      selectedCubes.add(current)

      const leftCube = current - 1
      const rightCube = current + 1
      const topCube = current - 9
      const bottomCube = current + 9

      // to left
      if (
        (leftCube + 1) % 9 &&
        leftCube >= 0 &&
        getCube(leftCube) === colorCube &&
        !selectedCubes.has(leftCube)
      ) {
        processed.push(leftCube)
      }
      // to top
      if (topCube > 0 && getCube(topCube) === colorCube && !selectedCubes.has(topCube)) {
        processed.push(topCube)
      }
      // to right
      if (
        !(rightCube % 9 === 0) &&
        rightCube < 81 &&
        getCube(rightCube) === colorCube &&
        !selectedCubes.has(rightCube)
      ) {
        processed.push(rightCube)
      }
      // to bottom
      if (bottomCube < 81 && getCube(bottomCube) === colorCube && !selectedCubes.has(bottomCube)) {
        processed.push(bottomCube)
      }
    }
    return selectedCubes
  }

  async fallingCubes() {
    // Falling
    let widthCube = 42
    let heightCube = 46

    const cols = []
    for (let colId = 0; colId < this.map[0].length; colId++) {
      const col = []
      const x = this.areas.field.coords.x1 + colId * widthCube

      for (let rowId = 0; rowId < this.map.length; rowId++) {
        const color = this.map[rowId][colId]

        if (color === null) continue

        col.push({
          color,
          x,
          startY: this.areas.field.coords.y1 + rowId * heightCube,
        })
      }

      const cubesLeft = this.map.length - col.length
      while (col.length < this.map.length) {
        col.unshift({
          color: this.generateCube(),
          x,
          startY:
            this.areas.field.coords.y1 - (cubesLeft - col.length + this.map.length) * heightCube,
        })
      }

      for (let rowId = 0; rowId < this.map.length; rowId++) {
        col[rowId].finishY = this.areas.field.coords.y1 + rowId * heightCube
      }

      cols.push(col)
    }

    const gameFieldArea = new Path2D()
    gameFieldArea.rect(
      this.areas.field.coords.x1,
      this.areas.field.coords.y1,
      this.areas.field.coords.x2,
      this.areas.field.coords.y2
    )
    this.ctx.save()
    this.ctx.clip(gameFieldArea)

    await animate(
      220,
      (animationProgress) => {
        this.drawField()
        for (let colId = 0; colId < this.map[0].length; colId++) {
          for (let rowId = 0; rowId < this.map.length; rowId++) {
            const cube = cols[colId][rowId]
            const cubeImg = this.cubeImages[cube.color]
            if (cubeImg) {
              this.ctx.drawImage(
                cubeImg,
                cube.x,
                cube.startY + (cube.finishY - cube.startY) * animationProgress,
                widthCube,
                heightCube
              )
            }
          }
        }
      },
      (x) => (x < 0.5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2)
    )

    this.ctx.restore()

    for (let colId = 0; colId < this.map[0].length; colId++) {
      for (let rowId = 0; rowId < this.map.length; rowId++) {
        this.map[rowId][colId] = cols[colId][rowId].color
      }
    }

    this.renderMap()
  }

  async fadeOut(set) {
    // Fade out animation

    await animate(
      220,
      (animationProgress) => {
        set.forEach((index) => {
          const alpha = 1 - animationProgress
          const widthCube = 42
          const heightCube = 46
          const cubeImg = this.cubeImages[this.getCubeByIndex(index)]

          const [x, y] = this.getCubeAxis(index)

          const offsetXCube = 44 + widthCube * y
          const offsetYCube = 120 + heightCube * x

          this.ctx.globalAlpha = 1
          this.ctx.fillStyle = '#020526'
          this.ctx.fillRect(offsetXCube, offsetYCube, widthCube, heightCube)
          this.ctx.globalAlpha = alpha
          if (cubeImg) {
            this.ctx.drawImage(cubeImg, offsetXCube, offsetYCube, widthCube, heightCube)
          }
        })
      },
      (a) => a
    )
    this.ctx.globalAlpha = 1
    set.forEach((index) => this.setCubeByIndex(index, null))
  }
  async checkNear() {
    // check the same cubes nearly
    let nearlies = []

    for (let i = 0; i < this.map.length; i++) {
      for (let j = 0; j < this.map[i].length; j++) {
        const cubeIndex = this.getCubeIndex([j, i])

        const colorCube = this.map[i][j]
        const nearlyCubesSet = this.findTheSame(
          this.getCubeByIndex.bind(this),
          cubeIndex,
          colorCube
        )

        if (nearlyCubesSet.size >= 3) {
          nearlies.push('0')
        }
      }
    }

    if (nearlies.length === 0) {
      await this.ifNoWays()

      if (this.shufflesNum > 0) {
        await this.shuffle()
        this.shufflesNum--
      } else {
        this.endGame(this.shufflesNum)
      }
    }
    nearlies = []
  }

  async ifNoWays() {
    const text = 'Ходов нет!'
    await animate(
      1000,
      (a) => a,
      (animationProgress) => {
        const fz = 15 + 40 * animationProgress
        const widthText = this.ctx.measureText(text).width
        const offsetX = this.canvas.width / 2 - widthText / 2 - 20
        const offsetY = this.canvas.height / 2 - 40 * animationProgress - 10
        const widthBlock = widthText + 40
        const heightBlock = 8 + 90 * animationProgress + 20

        defineText(this.ctx, `${fz}px`, 'Marvin', '#a70916', 'middle')

        if (animationProgress > 0) {
          this.ctx.clearRect(offsetX + 5, offsetY + 5, widthBlock - 10, heightBlock - 10)
          drawRectWithRadius(this.ctx, offsetX, offsetY, widthBlock, heightBlock, 15)
          this.ctx.fillStyle = '#020526'
          this.ctx.strokeStyle = '#252e6d'
          this.ctx.lineWidth = 1 + 5 * animationProgress
          this.ctx.fill()
          this.ctx.stroke()
        }

        this.ctx.fillStyle = '#a70916'
        this.ctx.fillText(
          text,
          centerText(this.ctx, 0, this.canvas.width, text),
          this.canvas.height / 2
        )
      }
    )
    this.ctx.clearRect(this.canvas.width / 2 - 403 / 2, this.canvas.height / 2 - 60, 343, 150)
    this.drawMovesAndScores()
  }
  async shuffle() {
    const widthCube = 42
    const heightCube = 46

    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
      }
      return array
    }

    function easeInOutCubic(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
    }
    const shuffleAsync = async () => {
      const items = shuffleArray(
        this.map.flatMap((row, rowId) =>
          row.map((color, colId) => ({
            color,
            startX: colId * widthCube,
            startY: rowId * heightCube,
          }))
        )
      ).map((item, index) => ({
        ...item,
        deltaX: (index % this.map.length) * widthCube - item.startX,
        deltaY: Math.floor(index / this.map.length) * heightCube - item.startY,
      }))

      this.selfDestructModal = true
      await animate(1000, easeInOutCubic, (animationProgress) => {
        this.ctx.clearRect(44, 120, 400, 440) // clear field
        this.drawField()

        items.forEach((item) => {
          const image = this.cubeImages[item.color]
          const dx = 44 + item.startX + item.deltaX * animationProgress
          const dy = 120 + item.startY + item.deltaY * animationProgress
          this.ctx.drawImage(image, dx, dy, widthCube, heightCube)
        })
        for (let i = 0; i < this.map.length; i++) {
          for (let j = 0; j < this.map[i].length; j++) {
            this.map[i][j] = items[i * this.map.length + j].color
          }
        }
      })
      this.selfDestructModal = false
    }
    await shuffleAsync()
  }
  drawLevelBlock() {
    const levelPic = this.imgs['level-block']

    const marginText = 25
    const circleWidth = 32
    const levelOffsetX = 99

    defineText(this.ctx, '20px', 'Marvin', 'white', 'top')
    const widthText = this.ctx.measureText(this.level).width

    const widthLevelBlock = widthText + circleWidth + marginText * 2

    this.ctx.drawImage(levelPic, levelOffsetX, 14, widthLevelBlock, 38)

    this.ctx.fillText(
      this.level,
      centerText(this.ctx, levelOffsetX, widthLevelBlock, this.level) + circleWidth / 2,
      22
    )

    drawCircle(this.ctx, 119, circleWidth, 20, 0, 2 * Math.PI, false, '#b5b5b5')
  }

  drawProgress() {
    const maxProgress = 292

    const progressHeading = 'Прогресс'

    // block
    const offsetXBlock = 227
    const widthBlock = 327
    const heightBlock = 62
    drawHalfRectWithRadius(this.ctx, offsetXBlock, 0, widthBlock, heightBlock, 20)
    this.ctx.fillStyle = '#0c2e5c'
    this.ctx.fill()
    this.ctx.closePath()

    // text
    defineText(this.ctx, '17px', 'Marvin', 'white', 'top')
    this.ctx.fillText(
      progressHeading,
      centerText(this.ctx, offsetXBlock, widthBlock, progressHeading),
      5
    )

    // bg progress line
    roundedLine(this.ctx, 25, 244, 42, 536, 42, '#011a3b')

    // actual progress line
    if (this.progress > 3 && this.progress < maxProgress) {
      roundedLine(this.ctx, 25, 244, 42, 244 + this.progress, 42, '#7ae400')
    } else if (this.progress >= maxProgress) {
      roundedLine(this.ctx, 25, 244, 42, 244 + maxProgress, 42, '#7ae400')
    }
  }

  drawMoneyBlock() {
    const moneyPic = this.imgs['money-block']

    const marginText = 25
    const circleWidth = 32
    const moneyOffsetX = 583

    defineText(this.ctx, '20px', 'Marvin', 'white', 'top')

    const widthText = this.ctx.measureText(this.money).width
    const widthMoneyBlock = widthText + circleWidth + marginText * 2
    console.log(widthMoneyBlock)
    // block image
    this.ctx.drawImage(moneyPic, moneyOffsetX, 16, widthMoneyBlock, 38)

    this.ctx.fillText(
      this.money,
      centerText(this.ctx, moneyOffsetX, widthMoneyBlock, this.money) + circleWidth / 2,
      22
    )

    drawCircle(this.ctx, 600, 34, 20, 0, 2 * Math.PI, false, '#b5b5b5')

    // plus money btn
    const plusPic = this.imgs['plus-btn']
    this.ctx.drawImage(plusPic, moneyOffsetX + widthMoneyBlock + 5, 21, 30, 30)
  }

  drawPauseBtn() {
    const pausePic = this.imgs['pause-btn']

    const offsetX = this.areas.pause.coords.x1
    const offsetY = this.areas.pause.coords.y1
    const widthHeightBtn = this.areas.pause.coords.x2 - this.areas.pause.coords.x1

    this.ctx.drawImage(pausePic, offsetX, offsetY, widthHeightBtn, widthHeightBtn)
  }
  pauseHandler = (pos, event) => {
    if (this.boosterActive || this.modalActive || this.moveActive) return
    this.drawModal('Пауза', `Цель: ${this.neededScores} очков`, 'Продолжить')
  }

  drawModal(heading, desc, btnText) {
    this.modalActive = true

    const widthModal = 400
    const heightModal = 450
    const offsetXBlock = this.canvas.width / 2 - widthModal / 2
    const offsetYBlock = this.canvas.height / 2 - heightModal / 2

    const closeModal = () => {
      this.ctx.clearRect(offsetXBlock - 7, offsetYBlock - 7, widthModal + 98, heightModal + 140)

      this.drawProgress()
      this.drawField()
      this.renderMap()
      this.drawMovesAndScores()
      this.drawBonuses(1, '5')
      this.drawBonuses(2, '3')
      this.modalActive = false
    }

    drawRectWithRadius(this.ctx, offsetXBlock, offsetYBlock, widthModal, heightModal, 20)
    this.ctx.lineWidth = 7
    this.ctx.strokeStyle = '#00539e'
    this.ctx.fillStyle = '#011a3b'
    this.ctx.stroke()
    this.ctx.fill()
    this.ctx.closePath()

    // heading
    if (heading === 'Пауза') {
      defineText(this.ctx, '44px', 'Marvin', '#00539e', 'middle')
    } else if (heading === 'Победа!') {
      defineText(this.ctx, '44px', 'Marvin', '#7ae400', 'middle')
    } else if (heading === 'Поражение') {
      defineText(this.ctx, '44px', 'Marvin', '#a70916', 'middle')
    }
    this.ctx.fillText(
      heading,
      centerText(this.ctx, offsetXBlock, widthModal, heading),
      offsetYBlock + 50
    )

    // level
    defineText(this.ctx, '34px', 'Marvin', 'white', 'middle')
    this.ctx.fillText(
      `Уровень: ${this.level}`,
      centerText(this.ctx, offsetXBlock, widthModal, `Уровень: ${this.level}`),
      offsetYBlock + 150
    )

    // scores
    defineText(this.ctx, '24px', 'Marvin', '#a903b6', 'middle')
    this.ctx.fillText(
      desc,
      centerText(this.ctx, offsetXBlock, widthModal, desc),
      offsetYBlock + 200
    )

    // button
    const offsetXButton = offsetXBlock + 30
    const offsetYButton = offsetYBlock + 350
    const widthButton = widthModal - 60
    const heightButton = 80

    drawRectWithRadius(this.ctx, offsetXButton, offsetYButton, widthButton, heightButton, 20)
    this.ctx.fillStyle = '#00539e'
    this.ctx.fill()
    this.ctx.closePath()

    defineText(this.ctx, '24px', 'Marvin', 'white', 'middle')
    this.ctx.fillText(
      btnText,
      centerText(this.ctx, offsetXButton, widthButton, btnText),
      offsetYButton + heightButton / 2
    )

    this.canvas.addEventListener('click', async (e) => {
      const pos = getMousePos(this.canvas, e)

      if (
        pos.x > offsetXButton &&
        pos.x < offsetXButton + widthButton &&
        pos.y > offsetYButton &&
        pos.y < offsetYButton + heightButton
      ) {
        if (btnText === 'Продолжить') {
          closeModal()
        } else if (btnText === 'Заново') {
          // state
          const red = this.colors.red
          const green = this.colors.green
          const yellow = this.colors.yellow
          const blue = this.colors.blue
          const purple = this.colors.purple

          this.map = [
            [red, yellow, green, green, yellow, yellow, red, red, red],
            [red, yellow, green, green, purple, yellow, blue, blue, red],
            [blue, blue, green, green, yellow, yellow, red, red, red],
            [blue, blue, blue, green, yellow, yellow, red, red, red],
            [blue, blue, green, green, purple, yellow, red, red, red],
            [red, green, green, green, purple, red, red, red, red],
            [red, purple, purple, purple, blue, purple, purple, purple, purple],
            [red, green, yellow, green, purple, yellow, red, red, red],
            [red, green, yellow, green, purple, yellow, red, red, red],
          ]
          this.moves = 35
          this.scores = 0
          this.progress = 0
          this.money -= 5

          heading = 'Пауза'
          desc = `Цель: ${this.neededScores} очков`
          btnText = 'Продолжить'

          closeModal()
        } else if (btnText === 'Дальше') {
          // generate a new game field
          this.map = []
          while (this.map.length < 9) {
            this.map.push([])
          }

          for (let i = 0; i < this.map.length; i++) {
            while (this.map[i].length < 9) {
              this.map[i].push(this.generateCube())
            }
          }

          // change state
          if (this.neededScores * 1.02 < this.scores) {
            this.money += 5
          } else if (this.neededScores * 1.05 < this.scores) {
            this.money += 10
          } else if (this.neededScores * 1.2 < this.scores) {
            this.money += 20
          }
          this.level++
          this.moves = 35
          this.scores = 0
          this.progress = 0

          heading = 'Пауза'
          desc = `Цель: ${this.neededScores} очков`
          btnText = 'Продолжить'
          closeModal()
        }
      }
    })
  }

  drawMovesAndScores() {
    const offsetXBlock = 536
    const offsetYBlock = 134
    const widthMovesBlock = 262
    const heightMovesBlock = 246

    // Rounded rectangle
    drawRectWithRadius(this.ctx, offsetXBlock, offsetYBlock, widthMovesBlock, heightMovesBlock, 20)
    this.ctx.lineWidth = 7
    this.ctx.strokeStyle = '#00d2ef'
    this.ctx.fillStyle = '#00539e'
    this.ctx.stroke()
    this.ctx.fill()
    this.ctx.closePath()

    // Circle
    const offsetXCircleMoves = offsetXBlock + widthMovesBlock / 2 - 156 / 2
    const radiusCircle = 156

    const movesPic = this.imgs['moves-round']
    this.ctx.drawImage(movesPic, offsetXCircleMoves, offsetYBlock, radiusCircle, radiusCircle)

    // Text
    defineText(this.ctx, '44px', 'Marvin', 'white', 'middle')

    const centerYText = offsetYBlock + radiusCircle / 2

    this.ctx.fillText(
      this.moves,
      centerText(this.ctx, offsetXCircleMoves, radiusCircle, this.moves),
      centerYText
    )

    // scores block
    const offsetXInner = offsetXBlock + 26
    const widthScoresBlock = 212
    const heightScoresBlock = 86

    drawRectWithRadius(this.ctx, offsetXInner, 285, widthScoresBlock, heightScoresBlock, 20)
    this.ctx.fillStyle = '#011a3b'
    this.ctx.fill()

    const innerText = 'Очки:'
    defineText(this.ctx, '20px', 'Marvin', 'white', 'top')
    this.ctx.fillText(
      innerText,
      centerText(this.ctx, offsetXInner, widthScoresBlock, innerText),
      298
    )

    defineText(this.ctx, '28px', 'Marvin', 'white', 'top')
    this.ctx.fillText(
      this.scores,
      centerText(this.ctx, offsetXInner, widthScoresBlock, this.scores),
      328
    )
  }

  drawBonuses(numberCard, numMoney) {
    const bonusHeading = 'Бонусы'
    defineText(this.ctx, '20px', 'Marvin', 'white', 'top')
    this.ctx.fillText(bonusHeading, 618, 410)

    // Drawing an outer block
    const bonusCardPic = this.imgs['rounded-rectangle']

    const offsetX = 416
    const widthCard = 100
    const heightCard = 104
    const offsetXCard = offsetX + widthCard * numberCard
    const offsetYCard = 444
    this.ctx.drawImage(bonusCardPic, offsetXCard, offsetYCard, widthCard, heightCard)

    let typeBonus = ''
    if (numberCard === 1) {
      typeBonus = 'bomb'
      this.ctx.drawImage(
        this.imgs['bomb'],
        offsetXCard + widthCard / 2 - 35 / 2,
        offsetYCard + 35 / 2,
        35,
        35
      )
    } else if (numberCard === 2) {
      typeBonus = 'teleport'
    } else if (numberCard === 3) {
      typeBonus = 'superTail'
    }
    this.bonusesCoords.push({
      x1: offsetXCard,
      y1: offsetYCard,
      x2: offsetXCard + widthCard,
      y2: offsetYCard + heightCard,
      type: typeBonus,
      widthCard: widthCard,
      heightCard: heightCard,
    })

    // Drawing an inner block
    const heightInner = 26
    const widthInner = 69
    const offsetYInner = offsetX + heightCard - heightInner + 13

    drawRectWithRadius(this.ctx, offsetXCard + 16, offsetYInner, widthInner, heightInner, 15)
    this.ctx.fillStyle = '#3d0355'
    this.ctx.fill()

    // Money symbol creating
    const offsetXCircle = offsetXCard + 16 + widthInner / 2 + 15
    this.ctx.beginPath()
    this.ctx.arc(offsetXCircle, offsetYInner + 13, 9, 0, 2 * Math.PI)
    this.ctx.fillStyle = '#b4b4b4'
    this.ctx.fill()
    this.ctx.closePath()

    // Text creating
    defineText(this.ctx, '18px', 'Marvin', 'white', 'top')

    const centerTextX = offsetXCard + 16 + (widthInner - this.ctx.measureText(numMoney).width) / 2

    this.ctx.fillText(numMoney, centerTextX - 8, offsetYInner + 3)
  }

  selectBonusHandler = (pos, event) => {
    if (!this.modalActive) {
      this.boosterActive = true
      const clickedBonus = this.bonusesCoords.find(
        ({ x1, y1, x2, y2 }) => pos.x >= x1 && pos.x <= x2 && pos.y >= y1 && pos.y <= y2
      )
      if (!clickedBonus) return

      const { x1, y1, type, widthCard, heightCard } = clickedBonus

      const changeCursor = () => {
        if (this.activeBooster === 'bomb' && this.money >= 5) {
          document.body.style.cursor = 'url(assets/images/bomb.png) 10 20, auto'
        } else {
          document.body.style.cursor = 'default'
        }
      }

      const redrawCards = () => {
        this.ctx.clearRect(516, 444, 300, 104)
        this.drawBonuses(1, '5')
        this.drawBonuses(2, '3')
        this.drawBonuses(3, '10')
      }

      if (this.activeBooster === type) {
        redrawCards()
        this.activeBooster = null
        this.boosterActive = false
        document.body.style.cursor = 'default'
      } else {
        redrawCards()
        drawRectWithRadius(this.ctx, x1 + 10, y1 + 5, widthCard - 20, heightCard - 15, 15)
        this.ctx.lineWidth = 4
        this.ctx.strokeStyle = '#3d0355'
        this.ctx.stroke()

        this.activeBooster = type
        changeCursor()
      }
    }
  }

  changeState(numberCubes) {
    const maxProgress = 292

    // Change progress
    const floor = (number, divisor) => Math.floor(number / divisor) * divisor
    const round = (number, divisor) =>
      floor(number, divisor) + Math.round((number % divisor) / divisor) * divisor

    this.progress = round((maxProgress * this.scores) / this.neededScores, 3)
    if (this.scores >= this.neededScores) {
      this.progress = maxProgress
    }

    this.drawProgress()

    // Change moves and scores
    this.moves--
    this.scores += numberCubes
    this.drawMovesAndScores()
  }
  async endGame(shufflesNum) {
    if (this.scores >= this.neededScores && !this.boosterActive) {
      if (this.moves > 0) {
        this.drawModal('Победа!', `Набрано: ${this.scores} + ${this.moves} очков`, 'Дальше')
      } else {
        this.drawModal('Победа!', `Набрано: ${this.scores} очков`, 'Дальше')
      }
    } else if (
      (this.moves <= 0 && this.scores < this.neededScores && !this.boosterActive) ||
      shufflesNum <= 0
    ) {
      this.drawModal('Поражение', `Не хватило ${this.neededScores - this.scores} очков`, 'Заново')
    } else {
      await this.checkNear()
    }
  }

  async initRender() {
    await this.preloadCubesImgs()
    await this.preloadImgs()

    this.addListeners()

    this.drawField()
    this.renderMap()
    this.drawLevelBlock()
    this.drawProgress()
    this.drawMoneyBlock()
    this.drawPauseBtn()
    this.drawMovesAndScores()
    this.drawBonuses(1, '5')
    this.drawBonuses(2, '3')
    this.drawBonuses(3, '10')
  }
}
