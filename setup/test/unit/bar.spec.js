const assert = require('assert');

/**
 * 'describe' defines the suite of specs in the unit test
*/
describe('file to be tested', () => {
    /**
     * 'context' defines the function being tested
    */
    context('function to be tested', () => {
        /**
         * 'before' defines the 'setup' in our tests
         * used for setting up common variables, functions before any spec runs in the relative suite
        */
        before(() => {
            console.log('================== before');
        });

        /**
         * 'after' defines the 'teardown' in our tests
         * used for clean up after all specs in the relative suite run
        */
        after(() => {
            console.log('================== after');
        });

        /**
         * 'beforeEach' & 'afterEach' work the same way as the above setup & teardown
         * difference is they run before and after each spec
        */
        beforeEach(() => {
            console.log('-------beforeEach');
        });

        afterEach(() => {
            console.log('-------afterEach');
        });

        /**
         * 'it' defines a spec testing something in the function
        */
        it('should do something', () => {
            assert.equal(1, 1);

            /**
             * IMPORTANT: it is good practice to always check the environment mode
             * since it is not desired to run tests in production. This can be dangerous
             * since we can drop database tables during tests which is not ideal for production.
            */
            if (process.env.NODE_ENV === 'development') {
                console.log(`ENV MODE: ${process.env.NODE_ENV}`);
            }
        });

        it('should do something else', () => {
            assert.deepEqual({name: 'joe'}, {name: 'joe'});
        });

        /* this is a pending spec */
        it('this is a pending test');
    });

    /**
     * we can also have multiple contexts in a suite
    */
    context('another function', () => {
        it('should do something');
    });
});