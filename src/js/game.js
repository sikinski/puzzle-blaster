import {
  drawRectWithRadius,
  drawHalfRectWithRadius,
  loadImage,
  defineText,
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
    this.money = 300
    this.moves = 30
    this.scores = 0

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
      [red, purple, purple, purple, null, purple, purple, purple, purple],
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
  }

  //___Methods___

  async preloadCubesImgs() {
    this.cubeImages = Object.fromEntries(
      await Promise.all(
        this.cubesPaths.map(async ({ name, path }) => [name, await loadImage(path)])
      )
    );
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
  // changeState() {

  // }
  changeCubesOnClick() {
    this.canvas.addEventListener('click', async (e) => {
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
      let willGenerate = new Set()

      processed.push(cubeIndex)

      while (processed.length) {
        const current = processed.shift()
        console.log(current)

        willGenerate.add(current)

        const leftCube = current - 1
        const rightCube = current + 1
        const topCube = current - 9
        const bottomCube = current + 9

        // to left
        if (
          (leftCube + 1) % 9 &&
          leftCube >= 0 &&
          this.getCubeByIndex(leftCube) === clickedColor &&
          !willGenerate.has(leftCube)
        ) {
          processed.push(leftCube)
        }
        // to top
        if (
          topCube > 0 &&
          this.getCubeByIndex(topCube) === clickedColor &&
          !willGenerate.has(topCube)
        ) {
          processed.push(topCube)
        }
        // to right
        if (
          !(rightCube % 9 === 0) &&
          rightCube < 81 &&
          this.getCubeByIndex(rightCube) === clickedColor &&
          !willGenerate.has(rightCube)
        ) {
          processed.push(rightCube)
        }
        // to bottom
        if (
          bottomCube < 81 &&
          this.getCubeByIndex(bottomCube) === clickedColor &&
          !willGenerate.has(bottomCube)
        ) {
          processed.push(bottomCube)
        }
        console.log(willGenerate)
      }

      if (willGenerate.size > 3) {
        for (let cube of willGenerate) {
          this.map[Math.floor(cube / this.map.length)][cube % this.map.length] = null
        }
      }
      this.ctx.clearRect(44, 120, 400, 440)
      this.drawField()
      this.renderMap()
    })
  }

  async drawLevelBlock() {
    const levelPic = await loadImage('./assets/images/level-block.png')

    const marginText = 25
    const circleWidth = 32
    const levelOffsetX = 99
    const widthText = this.ctx.measureText(this.level)

    const widthLevelBlock = widthText.width + circleWidth + marginText * 2
    const centerTextX = levelOffsetX + (widthLevelBlock - widthText.width) / 2 + circleWidth / 2

    // block image
    this.ctx.drawImage(levelPic, levelOffsetX, 14, widthLevelBlock, 38)

    // text
    defineText(this.ctx, '20px', 'Marvin', 'white', 'top')
    this.ctx.fillText(this.level, centerTextX, 22)

    // circle
    this.ctx.beginPath()
    this.ctx.arc(119, 32, 20, 0, 2 * Math.PI, false)
    this.ctx.fillStyle = '#b5b5b5'
    this.ctx.fill()
    this.ctx.closePath()
  }

  drawProgress() {
    const maxWidthProgressLine = 307
    const progressHeading = 'Прогресс'

    // block
    drawHalfRectWithRadius(this.ctx, 227, 0, 327, 62, 20)
    this.ctx.fillStyle = '#0c2e5c'
    this.ctx.fill()
    this.ctx.closePath()

    // text
    defineText(this.ctx, '17px', 'Marvin', 'white', 'top')
    this.ctx.fillText(progressHeading, 350, 5)

    // bg progress line
    drawRectWithRadius(this.ctx, 235, 27, maxWidthProgressLine, 24, 15)
    this.ctx.fillStyle = '#011a3b'
    this.ctx.fill()
    this.ctx.closePath()

    // actual progress line
    drawRectWithRadius(this.ctx, 235, 27, this.progress, 24, 15)
    if (this.progress > 30) {
      this.ctx.fillStyle = '#7ae400'
      this.ctx.fill()
    }
    this.ctx.closePath()
  }

  async drawMoneyBlock() {
    const moneyPic = await loadImage('./assets/images/money-block.png')

    const marginText = 25
    const circleWidth = 32
    const moneyOffsetX = 583
    const widthText = this.ctx.measureText(this.money).width 
    const widthMoneyBlock = widthText + circleWidth + marginText * 2

    const centerTextX = moneyOffsetX + (widthMoneyBlock - widthText) / 2 + circleWidth / 2

    // block image
    this.ctx.drawImage(moneyPic, moneyOffsetX, 16, widthMoneyBlock, 38)

    // text
    defineText(this.ctx, '20px', 'Marvin', 'white', 'top')
    this.ctx.fillText(this.money, centerTextX, 22)

    // circle
    this.ctx.beginPath()
    this.ctx.arc(600, 34, 20, 0, 2 * Math.PI, false)
    this.ctx.fillStyle = '#b5b5b5'
    this.ctx.fill()
    this.ctx.closePath()

    // plus money btn
    const plusPic = await loadImage('assets/images/plus.png')

    this.ctx.drawImage(plusPic, moneyOffsetX + widthMoneyBlock + 5, 21, 30, 30)
  }

  async drawPauseBtn() {
    const pausePic = await loadImage('assets/images/pause.png')

    this.ctx.drawImage(pausePic, 776, 5, 67, 67)
  }

  async drawMovesAndScores() {
    const offsetXTurns = 536
    const offsetYTurns = 134
    const widthMovesBlock = 262

    drawRectWithRadius(this.ctx, offsetXTurns, offsetYTurns, widthMovesBlock, 246, 20)
    this.ctx.lineWidth = 7
    this.ctx.strokeStyle = '#00d2ef'
    this.ctx.fillStyle = '#00539e'
    this.ctx.stroke()
    this.ctx.fill()
    this.ctx.closePath()

    const offsetXCircleMoves = offsetXTurns + 156 / 2.8 

    const movesPic = await loadImage('assets/images/moves.png')

    this.ctx.drawImage(movesPic, offsetXCircleMoves, offsetYTurns, 156, 156)

    // Text
    const centerMovesX = offsetXCircleMoves + 156 / 2 - this.ctx.measureText(this.moves).width
    const centerMovesY = offsetYTurns + 156 / 2.8

    defineText(this.ctx, '44px', 'Marvin', 'white', 'right')
    this.ctx.fillText(this.moves, centerMovesX, centerMovesY)

    // scores block
    const widthScoresBlock = 212
    drawRectWithRadius(this.ctx, offsetXTurns + 26, 285, widthScoresBlock, 86, 20)
    this.ctx.fillStyle = '#011a3b'
    this.ctx.fill()

    const innerText = `Очки:`
    const centerInnerX =
      offsetXTurns + 26 + widthScoresBlock / 2 - this.ctx.measureText(innerText).width / 4

    defineText(this.ctx, '20px', 'Marvin', 'white', 'top')
    this.ctx.fillText(innerText, centerInnerX, 298)

    const centerScoresX =
      offsetXTurns + 26 + widthScoresBlock / 2 - this.ctx.measureText(this.scores).width / 2

    defineText(this.ctx, '28px', 'Marvin', 'white', 'top')
    this.ctx.fillText(this.scores, centerScoresX, 328)
  }

  async drawBonuses(numberCard, numMoney) {
    const bonusHeading = 'Бонусы'
    defineText(this.ctx, '20px', 'Marvin', 'white', 'top')
    this.ctx.fillText(bonusHeading, 618, 410)

    // Drawing an outer block
    const bonusCardPic = await loadImage('./assets/images/roundedRectangle.png')

    const offsetX = 412
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
  async initRender() {
    await this.preloadCubesImgs()
    this.drawField()
    this.renderMap()
    this.changeCubesOnClick()
    await this.drawLevelBlock()
    this.drawProgress()
    await this.drawMoneyBlock()
    await this.drawPauseBtn()
    await this.drawMovesAndScores()
    await this.drawBonuses(1, '5')
    await this.drawBonuses(2, '3')
    await this.drawBonuses(3, '10')
  }
}
