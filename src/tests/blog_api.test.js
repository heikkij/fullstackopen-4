const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const config = require('../utils/config')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const {
  initialBlogs, newBlog, newNoLikesBlog, newNoTitleBlog, newNoUrlBlog,
  newUser, newUser2, newUserWithoutPassword, newUserWithoutAdultInfo,
  blogsInDb, usersInDb
} = require('./test_helper')

describe('when blog api is called by get', async () => {

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

    const titles = response.body.map(b => b.title)
    blogsInDatabase.forEach(blog => {
      expect(titles).toContain(blog.title)
    })
  })

})

describe('when blog api is called by post', async () => {

  let newUserToken

  beforeAll(async () => {
    await Blog.remove({})
    await User.remove({})

    await api.post('/api/users').send(newUser)

    const loginResponse = await api.post('/api/login')
      .send({
        'username': `${newUser.username}`,
        'password': `${newUser.password}`,
      })
    newUserToken = loginResponse.body.token

  })

  test('valid blog is saved', async () => {
    const blogsInDatabaseBefore = await blogsInDb()

    await api.post('/api/blogs')
      .set({ 'Authorization': `bearer ${newUserToken}` })
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
      .set({ 'Authorization': `bearer ${newUserToken}` })
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
      .set({ 'Authorization': `bearer ${newUserToken}` })
      .send(newNoTitleBlog)
      .expect(400)

    const blogsInDatabaseAfter = await blogsInDb()
    expect(blogsInDatabaseAfter.length).toBe(blogsInDatabaseBefore.length)
  })

  test('blog without url is not saved', async () => {
    const blogsInDatabaseBefore = await blogsInDb()

    await api.post('/api/blogs')
      .set({ 'Authorization': `bearer ${newUserToken}` })
      .send(newNoUrlBlog)
      .expect(400)

    const blogsInDatabaseAfter = await blogsInDb()
    expect(blogsInDatabaseAfter.length).toBe(blogsInDatabaseBefore.length)
  })

})

describe('when blog api is called by delete', async () => {

  const testBlogId = '5afcff4b0a1d72218cfdb05b'
  const invalidId = '5af44c60d77e1414e021bf8b'

  let newUserToken
  let newUserToken2

  beforeAll(async () => {
    await Blog.remove({})
    await User.remove({})

    await api.post('/api/users').send(newUser)

    const loginResponse = await api.post('/api/login')
      .send({
        'username': `${newUser.username}`,
        'password': `${newUser.password}`,
      })
    const loginResponse2 = await api.post('/api/login')
      .send({
        'username': `${newUser2.username}`,
        'password': `${newUser2.password}`,
      })

    newUserToken = loginResponse.body.token
    newUserToken2 = loginResponse2.body.token
    const decodedToken = jwt.verify(loginResponse.body.token, config.secret)

    const test_blog_id = mongoose.Types.ObjectId(testBlogId)
    const new_user_id = mongoose.Types.ObjectId(decodedToken.id)

    const blog = Blog({
      _id: test_blog_id,
      title: 'Test Blog',
      author: 'Donald D. Uck',
      url: 'http://blog.org/uncle-uck/TestBlog.html',
      user: new_user_id,
    })
    await blog.save()

  })

  test('blog is deleted', async () => {
    const blogsInDatabaseBefore = await blogsInDb()

    await api.delete(`/api/blogs/${testBlogId}`)
      .set({ 'Authorization': `bearer ${newUserToken}` })
      .expect(204)

    const blogInDatabaseAfter = await blogsInDb()

    expect(blogInDatabaseAfter.length).toBe(blogsInDatabaseBefore.length - 1)

  })

  test('blog is not deleted with wrong user', async () => {
    const blogsInDatabaseBefore = await blogsInDb()

    await api.delete(`/api/blogs/${testBlogId}`)
      .set({ 'Authorization': `bearer ${newUserToken2}` })
      .expect(400)

    const blogInDatabaseAfter = await blogsInDb()

    expect(blogInDatabaseAfter.length).toBe(blogsInDatabaseBefore.length)

  })

  test('blog is not deleted with invalid call', async () => {
    const blogsInDatabaseBefore = await blogsInDb()

    await api.delete(`/api/blogs/${invalidId}`)
      .set({ 'Authorization': `bearer ${newUserToken}` })
      .expect(404)

    const blogInDatabaseAfter = await blogsInDb()

    expect(blogInDatabaseAfter.length).toBe(blogsInDatabaseBefore.length)

  })

  test('blog is not deleted with invalid auth', async () => {
    const blogsInDatabaseBefore = await blogsInDb()

    await api.delete(`/api/blogs/${testBlogId}`)
      .expect(400)

    const blogInDatabaseAfter = await blogsInDb()

    expect(blogInDatabaseAfter.length).toBe(blogsInDatabaseBefore.length)

  })
})

describe('when blog api is called by put', async () => {

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

describe('when user api is called by get', async () => {
  beforeAll(async () => {
    await User.remove({})
    const users = [newUser, newUser2].map(user => new User(user))
    await Promise.all(users.map(user => user.save()))
  })

  test('all users are returned as json by API', async () => {
    const usersInDatabase = await usersInDb()

    const response = await api.get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.length).toBe(usersInDatabase.length)

    const usernames = response.body.map(u => u.username)
    usersInDatabase.forEach(user => {
      expect(usernames).toContain(user.username)
    })
  })

})

describe('when user api is called by post', async () => {
  beforeEach(async () => {
    await User.remove({})
  })

  test('new user will be created', async () => {
    const usersBeforeOperation = await usersInDb()

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length + 1)
    const usernames = usersAfterOperation.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('new user gets default adult information', async () => {

    await api
      .post('/api/users')
      .send(newUserWithoutAdultInfo)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(1)
    const adultInfo = usersAfterOperation[0].adult
    expect(adultInfo).toBe(true)
  })

  test('fails if same user exists at db', async () => {

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'username must be unique' })
  })

  test('fails if password is invalid', async () => {
    const usersBeforeOperation = await usersInDb()

    const sameUser = Object.assign({}, newUserWithoutPassword)

    const result = await api
      .post('/api/users')
      .send(sameUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'invalid password' })
    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
  })
})


afterAll(() => {
  server.close()
})