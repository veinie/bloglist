const info = (...params) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(...params)
    }
}

const error = (...params) => {
    if (process.env.NODE_ENV !== 'test') {
        console.error(...params)
    }
}

const getDBName = (uri) => {
    const startIndex = uri.lastIndexOf('/') + 1
    const endIndex = uri.indexOf('?', startIndex)
    return uri.substring(startIndex, endIndex)
}

module.exports = {
    info, error, getDBName
}