const getURL = () => {
    if (process.env.NODE_ENV === 'production') {
        return 'mongodb://localhost:27017/real_mocha_db'
    } else {
        return 'mongodb://localhost:27017/test_mocha_db'
    }
};

module.exports = getURL;