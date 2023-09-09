const userExtractor = require('../utils/middleware').userExtractor
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
      .find({})
      .populate(
        'user', { username: 1, name: 1 }
      )
    response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  response.json(blog)
})
  
blogsRouter.post('/', userExtractor, async (request, response) => {
    const { title, author, url, likes} = request.body
    const user = request.user
    const blogObject = new Blog({
      title: title,
      author: author,
      url: url,
      likes: likes,
      user: user._id
    })
    const savedBlog = await blogObject.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    const user = request.user
    if (blog.user._id.toString() === user._id.toString()) {
      await Blog.findByIdAndRemove(request.params.id)
      response.status(204).end()
    } else {
      response.status(401).json({ error: 'unauthorized action' })
    }
  } else {
    response.status(404).end()
  }
})

blogsRouter.put('/:id', userExtractor, async (request, response) => {
  const { title, author, url, likes} = request.body
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    const user = request.user
    if (blog.user._id.toString() === user._id.toString()) {
      const updatedBlog = await Blog.findByIdAndUpdate(
        request.params.id,
        { title, author, url, likes},
        { new: true, runValidators: true, context: 'query' }
      )
      response.json(updatedBlog)
    } else {
      response.status(401).json({ error: 'unauthorized action' })
    }
  } else {
    response.status(404).end()
  }
})

module.exports = blogsRouter
