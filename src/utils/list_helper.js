const totalLikes = (blogs) => {
  return blogs.reduce(((acc, blog) => acc + blog.likes), 0)
}

module.exports = {
  totalLikes,
}