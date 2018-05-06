const http = require('http')
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs')
const config = require('./utils/config')

app.use(cors())
app.use(bodyParser.json())

app.use(middleware.logger)

app.use('/api/blogs', blogsRouter)

app.use(middleware.error)

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const mongoUrl = config.mongoUrl

mongoose.connect(mongoUrl).then( () => {
  console.log('connected to database', mongoUrl)
}).catch( err => {
  console.log(err)
})

const server = http.createServer(app)

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})

server.on('close', () => {
  mongoose.connection.close()
})

module.exports = {
  app,
  server,
}