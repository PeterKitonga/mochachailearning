const { expect } = require('chai');

describe('chai test', () => {
    it('should compare some values', () => {
        expect(1).to.equal(1);
    });

    it('should test some other stuff', () => {
        /**
         * 'deep' is used when testing reference types(objects/arrays)
        */
        expect({name: 'foo'}).to.deep.equal({name: 'foo'});
        /**
         * 'property' is used when testing if an object property exists
        */
        expect({name: 'foo'}).to.have.property('name').to.equal('foo');
        /**
         * used when testing booleans(false/true)
        */
        expect(5 > 8).to.be.false;
        expect(0 < 1).to.be.true;
        /**
         * 'a' can be used to test the data type of a variable/value
        */
        expect({}).to.be.a('object');
        expect('foo').to.be.a('string');
        expect(3).to.be.a('number');
        /**
         * here, we can chain multiple expectations
        */
        expect('bar').to.be.a('string').with.lengthOf(3);
        expect([1, 2, 3].length).to.equal(3);
        /**
         * used when testing if a variable/value is null
        */
        expect(null).to.be.null;
        /**
         * used when testing if a variable/value is undefined
        */
        expect(undefined).to.not.exist;
        /**
         * used when testing if a variable/value is not undefined
        */
        expect(1).to.exist;
    });
});