const expect = require('chai').expect;
var chai = require('chai')
  , chaiHttp = require('chai-http');
var app = require('../app');

chai.use(chaiHttp);

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

describe('API Auth Test', function() {
    it('should return HTTP 401: ../api/coins/users (GET)', function() {

        chai.request(app)
        .get('/api/coins/users')
        .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(401);
            });
    })

    it('should return HTTP 401: ../api/coins/users/1 (GET)', function() {

        chai.request(app)
        .get('/api/coins/users/1')
        .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(401);
            });
    })

    it('should return HTTP 401: ../api/coins/awards (GET)', function() {

        chai.request(app)
        .get('/api/coins/awards')
        .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(401);
            });
    })

    it('should return HTTP 401: ../api/coins/transfers (GET)', function() {

        chai.request(app)
        .get('/api/coins/transfers')
        .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(401);
            });
    })
});