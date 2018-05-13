const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate('user', { _id: 1, username: 1, name: 1 })
  response.json(blogs.map(Blog.format))
})

blogsRouter.post('/', async (request, response) => {
  try {
    if (request.body.title === undefined) {
      return response.status(400).json({ error: 'title missing' })
    }
    if (request.body.url === undefined) {
      return response.status(400).json({ error: 'url missing' })
    }
    if (request.body.likes === undefined) {
      request.body['likes'] = 0
    }
    const users = await User.find({})
    const user = users[0]
    console.log(user)
    const blog = new Blog({
      title: request.body['title'],
      author: request.body['author'],
      url: request.body['url'],
      likes: request.body['likes'],
      user: user.id
    })
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog.id)
    await user.save()
    response.status(201).json(Blog.format(savedBlog))
  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'save failed' })
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    const deleted = await Blog.findByIdAndRemove(request.params.id)
    deleted ? response.status(204).end() : response.status(404).end()
  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  try {
    const blog = {
      likes: request.body.likes,
    }
    const updated = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updated)
  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})

module.exports = blogsRouter