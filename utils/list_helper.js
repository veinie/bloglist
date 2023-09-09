const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}


const totalLikes = (blogs) => {
    const reducer = (sum, item) => {
        return sum + item
    }
    return blogs.map(blog => blog.likes).reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length > 0) {
        const blogWithMaxLikes = blogs.reduce((maxLikesBlog, currentBlog) => {
            if (currentBlog.likes > maxLikesBlog.likes) {
                return currentBlog
            }
            return maxLikesBlog
        })
        return blogWithMaxLikes
    }
    return null
}

const mostBlogs = (blogs) => {
    if (blogs.length > 0){
        const authorStats = _.transform(blogs, (result, { author }) => {
            if (!result[author]) {
                result[author] = 0;
            }
            result[author]++
        }, {})
        const authorWithMostOccurrences = _.maxBy(_.keys(authorStats), author => authorStats[author])
        const totalOccurrencesByAuthor = authorStats[authorWithMostOccurrences]

        return {
            "author":authorWithMostOccurrences,
            "blogs":totalOccurrencesByAuthor
        }
    }
    return null
}


const mostLikes = (blogs) => {
    if (blogs.length > 0) {
        const authorStats = _.transform(blogs, (result, { author, likes}) => {
            if (!result[author]) {
                result[author] = 0
            }
            result[author] += likes
        }, {})
        const authorWithMostLikes = _.maxBy(_.keys(authorStats), author => authorStats[author])
        const totalLikesByAuthor = authorStats[authorWithMostLikes]
        return {
            "author": authorWithMostLikes,
            "likes": totalLikesByAuthor
        }
    }
    return null
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}