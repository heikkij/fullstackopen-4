const Blog = require('../models/blog')
const User = require('../models/user')

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

const newUser =
  {
    username: 'mokoma',
    name: 'Marko Annala',
    password: 'password',
    adult: true,
  }

const secondUser =
  {
    username: 'battlebeast',
    name: 'Noora Louhimo',
    password: 'password',
    adult: true,
  }

const newUserWithoutPassword =
  {
    username: 'hanoirocks',
    name: 'Michael Monroe',
    adult: false,
  }

const newUserWithoutAdultInfo =
  {
    username: 'majkarma',
    name: 'Herra Ylppö',
    password: 'password',
  }

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs
}

const usersInDb = async () => {
  const users = await User.find({})
  return users
}

module.exports = {
  initialBlogs,
  newBlog,
  newNoLikesBlog,
  newNoTitleBlog,
  newNoUrlBlog,
  blogsInDb,
  newUser,
  secondUser,
  newUserWithoutPassword,
  newUserWithoutAdultInfo,
  usersInDb,
}