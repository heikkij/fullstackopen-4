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
  const maxBlogs = Math.max.apply(Math, blogCounts.map((o) => o.blogs))
  return blogCounts.find((b) => b.blogs === maxBlogs)
}

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
}