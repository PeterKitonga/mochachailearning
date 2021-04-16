exports.add = (a, b) => {
    return a + b;
}

exports.addCallback = (a, b, _callback) => {
    setTimeout(() => {
        return _callback(null, a + b);
    }, 20);
}

exports.addPromise = (a, b) => {
    return Promise.resolve(a + b);
    // return Promise.reject(new Error('Fake Error'));
}

exports.foo = () => {
    // some operation
    console.log('console.log was called');
    console.warn('console.warn was called');

    return;
}

exports.bar = async (file_name) => {
    await exports.createFile(file_name);
    let result = await callDb(file_name);

    return result;
}

exports.createFile = (file_name) => {
    console.log('---in createFile');

    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('fake file created');

            resolve('done');
        }, 20);
    });
}

const callDb = (file_name) => {
    console.log('---in callDb');

    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('fake db call');

            resolve('saved');
        }, 20);
    });
}