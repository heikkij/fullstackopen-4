const totalLikes =  (blogs) => {
  return blogs.reduce(((acc, blog) => acc + blog.likes), 0)
}

const format = (blog) => {
  if (blog) {
    return {
      title: blog.title,
      author: blog.author,
      likes: blog.likes,
    }
  }
}

const favoriteBlog = (blogs) => {
  const [head, ...tail] = blogs
  return tail.reduce((acc, blog) => blog.likes > acc.likes ? format(blog) : acc, format(head))
}

module.exports = {
  totalLikes,
  favoriteBlog,
}