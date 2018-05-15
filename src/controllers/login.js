const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const config = require('../utils/config')

loginRouter.post('/', async (request, response) => {
  const user = await User.findOne({ username: request.body.username })
  const password = request.body.password
  const loginCorrect = user !== null && password
  console.log(password, user.passwordHash)
  const authenticated = loginCorrect ? await bcrypt.compare(password, user.passwordHash) : false

  if (!authenticated) {
    return response.status(401).send({ error: 'invalid username or password' })
  }

  const userForToken = {
    username: user.username,
    id: user._id
  }

  const token = jwt.sign(userForToken, config.secret)

  response.status(200).send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter