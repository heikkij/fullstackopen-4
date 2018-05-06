const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
  },
  {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
  },
]

const newBlog =
  {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
  }

const newNoLikesBlog =
  {
    title: 'Building a React App from Scratch',
    author: 'Bertalan Miklos',
    url: 'https://blog.risingstack.com/building-react-app-from-scratch-live-stream/',
  }

const newNoTitleBlog =
  {
    author: 'Tamas Kadlecsik',
    url: 'https://blog.risingstack.com/node-js-10-lts-feature-breakdown/',
  }

const newNoUrlBlog =
  {
    title: 'Node v10 is Here - Feature Breakdown!',
    author: 'Tamas Kadlecsik',
  }


beforeAll( async () => {
  await Blog.remove({})

  initialBlogs.forEach(async (blog) => {
    const blogObject = new Blog(blog)
    await blogObject.save()
  })

  const blogs = initialBlogs.map(blog => new Blog(blog))
  const promises = blogs.map(blog => blog.save)
  await Promise.all(promises)

})

describe('when api is called by get', async () => {

  test('blogs are returned as json', async () => {
    await api.get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body.length).toBe(initialBlogs.length)
  })

  test('"The React patterns" blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)
    expect(titles).toContain('React patterns')
  })

})

describe('when api is called by post', async () => {

  test('valid blog is saved', async () => {
    await api.post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const response = await api.get('/api/blogs')
    const titles = response.body.map(b => b.title)
    expect(response.body.length).toBe(initialBlogs.length + 1)
    expect(titles).toContain('Type wars')
  })

  test('valid blog without likes is saved with zero likes', async () => {
    await api.post('/api/blogs')
      .send(newNoLikesBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const response = await api.get('/api/blogs')
    const addedBlog = response.body.find(blog => blog.title === newNoLikesBlog.title)
    expect(addedBlog.likes).toBe(0)
  })

  test('blog without title is not saved', async () => {
    await api.post('/api/blogs')
      .send(newNoTitleBlog)
      .expect(400)
  })

  test('blog without url is not saved', async () => {
    await api.post('/api/blogs')
      .send(newNoUrlBlog)
      .expect(400)
  })

})

afterAll(() => {
  server.close()
})