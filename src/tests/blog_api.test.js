const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const { initialBlogs, newBlog, newNoLikesBlog, newNoTitleBlog, newNoUrlBlog, blogsInDb } = require('./test_helper')

describe('when api is called by get', async () => {

  beforeAll(async () => {
    await Blog.remove({})
    const blogs = initialBlogs.map(blog => new Blog(blog))
    await Promise.all(blogs.map(blog => blog.save()))
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

  beforeAll(async () => {
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

describe('when api is called by delete', async () => {

  const testId = '5af1244ed0a939f7e4681785'
  const invalidId = '5af44c60d77e1414e021bf8b'

  beforeAll(async () => {
    newBlog._id = testId
    await Blog.remove({})
    const blogs = initialBlogs.concat(newBlog).map(blog => new Blog(blog))
    await Promise.all(blogs.map(blog => blog.save()))
  })

  test('blog is deleted', async () => {
    const blogsInDatabaseBefore = await blogsInDb()

    await api.delete(`/api/blogs/${testId}`)
      .expect(204)

    const blogInDatabaseAfter = await blogsInDb()

    const titles = blogInDatabaseAfter.map(r => r.title)

    expect(titles).not.toContain(newBlog.title)
    expect(blogInDatabaseAfter.length).toBe(blogsInDatabaseBefore.length - 1)

  })

  test('blog is not deleted with invalid call', async () => {
    const blogsInDatabaseBefore = await blogsInDb()

    await api.delete(`/api/blogs/${invalidId}`)
      .expect(404)

    const blogInDatabaseAfter = await blogsInDb()

    expect(blogInDatabaseAfter.length).toBe(blogsInDatabaseBefore.length)

  })
})

describe('when api is called by put', async () => {

  let testId

  beforeAll(async () => {
    newBlog._id = testId
    await Blog.remove({})
    const blog = new Blog(newBlog)
    const testBlog = await blog.save()
    testId = testBlog.id
  })

  test('blog is updated', async () => {
    const blogsInDatabaseBefore = await blogsInDb()
    const likesBefore = blogsInDatabaseBefore[0].likes

    await api.put(`/api/blogs/${testId}`)
      .send({ likes: likesBefore + 1 })
      .expect(200)

    const blogsInDatabaseAfter = await blogsInDb()
    const likesAfter = blogsInDatabaseAfter[0].likes

    expect(likesAfter).toBe(likesBefore + 1)

  })

})

afterAll(() => {
  server.close()
})