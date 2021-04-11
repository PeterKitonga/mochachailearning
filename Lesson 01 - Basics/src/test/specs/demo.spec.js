const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const rewire = require('rewire');

const { expect } = chai;

/**
 * Plugins are extended into chai using the .use() method once imported
*/
chai.use(chaiAsPromised);
chai.use(sinonChai);

/**
 * To use rewire you must swap with 'require' when importing the file.
 * This allows rewire to pass the getters and setters
*/
const demo = rewire('../../lib/demo');
const { add, addCallback, addPromise, foo, bar } = demo;

describe('demo.js', () => {
    context('add()', () => {
        it('should add two numbers', () => {
            expect(add(1, 2)).to.equal(3);
        });
    });

    context('addCallback()', () => {
        /**
         * Just like in jasmine we pass a done callback as a param to let mocha know
         * the function has finished running
        */
        it('should add two numbers with a callback', (done) => {
            /**
             * By default nodejs returns an err param in callbacks
             * which is passed first
            */
            addCallback(1, 2, (err, result) => {
                expect(err).to.not.exist;
                expect(result).to.equal(3);
                done();
            });
        });
    });

    context('addPromise()', () => {
        it('should add two numbers with a promise', (done) => {
            addPromise(1, 2).then(result => {
                expect(result).to.equal(3);
                done();
            }).catch(err => {
                done(err);
            });
        });

        /**
         * promises can also be returned without passing the
         * done callback
        */
        it('should test a promise with return', () => {
            return addPromise(1, 2).then(result => {
                expect(result).to.equal(3);
            });
        });

        /**
         * async await can also be used to test promises
        */
        it('should test promise with async await', async () => {
            let result = await addPromise(1, 2);

            expect(result).to.equal(3);
        });

        /**
         * chai-as-promised plugin adds the 'eventually'
         * matcher which can be used when testing a promise
        */
        it('should test promise with chai as promised', () => {
            expect(addPromise(1, 2)).to.eventually.equal(3);
        });
    });

    context('foo()', () => {
        it('should spy on log', () => {
            /**
             * Here, we install a spy on the global console function
             * which we will use to check if its method 'log' is invoked
            */
            let spy = sinon.spy(console, 'log');
            foo();

            /**
             * Here, 'calledOnce' is a spy strategy that checks if the function
             * passed in the spy above is invoked at least once
            */
            expect(spy.calledOnce).to.be.true;
            expect(spy).to.have.been.calledOnce;

            /**
             * It is recommended to call the restore strategy so as to reset to the
             * original method's state. This prevents unwanted behaviour when we install another spy to the
             * same method again
            */
            spy.restore();
        });

        it('should stub console.warn', () => {
            /**
             * Here, callsFake is used to simulate an output of an example
             * stub installed. We can use this in a case where we are stubbing
             * insertion to a database and we want to return back a fake object as output
            */
            let stub = sinon.stub(console, 'warn').callsFake(() => {
                console.log('message from stub');
            });

            foo();

            expect(stub).to.have.been.calledOnce;
            expect(stub).to.have.been.calledWith('console.warn was called');

            stub.restore();
        });
    });

    context('stub private functions', () => {
        it('should stub createFile()', async () => {
            let create_stub = sinon.stub(demo, 'createFile').resolves('create_stub');
            let call_db = sinon.stub().resolves('call_db_stub');

            /**
             * rewire provides getters and setters for the private variables in
             * the file being tested.
             * below the first parameter is the private function/variable being
             * set and the second is the stub replacing it.
            */
            demo.__set__('callDb', call_db);

            let result = await bar('test.txt');

            expect(result).to.equal('call_db_stub');
            expect(create_stub).to.have.been.calledOnce;
            expect(create_stub).to.have.been.calledWith('test.txt');
            expect(call_db).to.have.been.calledOnce;

            create_stub.restore();
        });
    });
});