import { drawRectWithRadius, drawHalfRectWithRadius, loadImage, defineText } from './utils.js'

export class Game {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    this.canvas.width = 856
    this.canvas.height = 605
    this.init()
  }

  init() {
    this.level = '1'
    this.progress = 0
    this.money = '300'
    this.moves = '30'
    this.scores = '0'
  }

  //___Methods___

  drawField() {
    drawRectWithRadius(this.ctx, 32, 107, 395, 430, 20)
    this.ctx.lineWidth = 7
    this.ctx.strokeStyle = '#252e6d'
    this.ctx.fillStyle = '#020526'
    this.ctx.fill()
    this.ctx.stroke()
  }

  async drawLevelBlock() {
    const levelPic = await loadImage('./assets/images/level-block.png')
  
    const marginText = 25
    const circleWidth = 32
    const levelOffsetX = 99

    const widthLevelBlock = this.ctx.measureText(this.level).width + circleWidth + marginText * 2

    const centerTextX = levelOffsetX + (widthLevelBlock - this.ctx.measureText(this.level).width) / 2 + circleWidth / 2
  
    // block image
    this.ctx.drawImage(levelPic, levelOffsetX, 14, widthLevelBlock, 38)
  
    // text
    defineText(this.ctx,'20px', 'Marvin', 'white', 'top')
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
    defineText(this.ctx,'17px', 'Marvin', 'white', 'top')
    this.ctx.fillText(progressHeading, 350, 5)

    // bg progress line
    drawRectWithRadius(this.ctx, 235, 27, maxWidthProgressLine, 24, 15)
    this.ctx.fillStyle = '#011a3b'
    this.ctx.fill()
    this.ctx.closePath()

    // actual progress line
    drawRectWithRadius(this.ctx, 235, 27, this.progress, 24, 15)
    if (this.progress < 30) {
      this.ctx.fillStyle = '#0c2e5c'
    } else {
      this.ctx.fillStyle = '#7ae400'
    }
    this.ctx.fill()
    this.ctx.closePath()
  }

  async drawMoneyBlock() {
    const moneyPic = await loadImage('./assets/images/money-block.png')

    const marginText = 25
    const circleWidth = 32
    const moneyOffsetX = 583

    const widthMoneyBlock = this.ctx.measureText(this.money).width + circleWidth + marginText * 2

    const centerTextX = moneyOffsetX + (widthMoneyBlock - this.ctx.measureText(this.money).width) / 2 + circleWidth / 2
  
    // block image
    this.ctx.drawImage(moneyPic, moneyOffsetX, 16, widthMoneyBlock, 38)
  
    // text
    defineText(this.ctx,'20px', 'Marvin', 'white', 'top')
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

    const offsetXCircleMoves = offsetXTurns + 156 / 2.8 // 2.8 because shadow

    const movesPic = await loadImage('assets/images/moves.png')

    this.ctx.drawImage(movesPic, offsetXCircleMoves, offsetYTurns, 156, 156)

    // Text
    const centerMovesX = offsetXCircleMoves + 156 / 2 - this.ctx.measureText(this.moves).width
    const centerMovesY = offsetYTurns + 156 / 2.8

    defineText(this.ctx,'44px', 'Marvin', 'white', 'right')
    this.ctx.fillText(this.moves, centerMovesX, centerMovesY)


    // scores block
    const widthScoresBlock = 212
    drawRectWithRadius(this.ctx, offsetXTurns + 26, 285, widthScoresBlock, 86, 20)
    this.ctx.fillStyle = '#011a3b'
    this.ctx.fill()

    const innerText = `Очки:`
    const centerInnerX = offsetXTurns + 26 + widthScoresBlock / 2 - this.ctx.measureText(innerText).width / 4

    defineText(this.ctx, '20px', 'Marvin', 'white', 'top')
    this.ctx.fillText(innerText, centerInnerX, 298)

    const centerScoresX =
      offsetXTurns + 26 + widthScoresBlock / 2 - this.ctx.measureText(this.scores).width / 2

    defineText(this.ctx,'28px', 'Marvin', 'white', 'top')
    this.ctx.fillText(this.scores, centerScoresX, 328) 
  }

  async drawBonuses (numberCard, numMoney) {
    const bonusHeading = 'Бонусы'
    defineText(this.ctx,'20px', 'Marvin', 'white', 'top')
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

    defineText(this.ctx,'18px', 'Marvin', 'white', 'top')
    this.ctx.fillText(numMoney, centerTextX - 8, offsetYInner + 3)
  }
  async initRender() {
      this.drawField()
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