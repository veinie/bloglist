const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcryptjs')

const User = require('../models/user')


describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({
        username: 'root',
        name: 'admin',
        passwordHash
    })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'testuser',
      name: 'Test User',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with a not unique username', async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser = {
        username: 'root',
        name: 'testing',
        password: 'sekret'      
    }
    await api
        .post('/api/users')
        .send(newUser)
        .expect(409)
        .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with a too short username', async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser = {
        username: 'ro',
        name: 'testing',
        password: 'sekret'      
    }
    await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails without username', async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser = {
        name: 'testing',
        password: 'sekret'      
    }
    await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails without name', async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser = {
        username: 'testing',
        password: 'sekret'      
    }
    await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with a too short password', async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser = {
        username: 'testing',
        name: 'testing',
        password: 'se'      
    }
    await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  }) 

})

afterAll(async () => {
    await mongoose.connection.close()
})