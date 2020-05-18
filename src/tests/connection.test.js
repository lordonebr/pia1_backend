const expect = require('chai').expect;

const { get } = require('../controllers/coinsController');

let req = {
    body: {},
    params: {},
};

const res = {
    jsonCalledWith: {},
    json(arg) {
        this.jsonCalledWith = arg
    }
}

describe('API Routes', function() {
    describe('Version Test', function() {
        it('should return object with title and version', function() {
            get(req, res);
            expect(res.jsonCalledWith).to.have.all.keys('title', 'version');
        })
    })
});