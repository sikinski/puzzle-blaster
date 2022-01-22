import '@/styles/index.scss'

// import { createCanv } from '@/js/main';
const canvas = document.getElementById('screen')
// console.log(canvas)
const ctx = canvas.getContext('2d')
canvas.width = 856
canvas.height = 605
// console.log(ctx)
// createCanv();

//----------------- Libs -----------------
const Lib = (screen, controls) => {
  // Scene.apply(this, arguments);
  this.cubes = [
    { name: 'red', path: './images/red.png' },
    { name: 'green', path: './images/green.png' },
    { name: 'blue', path: './images/blue.png' },
    { name: 'violet', path: './images/violet.png' },
    { name: 'yellow', path: './images/yellow.png' },
  ]
}

//----------------- Fns -----------------

const drawRectWithRadius = (x, y, width, height, r) => {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.arc(x + width - r, y + r, r, -Math.PI / 2, 0)
  ctx.lineTo(x + width, y + height - r)
  ctx.arc(x + width - r, y + height - r, r, 0, Math.PI / 2)
  ctx.lineTo(x + r, y + height)
  ctx.arc(x + r, y + height - r, r, Math.PI / 2, Math.PI)
  ctx.lineTo(x, y + r)
  ctx.arc(x + r, y + r, r, Math.PI, (Math.PI * 3) / 2)
  ctx.closePath()

}
const drawHalfRectWithRadius = (x, y, width, height, r) => {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + width, y)
  ctx.arc(x + width - r, y + height - r, r, 0, Math.PI / 2)
  ctx.lineTo(x + r, y + height)
  ctx.arc(x + r, y + height - r, r, Math.PI / 2, Math.PI)
  ctx.lineTo(x, y)
  ctx.closePath()
}

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.src = src;
  image.addEventListener('load', () => resolve(image), { once: true });
  image.addEventListener('load', reject, { once: true })
});

const toFillText = (fz, font, color, baseline) => {
  ctx.font = `${fz} ${font}`;
  ctx.fillStyle = `${color}`;
  ctx.textBaseline = `${baseline}`;
}

//----------------- Field -----------------

const createField = () => {
  drawRectWithRadius(32, 107, 395, 430, 20)
  ctx.lineWidth = 7
  ctx.strokeStyle = '#252e6d'
  ctx.fillStyle = '#020526'
  ctx.fill()
  ctx.stroke()
}
createField()

let marginText = 25
const circleWidth = 32

//----------------- Level -----------------

async function createLevelBlock() {
  const levelPic = await loadImage('assets/images/button1.png');

  const levelOffsetX = 99;
  let level = `20`
  let blockWidth = ctx.measureText(level).width + circleWidth + marginText * 2
  let centerTextX = levelOffsetX + ((blockWidth - ctx.measureText(level).width) / 2) + (circleWidth / 2)
  
  // block image
  ctx.drawImage(levelPic, levelOffsetX, 14, blockWidth, 38);

  // text
  toFillText("20px", 'Marvin', 'white', 'top');
  ctx.fillText(level, centerTextX, 22)

  // circle
  ctx.beginPath()
  ctx.arc(119, 32, 20, 0, 2 * Math.PI, false)
  ctx.fillStyle = '#b5b5b5'
  ctx.fill()
  ctx.closePath()
}
createLevelBlock()

//----------------- Progress -----------------
const maxWidthProgress = 307
let actualWidthProgress  = 30;
const createProgress = () => {
  drawHalfRectWithRadius(227, 0, 327, 62, 20)
  ctx.fillStyle = '#0c2e5c'
  ctx.fill()
  ctx.closePath()

  toFillText('17px', 'Marvin', 'white', 'top');
  ctx.fillText('Прогресс', 350, 5)

  drawRectWithRadius(235, 27, maxWidthProgress, 24, 15)
  ctx.fillStyle = '#011a3b'
  ctx.fill()
  ctx.closePath()

  drawRectWithRadius(235, 27, actualWidthProgress, 24, 15)
  ctx.fillStyle = '#7ae400'
  ctx.fill()
  ctx.closePath()
}
createProgress()

//----------------- Money -----------------
let blockWidth;

let moneyOffsetX = 583

async function createMoneyBlock() {
  const moneyPic = await loadImage('assets/images/button2.png');

  let money = `20000`
  let blockWidth = ctx.measureText(money).width + circleWidth +  marginText * 2
  let centerTextX = moneyOffsetX + ((blockWidth - ctx.measureText(money).width) / 2) + (circleWidth / 2)
  
  // block image
  ctx.drawImage(moneyPic, moneyOffsetX, 16, blockWidth, 38);
  
  // text
  toFillText("20px", 'Marvin', 'white', 'top');
  ctx.fillText(money, centerTextX, 22)

  // circle 
  ctx.beginPath()
  ctx.arc(600, 34, 20, 0, 2 * Math.PI, false)
  ctx.fillStyle = '#b5b5b5'
  ctx.fill()
  ctx.closePath()

  async function createPlusBtn() {
    const plusPic = await loadImage('assets/images/plus.png');
  
    ctx.drawImage(plusPic, moneyOffsetX + blockWidth + 5, 21, 30, 30);
}
createPlusBtn()
}
createMoneyBlock();

//----------------- Plus money button -----------------



//----------------- Pause button -----------------

async function createPauseBtn() {
  const pausePic = await loadImage('assets/images/pause.png');

  ctx.drawImage(pausePic, 776, 5, 67, 67);
}
createPauseBtn()

//----------------- Turn and scores -----------------
const offsetXTurns = 536;
const offsetYTurns = 134;
const widthBlock = 262;

const turnsRender = () => {
  drawRectWithRadius(offsetXTurns, offsetYTurns, widthBlock, 246, 20)
  ctx.lineWidth = 7
  ctx.strokeStyle = '#00d2ef'
  ctx.fillStyle = '#00539e'
  ctx.stroke()
  ctx.fill()
  ctx.closePath()

  //569  285y
  let offsetXCircle = offsetXTurns + (156 / 2.8) // 2.8 because shadow

  async function createScores () {
    const movesPic = await loadImage('assets/images/moves.png');
  
    ctx.drawImage(movesPic, offsetXCircle, offsetYTurns, 156, 156);

    // Text
    let moves = `37`
    const textMetrics = ctx.measureText(moves)
    const centerMovesX = (offsetXCircle + 156 /2) - textMetrics.width
    const centerMovesY = (offsetYTurns + 156 / 2.8) 

    toFillText("44px", 'Marvin', 'white', 'right');
    ctx.fillText(moves, centerMovesX, centerMovesY)
  }
  createScores()

  const widthScoresBlock = 212
  drawRectWithRadius(offsetXTurns + 26, 285, widthScoresBlock, 86, 20)
  ctx.fillStyle = '#011a3b'
  ctx.fill()

  const innerText = `Очки: `
  const centerInnerX = ((offsetXTurns + 26) + widthScoresBlock / 2) - (ctx.measureText(innerText).width / 2.8)

  toFillText("20px", 'Marvin', 'white', 'top');
  ctx.fillText(innerText, centerInnerX, 298)

  let points = `221`
  const centerPointsX = ((offsetXTurns + 26) + widthScoresBlock / 2) - (ctx.measureText(points).width / 2)

  toFillText("28px", 'Marvin', 'white', 'top');
  ctx.fillText(points, centerPointsX, 328)

}
turnsRender();

//----------------- Bonuses -----------------

const createBonuses = () => {
  toFillText("20px", 'Marvin', 'white', top);
  ctx.fillText('Бонусы', 618, 410)


  async function createBonusCard(numberCard, numMoney) {
    // Drawing an outer block
    const bonusCardPic = await loadImage('assets/images/roundedRectangle.png');
    const offsetX = 412;
    const widthCard = 100;
    const heightCard = 104;
    const offsetXCard = offsetX + (widthCard * numberCard)
    ctx.drawImage(bonusCardPic, offsetXCard, 444, widthCard, heightCard);

    // Drawing an inner block
    const heightInner = 26
    const widthInner = 69
    const offsetYInner = ((offsetX + heightCard) - heightInner) + 13
    drawRectWithRadius(offsetXCard + 16, offsetYInner, widthInner, heightInner, 15)
    ctx.fillStyle = '#3d0355'
    ctx.fill()

    // Money symbol creating
    let circleX = ((offsetXCard + 16) + (widthInner / 2) + 15)
    ctx.beginPath()
    ctx.arc(circleX, offsetYInner + 13, 9, 0, 2 * Math.PI)
    ctx.fillStyle = '#b4b4b4'
    ctx.fill()
    ctx.closePath()

    // Text creating
    ctx.font = '20px Marvin'
    let bonusMoney = `${numMoney}`
    let textMetrics = ctx.measureText(bonusMoney)
    
    let centerTextX = (offsetXCard + 16) + ((widthInner - textMetrics.width) / 2)

    toFillText("18px", 'Marvin', 'white', top);
    ctx.fillText(bonusMoney, centerTextX - 8, offsetYInner + 3)      

  }
  createBonusCard(1, '5');
  createBonusCard(2, '3');
  createBonusCard(3, '10');
}
createBonuses();

// // Test import of a JavaScript module
// import { example } from '@/js/example'

// // Test import of an asset
// import webpackLogo from '@/images/webpack-logo.svg'

// // Appending to the DOM
// const logo = document.createElement('img')
// logo.src = webpackLogo

// const heading = document.createElement('h1')
// heading.textContent = example()

// // Test a background image url in CSS
// const imageBackground = document.createElement('div')
// imageBackground.classList.add('image')

// // Test a public folder asset
// const imagePublic = document.createElement('img')
// imagePublic.src = '/assets/example.png'

// const app = document.querySelector('#root')
// app.append(logo, heading, imageBackground, imagePublic)