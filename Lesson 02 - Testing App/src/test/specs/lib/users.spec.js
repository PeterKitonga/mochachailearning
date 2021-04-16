const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const mongoose = require('mongoose');
const rewire = require('rewire');

const { expect } = chai;

chai.use(chaiAsPromised);
chai.use(sinonChai);

let users = rewire('../../../lib/users');
const User = require('../../../models/user');
const mailer = require('../../../lib/mailer');
const { get, create, update, deleteUser, resetPassword } = users;

/**
 * creates a sandbox in which we can call and restore all stubs, mocks, spies
*/
const sandbox = sinon.createSandbox();

describe('lib/users.js', () => {
    let find_stub;
    let sample_args;
    let sample_user;
    let delete_stub;
    let mailer_stub;

    beforeEach(() => {
        sample_user = {
            id: 1,
            name: 'foo',
            email: 'foo@bar.com',
            save: sandbox.stub().resolves()
        };

        /**
         * Here we use the sandbox to create a stub on the mongoose model class. This 
         * will be used in context functions where we return a promise
        */
        find_stub = sandbox.stub(mongoose.Model, 'findById').resolves(sample_user);
        delete_stub = sandbox.stub(mongoose.Model, 'remove').resolves('fake_remove_result');
        mailer_stub = sandbox.stub(mailer, 'sendWelcomeEmail').resolves('fake_email');
    });

    afterEach(() => {
        /**
         * setups up a teardown to restore all stubs used in all our specs
        */
        sandbox.restore();

        /**
         * resets any changes rewire has done
        */
        users = rewire('../../../lib/users');
    });

    context('get()', () => {
        it('should check for an id', (done) => {
            get(null, (err, result) => {
                expect(err).to.exist;
                expect(err.message).to.equal('Invalid user id');
                done();
            });
        });

        it('should call findById with id and return result', (done) => {
            /**
             * we can restore the sandbox prematurely if needed and proceed to
             * create a stub using the sandbox
            */
           sandbox.restore();

           /**
            * Here we use yields to return an object value for the stub because in the get method we
            * are returning a callback and not a promise. Yields causes the stub to call the first callback
            * it receives with the arguments passed. First argument is the error and second is the result
           */
           let stub = sandbox.stub(mongoose.Model, 'findById').yields(null, sample_user);

            get(123, (err, result) => {
                expect(err).to.not.exist;
                expect(stub).to.have.been.calledOnce;
                expect(result).to.be.a('object');
                expect(result).to.have.property('name').to.equal('foo');

                done();
            });
        });

        it('should catch an error if exists', (done) => {
            sandbox.restore();
            let stub = sandbox.stub(mongoose.Model, 'findById').yields(new Error('Fake Error'));

            get(123, (err, result) => {
                expect(err).to.exist;
                expect(err).to.be.instanceOf(Error);
                expect(result).to.not.exist;
                expect(err.message).to.equal('Fake Error');
                expect(stub).to.have.been.calledWith(123);

                done();
            });
        });
    });

    context('deleteUser()', () => {
        it('should check for an id using return', () => {
            return deleteUser().then(result => {
                throw new Error('unexpected success');
            }).catch(err => {
                expect(err).to.be.instanceOf(Error);
                expect(err.message).to.equal('Invalid id');
            });
        });

        it('should check for error using eventually', () => {
            return expect(deleteUser()).to.eventually.be.rejectedWith('Invalid id');
        });

        it('should call User.remove', async () => {
            let result = await deleteUser(123);

            expect(result).to.equal('fake_remove_result');
            expect(delete_stub).to.have.been.calledWith({_id: 123});
        });
    });

    context('create()', () => {
        let FakeUserClass, save_stub, result;

        beforeEach(async () => {
            save_stub = sandbox.stub().resolves(sample_user);
            FakeUserClass = sandbox.stub().returns({save: save_stub});

            users.__set__('User', FakeUserClass);
            result = await users.create(sample_user);
        });

        it('should reject invalid args', async () => {
            await expect(create()).to.eventually.be.rejectedWith('Invalid arguments');
            await expect(create({name: 'foo'})).to.eventually.be.rejectedWith('Invalid arguments');
            await expect(create({email: 'foo@bar.com'})).to.eventually.be.rejectedWith('Invalid arguments');
        });

        it('should call User with new', async () => {
            expect(FakeUserClass).to.have.been.calledWithNew;
            expect(FakeUserClass).to.have.been.calledWith(sample_user);
        });

        it('should save the user', () => {
            expect(save_stub).to.have.been.called;
        });

        it('should call mailer with email and name', () => {
            expect(mailer_stub).to.have.been.calledWith(sample_user.email, sample_user.name);
        });

        it('should reject errors', async () => {
            save_stub.rejects(new Error('Fake'));

            await expect(users.create(sample_user)).to.eventually.be.rejectedWith('Fake');
        });
    });

    context('update()', () => {
        it('should find user by id', async () => {
            await update(1, sample_user);

            expect(find_stub).to.have.been.calledOnce;
            expect(find_stub).to.have.been.calledWith(1);
        });

        it('should call user.save()', async () => {
            await update(1, sample_user);

            expect(sample_user.save).to.have.been.calledOnce;
        });

        it('should reject if there is an error', async () => {
            /**
             * throws works the same as rejects
            */
            sample_user.save.throws(new Error('Fake Error'));

            await expect(update(1, sample_user)).to.eventually.be.rejectedWith('Fake Error');
        });
    });

    context('resetPassword()', () => {
        let reset_stub;

        beforeEach(() => {
            reset_stub = sandbox.stub(mailer, 'sendPasswordResetEmail').resolves('reset_email');
        });

        it('should check for email', async () => {
            await expect(resetPassword()).to.eventually.be.rejectedWith('Invalid email');
        });

        it('should call sendPasswordResetEmail', async () => {
            await resetPassword('foo@bar.com');

            expect(reset_stub).to.have.been.calledWith('foo@bar.com');
        });
    });
});

