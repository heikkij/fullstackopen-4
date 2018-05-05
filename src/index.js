const express = require('express')
const mongoose = require('mongoose')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs')

app.use(cors())
app.use(bodyParser.json())

app.use(middleware.logger)

app.use('/api/blogs', blogsRouter)

app.use(middleware.error)

require('dotenv').config()

const mongoUrl = process.env.MONGODB_URI

mongoose.connect(mongoUrl).then( () => {
  console.log('connected to database', process.env.MONGODB_URI)
}).catch( err => {
  console.log(err)
})

const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})