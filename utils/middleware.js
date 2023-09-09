const jwt = require('jsonwebtoken')
const logger = require('./logger')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:', request.path)
    if (request.body.password) {
        logger.info('Body:', { ...request.body, password: '****' })
    } else {
        logger.info('Body:', request.body)
    }
    logger.info('---')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    logger.error(`${error.name}: ${error.message}`)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        if (error.message.includes('expected `username` to be unique')) {
            return response.status(409).json({ error: error.message })
        }
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'JsonWebTokenError') {
        if (error.message.includes('jwt must be provided')) {
            return response.status(401).json({ error: 'token must be provided' })
        } else if (error.message.includes('invalid signature')) {
            return response.status(401).json({ error: 'invalid token' })
        }
        return response.status(400).json({ error: error.message })
    }
    next(error) 
}

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    const authorizationType = request.get('authorizationType')
    if (authorization && authorizationType === 'Bearer') {
        request.token = authorization
    }
    next()
}

const userExtractor = async (request, response, next) => {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'invalid token' })
    }
    const user = await User.findById(decodedToken.id)
    request.user = user
    next()
}


module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor,
}