const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const mongoose = require('mongoose');
const rewire = require('rewire');
const request = require('supertest');

const { expect } = chai;

chai.use(chaiAsPromised);
chai.use(sinonChai);

let app = rewire('../../app');
const users = require('../../lib/users');
const auth = require('../../lib/auth');

const sandbox = sinon.createSandbox();

describe('app.js', () => {
    afterEach(() => {
        app = rewire('../../app');
        sandbox.restore();
    });

    context('GET /', () => {
        it('should get /', (done) => {
            request(app).get('/')
                .expect(200)
                .end((err, response) => {
                    expect(response.body).to.have.property('name').to.equal('Foo Fooing Bar');
                    done(err);
                });
        });
    });

    context('POST /user', () => {
        let create_stub, error_stub;

        it('should call users.create', (done) => {
            create_stub = sandbox.stub(users, 'create').resolves({ name: 'foo' });

            request(app).post('/user')
                .send({ name: 'foo' })
                .expect(200)
                .end((err, response) => {
                    expect(create_stub).to.have.been.calledOnce;
                    expect(response.body).to.have.property('name').to.equal('foo');
                    done(err);
                });
        });

        it('should call handleError on error', (done) => {
            create_stub = sandbox.stub(users, 'create').rejects(new Error('Fake Error'));

            error_stub = sandbox.stub().callsFake((res, err) => {
                return res.status(400).json({
                    error: 'Fake Error'
                });
            });

            app.__set__('handleError', error_stub);

            request(app).post('/user')
                .send({ name: 'foo' })
                .expect(400)
                .end((err, response) => {
                    expect(create_stub).to.have.been.calledOnce;
                    expect(error_stub).to.have.been.calledOnce;
                    expect(response.body).to.have.property('error').to.equal('Fake Error');
                    done(err);
                });
        });
    });

    context('DELETE /user/:id', () => {
        let auth_stub, delete_stub, error_stub;

        beforeEach(() => {
            auth_stub = sandbox.stub(auth, 'isAuthorized').callsFake((req, res, next) => {
                return next();
            });

            app = rewire('../../app');
        });

        it('should call auth check function and users.delete on success', (done) => {
            delete_stub = sandbox.stub(users, 'deleteUser').resolves('delete_user');

            request(app).delete('/user/123')
                .expect(200)
                .end((err, response) => {
                    expect(auth_stub).to.have.been.calledOnce;
                    expect(delete_stub).to.have.been.calledWithMatch({ id: '123', name: 'foo' });
                    expect(response.body).to.equal('delete_user');
                    done(err);
                });
        });

        it('should call handleError on error', (done) => {
            delete_stub = sandbox.stub(users, 'deleteUser').rejects(new Error('Fake Error'));

            error_stub = sandbox.stub().callsFake((res, err) => {
                return res.status(400).json({ error: err.message });
            });

            app.__set__('handleError', error_stub);

            request(app).delete('/user/123')
                .expect(400)
                .end((err, response) => {
                    expect(delete_stub).to.have.been.calledOnce;
                    expect(error_stub).to.have.been.calledOnce;
                    expect(response.body).to.have.property('error').to.equal('Fake Error');
                    done(err);
                });
        });
    });

    context('handleError()', () => {
        let handleError, res, status_stub, json_stub;

        beforeEach(() => {
            json_stub = sandbox.stub().returns('done');
            status_stub = sandbox.stub().returns({
                json: json_stub
            });

            res = {
                status: status_stub
            };

            handleError = app.__get__('handleError');
        });

        it('should check error instance and format message', (done) => {
            handleError(res, new Error('Fake Error'));

            expect(status_stub).to.have.been.calledWith(400);
            expect(json_stub).to.have.been.calledWith({
                error: 'Fake Error'
            });

            done();
        });

        it('should return object without changing it if not instance of Error', (done) => {
            let fake_custom_error = { id: 123, message: 'Fake Error Message' };

            handleError(res, fake_custom_error);

            expect(status_stub).to.have.been.calledWith(400);
            expect(json_stub).to.have.been.calledWith(fake_custom_error);

            done();
        });
    });
});