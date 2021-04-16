const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const mongoose = require('mongoose');
const rewire = require('rewire');
const crypto = require('crypto');

const { expect } = chai;

chai.use(chaiAsPromised);
chai.use(sinonChai);

const config = require('../../../lib/config');
const utils = require('../../../lib/utils');

const sandbox = sinon.createSandbox();

describe('lib/utils.js', () => {
    let secret_stub, digest_stub, update_stub, create_hash_stub, hash;

    beforeEach(() => {
        secret_stub = sandbox.stub(config, 'secret').returns('fake_secret');
        digest_stub = sandbox.stub().returns('ABC123');
        update_stub = sandbox.stub().returns({
            digest: digest_stub
        });

        create_hash_stub = sandbox.stub(crypto, 'createHash').returns({
            update: update_stub
        });

        hash = utils.getHash('foo');
    });

    afterEach(() => {
        sandbox.restore();
    });

    context('getHash()', () => {
        it('should return null if invalid string is passed', () => {
            sandbox.reset();
    
            let hash_two = utils.getHash(null);
            let hash_three = utils.getHash(123);
            let has_four = utils.getHash({name: 'foo'});
    
            expect(hash_two).to.null;
            expect(hash_three).to.null;
            expect(has_four).to.null;

            expect(create_hash_stub).to.not.have.been.called;
        });

        it('should get secret from config', () => {
            expect(secret_stub).to.have.been.called;
        });

        it('should call crypto with correct settings and return hash', () => {
            expect(create_hash_stub).to.have.been.calledWith('md5');
            expect(update_stub).to.have.been.calledWith('foo_fake_secret');
            expect(digest_stub).to.have.been.calledWith('hex');
            expect(hash).to.equal('ABC123');
        });
    });
});