const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const mongoose = require('mongoose');
const rewire = require('rewire');

const { expect } = chai;

chai.use(chaiAsPromised);
chai.use(sinonChai);

const User = require('../../../models/user');

const sandbox = sinon.createSandbox();

describe('models/user.js', () => {
    it('should return error if required fields are missing', (done) => {
        let user = new User();

        /**
         * validate is a mongoose function that will return an error containing
         * all fields that have errors
        */
        user.validate((err) => {
            expect(err.errors.name).to.exist;
            expect(err.errors.email).to.exist;
            expect(err.errors.age).to.not.exist;

            done();
        });
    });

    it('should have optional age field', (done) => {
        let user = new User({
            name: 'foo',
            email: 'foo@bar.com',
            age: 30
        });

        expect(user).to.have.property('age').to.equal(30);

        done();
    });
});