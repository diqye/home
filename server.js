let { createProxyMiddleware } = require('http-proxy-middleware')
let { createServer } = require('http')
let next = require('next')
let { parse } = require('url')
let host = "localhost"
let port = 3000
let app = next({dev:true,host,port})
const handle = app.getRequestHandler()
let proxy= createProxyMiddleware('/api/**', {
  target: "http://localhost:8899",
  ws: true, // enable proxying WebSockets
  pathRewrite: { "^/api": "" }, // remove `/api/proxy` prefix
})
// let proxy= createProxyMiddleware('/api/**', {
//   target: "http://www.diqye.com",
//   ws: true, // enable proxying WebSockets
// })

app.prepare().then(() => {
  let server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${host}:${port}`)
  })
  server.on("upgrade",(req,socket,head)=>{
    proxy.upgrade(req,socket,head)
  })
})