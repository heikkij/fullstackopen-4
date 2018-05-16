const tokenExtractor = (request, response, next) => {
  const authorization = request.get('Authorization')
  request.token =
    authorization && authorization.toLowerCase().startsWith('bearer ') ? authorization.substring(7) : null
  next()
}

const logger = (request, response, next) => {
  if (process.env.NODE_ENV !== 'test' ) {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('Token:  ', request.token)
    console.log('---')
  }
  next()
}

const error = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

module.exports = {
  tokenExtractor,
  logger,
  error,
}