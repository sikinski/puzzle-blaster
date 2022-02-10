// drawing
export const drawRectWithRadius = (ctx, x, y, width, height, r) => {
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

export const drawHalfRectWithRadius = (ctx, x, y, width, height, r) => {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + width, y)
  ctx.arc(x + width - r, y + height - r, r, 0, Math.PI / 2)
  ctx.lineTo(x + r, y + height)
  ctx.arc(x + r, y + height - r, r, Math.PI / 2, Math.PI)
  ctx.lineTo(x, y)
  ctx.closePath()
}

// loading
export const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.src = src
    image.addEventListener('load', () => resolve(image), { once: true })
    image.addEventListener('load', reject, { once: true })
  })

// text
export const defineText = (ctx, fz, font, color, baseline) => {
  ctx.font = `${fz} ${font}`
  ctx.fillStyle = `${color}`
  ctx.textBaseline = `${baseline}`
}

export const centerText = (ctx, offsetX, widthBlock, text) => {
  return offsetX + widthBlock / 2 - ctx.measureText(text).width / 2
}
export const animate = (animationTime, frameCallback, timingFunction) =>
  new Promise((resolve) => {
    let startTime = null

    requestAnimationFrame(async function frameHandler(currentTime) {
      if (!startTime) {
        startTime = currentTime
      }

      const timeDelta = currentTime - startTime
      const progress = Math.min(timeDelta / animationTime, 1)
      const animationProgress = timingFunction(progress)

      await frameCallback(animationProgress)

      if (progress === 1) return resolve()

      requestAnimationFrame(frameHandler)
    })
  })

export const getMousePos = (canvas, e) => {
  const rect = canvas.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
}
