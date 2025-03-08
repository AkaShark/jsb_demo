import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import compression from 'compression'
import serveStatic from 'serve-static'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const port = process.env.PORT || 3000

// 启用 gzip 压缩
app.use(compression())

// 提供静态文件服务
app.use(serveStatic(resolve(__dirname, 'dist'), {
  maxAge: '1y', // 设置长缓存
  setHeaders: (res, path) => {
    // 对 HTML 文件不进行缓存
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache')
    }
  }
}))

// 所有请求都返回 index.html
app.get('*', (req, res) => {
  res.sendFile(resolve(__dirname, 'dist', 'index.html'))
})

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`)
}) 