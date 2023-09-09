const listHelper = require('../utils/list_helper')
const sampleBlogs = require('./test_helper').initialBlogs
const blogListWithSingleBlog = [sampleBlogs[0]]


describe('dummy', () => {
    test('dummy returns one', () => {
        const result = listHelper.dummy(sampleBlogs)
        expect(result).toBe(1)
    })
})

describe('total likes', () => {
    test('when list has only one blog equals the likes of that', () => {
        const numberOfLikes = 7
        const listWithOneBlog = [sampleBlogs[0]]
        const result = listHelper.totalLikes(listWithOneBlog)
        expect(result).toBe(numberOfLikes)
    })

    test('when list has multiple blogs equals the sum of all blog likes', () => {
        const result = listHelper.totalLikes(sampleBlogs)
        expect(result).toBe(53)
    })

    test('when list is empty equals 0', () => {
        const result = listHelper.totalLikes([])
        expect(result).toBe(0)
    })
})

describe('favorite blog', () => {
    test('when list has only one blog equals to it', () => {
        const result = listHelper.favoriteBlog(blogListWithSingleBlog)
        expect(result).toEqual(blogListWithSingleBlog[0])
    })

    test('when list is empty equals null', () => {
        const result = listHelper.favoriteBlog([])
        expect(result).toBe(null)
    })

    test('when list has multiple blogs equals to one with most likes', () => {
        const result = listHelper.favoriteBlog(sampleBlogs)
        expect(result).toEqual(sampleBlogs[2])
    })
})

describe('most blogs', () => {
    test('when list has multiple blogs equals to author with most occurrences', () => {
        const result = listHelper.mostBlogs(sampleBlogs)
        expect(result).toEqual({ author: 'Robert C. Martin', blogs: 3 })
    })

    test('when list has one blog equals to one blog by that author', () => {
        const result = listHelper.mostBlogs(blogListWithSingleBlog)
        expect(result).toEqual({ author: "Michael Chan", blogs: 1 })
    })

    test('when list is empty most blogs equals null', () => {
        expect(listHelper.mostBlogs([])).toBe(null)
    })
})

describe('most liked author', () => {
    test('when list has multiple blogs equals to author with most total likes', () => {
        const result = listHelper.mostLikes(sampleBlogs)
        expect(result).toEqual({ author: 'Edsger W. Dijkstra', likes: 17 })
    })

    test('when list has one blog equals to the likes and the author of that', () => {
        const result = listHelper.mostLikes(blogListWithSingleBlog)
        expect(result).toEqual({ author: "Michael Chan", likes: 7 })
    })

    test('when list is empty most likes equals null', () => {
        expect(listHelper.mostLikes([])).toBe(null)
    })

})