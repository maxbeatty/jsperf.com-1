var Lab = require('lab');
var Code = require('code');
var proxyquire = require('proxyquire');
var EventEmitter = require('events').EventEmitter;

var httpStub = {};

var browserscope = proxyquire('../../../server/repositories/browserscope', {
  http: httpStub
});

var lab = exports.lab = Lab.script();

lab.experiment('Browserscope Repository', function () {
  lab.experiment('addTest', function () {
    var emitter;

    lab.before(function (done) {
      httpStub.get = function (url, cb) {
        cb(emitter);

        return emitter;
      };

      done();
    });

    lab.beforeEach(function (done) {
      emitter = new EventEmitter();

      done();
    });

    lab.test('returns a test key', function (done) {
      var testKey = 123;
      var testResp = JSON.stringify({ 'test_key': testKey });

      browserscope.addTest('My Test', 'is great', 'great-test')
      .then(function (key) {
        Code.expect(key).to.equal(testKey);

        done();
      });

      // verify these events have listeners
      Code.expect(emitter.emit('data', testResp)).to.be.true();
      Code.expect(emitter.emit('end')).to.be.true();
    });

    lab.test('returns an error when response is wrong', function (done) {
      browserscope.addTest('My Test', 'is great', 'great-test')
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.include('Unexpected response');

        done();
      });

      emitter.emit('end');
    });

    lab.test('returns an error when anything else goes wrong', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);

      browserscope.addTest('My Test', 'is great', 'great-test')
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });

      // verify event has listener
      Code.expect(emitter.emit('error', testErr)).to.be.true();
    });
  });
});
