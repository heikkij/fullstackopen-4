const formatBlog = (blog) => {
  if (blog) {
    return {
      title: blog.title,
      author: blog.author,
      likes: blog.likes,
    }
  }
}

const formatAuthorBlog = (blog) => {
  if (blog) {
    return {
      title: blog.title,
      likes: blog.likes,
    }
  }
}

const totalLikes = (blogs) => {
  return blogs.reduce(((acc, blog) => acc + blog.likes), 0)
}

const favoriteBlog = (blogs) => {
  const [head, ...tail] = blogs
  return tail.reduce((acc, blog) => blog.likes > acc.likes ? formatBlog(blog) : acc, formatBlog(head))
}

const groupBlogsByAuthor = (blogs) => {
  return blogs.reduce((blogs, blog) => {
    const existing = blogs.find((b) => b && b.author === blog['author'])
    if (existing) {
      existing.blogs.push(formatAuthorBlog(blog))
    } else {
      blogs.push({
        author: blog['author'],
        blogs: [formatAuthorBlog(blog)]
      })
    }
    return blogs
  }, [])
}

const mostBlogs = (blogs) => {
  const blogsByAuthor = groupBlogsByAuthor(blogs)
  const blogCounts = blogsByAuthor.map((author) => {
    return {
      author: author.author,
      blogs: author.blogs.length,
    }
  })
  const maxBlogs = Math.max.apply(Math, blogCounts.map((b) => b.blogs))
  return blogCounts.find((b) => b.blogs === maxBlogs)
}

const mostLikes = (blogs) => {
  const blogsByAuthor = groupBlogsByAuthor(blogs)
  const blogLikes = blogsByAuthor.map((author) => {
    return {
      author: author.author,
      likes: author.blogs.reduce((acc, blog) => acc + blog.likes, 0),
    }
  })
  const maxLikes = Math.max.apply(Math, blogLikes.map((b) => b.likes))
  return blogLikes.find((b) => b.likes === maxLikes)
}

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}