import '@/styles/index.scss'

// import { createCanv } from '@/js/main';
const canvas = document.getElementById('screen');
    console.log(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = 1086;
    canvas.height = 605;
    console.log(ctx)
// createCanv();

//----------------- Libs -----------------
const cubes = {
    'red': '',
    'green': '',
    'yellow': '',
    'violet': '',
    'blue': ''
};

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

    console.log('draw is working')
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