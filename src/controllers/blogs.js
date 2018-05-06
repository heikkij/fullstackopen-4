const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
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
    const blog = new Blog(request.body)
    const savedBlog = await blog.save()
    response.status(201).json(savedBlog)
  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'save failed' })
  }
})

module.exports = blogsRouter