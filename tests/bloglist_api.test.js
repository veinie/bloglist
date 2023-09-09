const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

let sharedContext = {
    authorizationType: 'Bearer',
    token: ''
}

const getToken = async () => {
    const response = await api
        .post('/api/login')
        .send({
            username: 'testuser',
            password: 'salainen'
        })
    return response.body.token
}

beforeAll(async () =>{
    await User.deleteMany({})
    const newUser = {
        username: 'testuser',
        name: 'Test User',
        password: 'salainen',
    }
    const response = await api
        .post('/api/users')
        .send(newUser)
    sharedContext.token = await getToken()
})


describe('when there is initially some blogs saved', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        for (let blog of helper.initialBlogs) {
            await api
                .post('/api/blogs')
                .send(blog)
                .set({
                    authorizationType: sharedContext.authorizationType,
                    authorization: sharedContext.token
                })
        }      
    })

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('blogs are identified by id', async () => {
        const response = await api.get('/api/blogs')
        response.body.forEach(blog => {
            expect(blog.id).toBeDefined()
        })
    })

    describe('addition of a blog', () => {
        test('a valid blog can be added', async () => {
            const newBlog = {
                title: "Test title",
                author: "Test Author",
                url: "http://somerandomurladdress16527485/blog1",
                likes: 0
            }
            await api
                .post('/api/blogs')
                .send(newBlog)
                .set({
                    authorizationType: sharedContext.authorizationType,
                    authorization: sharedContext.token
                })
                .expect(201)
                .expect('Content-Type', /application\/json/)
            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
            const titles = blogsAtEnd.map(r => r.title)
            expect(titles).toContain("Test title")
        })

        test('a blog cannot be added without a valid authorization header', async () => {
            const newBlog = {
                title: "Test title",
                author: "Test Author",
                url: "http://somerandomurladdress16527485/blog1",
                likes: 0
            }
            await api
                .post('/api/blogs')
                .send(newBlog)
                .set({
                    authorizationType: sharedContext.authorizationType,
                })
                .expect(401)
                .expect('Content-Type', /application\/json/)
            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
            const titles = blogsAtEnd.map(r => r.title)
            expect(titles).not.toContain("Test title")
        })

        test('if a blog is added without likes they are set to 0', async () => {
            const blog = {
                title: "Test Title",
                author: "Test Author",
                url: "http://somerandomurladdress16527485/blog1",
            }
            await api
                .post('/api/blogs')
                .send(blog)
                .set({
                    authorizationType: sharedContext.authorizationType,
                    authorization: sharedContext.token
                })
                .expect(201)
                .expect('Content-Type', /application\/json/)
            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
            const newBlog = blogsAtEnd.find(blog => blog.title === 'Test Title')
            expect(newBlog.likes).toBeDefined()
            expect(newBlog.likes).toBe(0)
        })

        test('blog without title is not added', async () => {
            const blog = {
                author: "Test Author",
                url: "http://somerandomurladdress16527485/blog1",
            }
            await api
                .post('/api/blogs')
                .send(blog)
                .set({
                    authorizationType: sharedContext.authorizationType,
                    authorization: sharedContext.token
                })
                .expect(400)
            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
        })

        test('blog without author is not added', async () => {
            const blog = {
                title: "Test Title",
                url: "http://somerandomurladdress16527485/blog1",
            }
            await api
                .post('/api/blogs')
                .send(blog)
                .set({
                    authorizationType: sharedContext.authorizationType,
                    authorization: sharedContext.token
                })
                .expect(400)
            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
        })
    })

    describe('updating a blog', () => {
        test('blog likes can be incremented', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = blogsAtStart[0]
            const blog = {...blogToUpdate, likes: blogToUpdate.likes + 1}
            await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send(blog)
                .set({
                    authorizationType: sharedContext.authorizationType,
                    authorization: sharedContext.token
                })
                expect(201)
            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
            const likes = blogsAtEnd.find(blog => blog._id === blogToUpdate._id).likes
            expect(likes).toBe(blogToUpdate.likes + 1)
        })

        test('blog cannot be updated without a valid authorization header', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = blogsAtStart[0]
            const blog = {...blogToUpdate, likes: blogToUpdate.likes + 1}
            await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send(blog)
                .set({
                    authorizationType: sharedContext.authorizationType,
                })
                expect(401)
            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
            const likes = blogsAtEnd.find(blog => blog._id === blogToUpdate._id).likes
            expect(likes).toBe(blogToUpdate.likes)
        })
        
        test('malformatted id returns 400', async () => {
            const invalidId = '5a3d5da59070081a82a3445'
            await api
                .put(`/api/blogs/${invalidId}`)
                .set({
                    authorizationType: sharedContext.authorizationType,
                    authorization: sharedContext.token
                })
                .expect(400)
        })
    })

    describe('deletion of a blog', () => {
        test('a blog can be deleted', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]
            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set({
                    authorizationType: sharedContext.authorizationType,
                    authorization: sharedContext.token
                })
                .expect(204)
            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)
            const titles = blogsAtEnd.map(r => r.title)
            expect(titles).not.toContain(blogToDelete.title)
        })

        test('a blog cannot be deleted without a valid authorization header', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]
            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set({
                    authorizationType: sharedContext.authorizationType,
                })
                .expect(401)
            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
            const titles = blogsAtEnd.map(r => r.title)
            expect(titles).toContain(blogToDelete.title)
        })

        test('malformatted id returns 400', async () => {
            const invalidId = '5a3d5da59070081a82a3445'
            await api
                .put(`/api/blogs/${invalidId}`)
                .set({
                    authorizationType: sharedContext.authorizationType,
                    authorization: sharedContext.token
                })
                .expect(400)
        })
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})