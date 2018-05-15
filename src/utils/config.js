if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const port = process.env.NODE_ENV === 'test' ? process.env.TEST_PORT : process.env.PORT
const mongoUrl = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI

const secret = process.env.SECRET

module.exports = {
  mongoUrl,
  port,
  secret,
}