const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const mongoose = require('mongoose');
const rewire = require('rewire');

const { expect } = chai;

chai.use(chaiAsPromised);
chai.use(sinonChai);

let mailer = rewire('../../../lib/mailer');
const { sendWelcomeEmail, sendPasswordResetEmail } = mailer;

const sandbox = sinon.createSandbox();

describe('lib/mailer.js', () => {
    let email_stub;

    beforeEach(() => {
        email_stub = sandbox.stub().resolves('email_sent');
        mailer.__set__('sendEmail', email_stub);
    });

    afterEach(() => {
        sandbox.restore();

        mailer = rewire('../../../lib/mailer');
    });

    context('sendWelcomeEmail()', () => {
        it('should check for email and name', () => {
            expect(sendWelcomeEmail()).to.eventually.be.rejectedWith('Invalid input');
            expect(sendWelcomeEmail('foo@bar.com')).to.eventually.be.rejectedWith('Invalid input');
        });

        it('should call sendEmail with email and message', async () => {
            await mailer.sendWelcomeEmail('foo@bar.com', 'foo');

            expect(email_stub).to.have.been.calledWith('foo@bar.com', 'Dear foo, welcome to our family!');
        });
    });

    context('sendPasswordResetEmail()', () => {
        it('should check for email', () => {
            expect(sendPasswordResetEmail()).to.eventually.be.rejectedWith('Invalid input');
        });

        it('should call sendEmail with email and message', async () => {
            await mailer.sendPasswordResetEmail('foo@bar.com');

            expect(email_stub).to.have.been.calledWith('foo@bar.com', 'Please click http://some_link to reset your password.');
        });
    });

    context('sendEmail()', () => {
        let sendEmail;

        beforeEach(() => {
            mailer = rewire('../../../lib/mailer');
            sendEmail = mailer.__get__('sendEmail');
        });

        it('should check for email and body', () => {
            expect(sendEmail()).to.eventually.be.rejectedWith('Invalid input');
            expect(sendEmail('foo@bar.com')).to.eventually.be.rejectedWith('Invalid input');
        });

        it('should send email with email and message', async () => {
            let result =  await sendEmail('foo@bar.com', 'Fake email message');

            expect(result).to.equal('Email Sent!');
        });
    });
});