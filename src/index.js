import '@/styles/index.scss'

// import { createCanv } from '@/js/main';
const canvas = document.getElementById('screen')
// console.log(canvas)
const ctx = canvas.getContext('2d')
canvas.width = 1086
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

  // console.log('draw is working')
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

let circleWidth = 32

//----------------- Level -----------------

const createLevelBtn = () => {
  ctx.font = '20px robota'
  ctx.strokeStyle = 'white'
  ctx.textBaseline = 'top'

  let text = ` `

  let textMetrics = ctx.measureText(text)
  // console.log(textMetrics)

  let blockWidth = textMetrics.width + circleWidth + 25

  drawRectWithRadius(99, 14, blockWidth, 38, 20)
  ctx.fillStyle = '#003683'
  ctx.fill()
  ctx.closePath()

  ctx.strokeText(text, 150, 25)

  ctx.beginPath()
  ctx.arc(119, 32, 20, 0, 2 * Math.PI, false)
  ctx.fillStyle = '#b5b5b5'
  ctx.fill()
  ctx.closePath()
}
createLevelBtn()

//----------------- Progress -----------------
const createProgress = () => {
  drawHalfRectWithRadius(227, 0, 327, 62, 20)
  ctx.fillStyle = 'white'
  ctx.fill()
  ctx.closePath()

  drawRectWithRadius(235, 27, 307, 24, 15)
  ctx.fillStyle = '#003683'
  ctx.fill()
  ctx.closePath()
}
createProgress()

//----------------- Money -----------------

const createMoneyBtn = () => {
  ctx.font = '20px robota'
  ctx.strokeStyle = 'white'
  ctx.textBaseline = 'top'

  let text = ` `

  let textMetrics = ctx.measureText(text)
  // console.log(textMetrics)
  let blockWidth = textMetrics.width + circleWidth + 25

  drawRectWithRadius(583, 16, blockWidth, 38, 20)
  ctx.fillStyle = '#003683'
  ctx.fill()
  ctx.closePath()

  ctx.strokeText(text, 620, 25)

  ctx.beginPath()
  ctx.arc(600, 34, 20, 0, 2 * Math.PI, false)
  ctx.fillStyle = '#b5b5b5'
  ctx.fill()
  ctx.closePath()

  let plusMoney = new Image()
  plusMoney.src = './images/plus.png'
}
createMoneyBtn()

//----------------- Plus money button -----------------

const loadImage = (src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.addEventListener('load', () => resolve(image), { once: true });
    image.addEventListener('load', reject, { once: true });

});


async function main() {
    const plusPic = await loadImage('assets/cimages/green.png');
  
    ctx.drawImage(plusPic, 699, 33, 30, 30);
}

main()

// //----------------- Pause -----------------

// const createPauseBtn = () => {
//     drawRectWithRadius(583, 16, 90, 38, 20)
//     ctx.fillStyle = '#003683'
//     ctx.fill()
//     ctx.closePath()

//     ctx.beginPath();
//     ctx.arc(600, 34, 20, 0, 2*Math.PI, false);
//     ctx.fillStyle = '#b5b5b5'
//     ctx.fill();
//     ctx.closePath();

//     ctx.font = "20px robota";
//     ctx.strokeStyle = "white";
//     ctx.textBaseline = 'top';
//     ctx.strokeText(`6478`, 620, 25);
// }
// createPauseBtn();
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
