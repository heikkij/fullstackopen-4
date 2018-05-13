const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
    .populate('blogs', { _id: 1, likes: 1, author: 1, title: 1, url: 1 })
  response.json(users.map(User.format))
})

usersRouter.post('/', async (request, response) => {
  try {
    if (request.body.username === undefined) {
      return response.status(400).json({ error: 'username missing' })
    }
    const existingUser = await User.find({ username: request.body.username })
    if (existingUser.length > 0) {
      return response.status(400).json({ error: 'username must be unique' })
    }
    if (request.body.password === undefined || request.body.password.length < 3 ) {
      return response.status(400).json({ error: 'invalid password' })
    }
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(request.body.password, saltRounds)
    const user = new User({
      username: request.body.username,
      name: request.body.name,
      passwordHash,
      adult: request.body.adult || true,
      blogs: [],
    })
    const savedUser = await user.save()
    response.status(201).json(User.format(savedUser))
  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'save failed' })
  }
})

module.exports = usersRouter
