import {
  drawRectWithRadius,
  drawHalfRectWithRadius,
  loadImage,
  defineText,
  centerText,
  getMousePos,
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
    this.maxProgress = 307
    this.money = 300
    this.moves = 30
    this.scores = 0
    this.neededScores = 165

    this.colors = {
      red: 'red',
      green: 'green',
      yellow: 'yellow',
      blue: 'blue',
      purple: 'purple',
    }

    const red = this.colors.red
    const green = this.colors.green
    const yellow = this.colors.yellow
    const blue = this.colors.blue
    const purple = this.colors.purple

    this.coords = []

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
    ]
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

        this.coords.push([
          offsetXField,
          offsetXField + widthCube,
          offsetYField,
          offsetYField + heightCube,
        ])
        offsetXField += widthCube
      }
      offsetXField = 44
      offsetYField += heightCube
    }
  }
  drawField() {
    drawRectWithRadius(this.ctx, 32, 107, 400, 440, 20)
    this.ctx.lineWidth = 7
    this.ctx.strokeStyle = '#252e6d'
    this.ctx.fillStyle = '#020526'
    this.ctx.fill()
    this.ctx.stroke()

    this.renderMap()
  }

  getCubeByIndex(index) {
    return this.map[Math.floor(index / this.map.length)][index % this.map.length]
  }

  changeCubesOnClick() {
    this.canvas.addEventListener('click', async (e) => {
      if (this.moves <= 0) return

      const generateCube = () => {
        const colors = Object.keys(this.colors)
        return colors[Math.floor(Math.random() * colors.length)]
      }

      const pos = getMousePos(this.canvas, e)

      const cubeIndex = this.coords.findIndex(
        ([x1, x2, y1, y2]) => pos.x >= x1 && pos.x <= x2 && pos.y >= y1 && pos.y <= y2
      )

      if (cubeIndex === -1) return

      const row = Math.floor(cubeIndex / this.map.length)
      const col = cubeIndex % this.map.length

      // Algorithm to find all the same cubes on click
      const clickedColor = this.map[row][col]

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
          this.getCubeByIndex(leftCube) === clickedColor &&
          !selectedCubes.has(leftCube)
        ) {
          processed.push(leftCube)
        }
        // to top
        if (
          topCube > 0 &&
          this.getCubeByIndex(topCube) === clickedColor &&
          !selectedCubes.has(topCube)
        ) {
          processed.push(topCube)
        }
        // to right
        if (
          !(rightCube % 9 === 0) &&
          rightCube < 81 &&
          this.getCubeByIndex(rightCube) === clickedColor &&
          !selectedCubes.has(rightCube)
        ) {
          processed.push(rightCube)
        }
        // to bottom
        if (
          bottomCube < 81 &&
          this.getCubeByIndex(bottomCube) === clickedColor &&
          !selectedCubes.has(bottomCube)
        ) {
          processed.push(bottomCube)
        }
      }

      if (selectedCubes.size < 3) return
      for (let cube of selectedCubes) {
        this.map[Math.floor(cube / this.map.length)][cube % this.map.length] = null
      }
      this.ctx.clearRect(44, 120, 400, 440)
      this.drawField()
      this.renderMap()

      // Falling
      let cols = []

      for (let i = 0; i < this.map.length; i++) {
        let col = []
        for (let j = 0; j < this.map[i].length; j++) {
          if (this.map[j][i] !== null) {
            col.push(this.map[j][i])
          }
        }
        while (col.length < this.map.length) {
          col.unshift(generateCube())
        }
        cols.push(col)
      }

      for (let i = 0; i < this.map.length; i++) {
        for (let j = this.map[i].length - 1; j >= 0; j--) {
          this.map[j][i] = cols[i][j]
        }
      }

      this.changeState(selectedCubes.size)
      this.ctx.clearRect(44, 120, 400, 440)
      this.drawField()
      this.renderMap()
    })
  }
  в

  drawLevelBlock() {
    const levelPic = this.imgs['level-block']

    const marginText = 25
    const circleWidth = 32
    const levelOffsetX = 99

    defineText(this.ctx, '20px', 'Marvin', 'white', 'top')

    const widthLevelBlock = this.ctx.measureText(this.level).width + circleWidth + marginText * 2

    // block image
    this.ctx.drawImage(levelPic, levelOffsetX, 14, widthLevelBlock, 38)

    // text
    this.ctx.fillText(
      this.level,
      centerText(this.ctx, levelOffsetX, widthLevelBlock, this.level) + circleWidth / 2,
      22
    )

    // circle
    this.ctx.beginPath()
    this.ctx.arc(119, 32, 20, 0, 2 * Math.PI, false)
    this.ctx.fillStyle = '#b5b5b5'
    this.ctx.fill()
    this.ctx.closePath()
  }

  drawProgress() {
    const progressHeading = 'Прогресс'

    // block
    const offsetXBlock = 227
    const widthBlock = 327
    drawHalfRectWithRadius(this.ctx, offsetXBlock, 0, widthBlock, 62, 20)
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
    drawRectWithRadius(this.ctx, 235, 27, this.maxProgress, 24, 15)
    this.ctx.fillStyle = '#011a3b'
    this.ctx.fill()
    this.ctx.closePath()

    // actual progress line
    if (this.progress <= this.maxProgress) {
      drawRectWithRadius(this.ctx, 235, 27, this.progress, 24, 15)
      if (this.progress > 30) {
        this.ctx.fillStyle = '#7ae400'
        this.ctx.fill()
      }
      this.ctx.closePath()
    } else {
      drawRectWithRadius(this.ctx, 235, 27, this.maxProgress, 24, 15)
      this.ctx.fillStyle = '#7ae400'
      this.ctx.fill()
      this.ctx.closePath()
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

    // block image
    this.ctx.drawImage(moneyPic, moneyOffsetX, 16, widthMoneyBlock, 38)

    // text
    this.ctx.fillText(
      this.money,
      centerText(this.ctx, moneyOffsetX, widthMoneyBlock, this.money) + circleWidth / 2,
      22
    )

    // circle
    this.ctx.beginPath()
    this.ctx.arc(600, 34, 20, 0, 2 * Math.PI, false)
    this.ctx.fillStyle = '#b5b5b5'
    this.ctx.fill()
    this.ctx.closePath()

    // plus money btn
    const plusPic = this.imgs['plus-btn']
    this.ctx.drawImage(plusPic, moneyOffsetX + widthMoneyBlock + 5, 21, 30, 30)
  }

  drawPauseBtn() {
    const pausePic = this.imgs['pause-btn']

    this.ctx.drawImage(pausePic, 776, 5, 67, 67)
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
    this.ctx.drawImage(bonusCardPic, offsetXCard, 444, widthCard, heightCard)

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
    this.ctx.font = '20px Marvin'
    // let bonusMoney = numMoney

    const centerTextX = offsetXCard + 16 + (widthInner - this.ctx.measureText(numMoney).width) / 2

    defineText(this.ctx, '18px', 'Marvin', 'white', 'top')
    this.ctx.fillText(numMoney, centerTextX - 8, offsetYInner + 3)
  }
  changeState(numberCubes) {
    // Change progress
    const floor = (number, divisor) => Math.floor(number / divisor) * divisor
    const round = (number, divisor) =>
      floor(number, divisor) + Math.round((number % divisor) / divisor) * divisor

    this.progress = round((this.maxProgress * this.scores) / this.neededScores, 30)
    if (this.scores >= this.neededScores) {
      this.progress === this.maxProgress
    }

    this.drawProgress()

    // Change moves and scores
    this.moves--
    this.scores += numberCubes
    this.drawMovesAndScores()
  }

  async initRender() {
    await this.preloadCubesImgs()
    await this.preloadImgs()
    this.drawField()
    this.renderMap()
    this.changeCubesOnClick()
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
