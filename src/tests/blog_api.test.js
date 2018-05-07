const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const { initialBlogs, newBlog, newNoLikesBlog, newNoTitleBlog, newNoUrlBlog, blogsInDb } = require('./test_helper')

describe('when api is called by get', async () => {

  beforeAll( async () => {
    await Blog.remove({})
    const blogs = initialBlogs.map(blog => new Blog(blog))
    await Promise.all(blogs.map(blog => blog.save))
  })

  test('all blogs are returned as json by API', async () => {
    const blogsInDatabase = await blogsInDb()

    const response = await api.get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.length).toBe(blogsInDatabase.length)

    const titles = response.body.map(n => n.title)
    blogsInDatabase.forEach(blog => {
      expect(titles).toContain(blog.title)
    })
  })

})

describe('when api is called by post', async () => {

  beforeAll( async () => {
    await Blog.remove({})
  })

  test('valid blog is saved', async () => {
    const blogsInDatabaseBefore = await blogsInDb()

    await api.post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsInDatabaseAfter = await blogsInDb()
    expect(blogsInDatabaseAfter.length).toBe(blogsInDatabaseBefore.length + 1)

    const titles = blogsInDatabaseAfter.map(b => b.title)
    expect(titles).toContain('Type wars')
  })

  test('valid blog without likes is saved with zero likes', async () => {
    const blogsInDatabaseBefore = await blogsInDb()

    await api.post('/api/blogs')
      .send(newNoLikesBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsInDatabaseAfter = await blogsInDb()
    expect(blogsInDatabaseAfter.length).toBe(blogsInDatabaseBefore.length + 1)

    const addedBlog = blogsInDatabaseAfter.find(blog => blog.title === newNoLikesBlog.title)
    expect(addedBlog.likes).toBe(0)
  })

  test('blog without title is not saved', async () => {
    const blogsInDatabaseBefore = await blogsInDb()

    await api.post('/api/blogs')
      .send(newNoTitleBlog)
      .expect(400)

    const blogsInDatabaseAfter = await blogsInDb()
    expect(blogsInDatabaseAfter.length).toBe(blogsInDatabaseBefore.length)
  })

  test('blog without url is not saved', async () => {
    const blogsInDatabaseBefore = await blogsInDb()

    await api.post('/api/blogs')
      .send(newNoUrlBlog)
      .expect(400)

    const blogsInDatabaseAfter = await blogsInDb()
    expect(blogsInDatabaseAfter.length).toBe(blogsInDatabaseBefore.length)
  })

})

afterAll(() => {
  server.close()
})