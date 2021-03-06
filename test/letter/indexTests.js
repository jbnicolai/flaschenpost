'use strict';

var stream = require('stream');

var assert = require('assertthat');

var letter = require('../../lib/letter');

var Transform = stream.Transform;

suite('letter', function () {
  test('is a transform stream.', function (done) {
    assert.that(letter).is.instanceOf(Transform);
    done();
  });

  suite('write', function () {
    test('returns a paragraph.', function (done) {
      var expected = {
        level: 'info',
        message: 'App started.',
        module: {
          name: 'foo',
          version: '0.0.1'
        }
      };

      letter.once('data', function (paragraph) {
        assert.that(paragraph).is.ofType('object');
        assert.that(paragraph.pid).is.equalTo(process.pid);
        assert.that(paragraph.id).is.ofType('number');
        assert.that(paragraph.timestamp).is.not.undefined();
        assert.that(paragraph.level).is.equalTo(expected.level);
        assert.that(paragraph.message).is.equalTo(expected.message);
        assert.that(paragraph.module).is.equalTo(expected.module);
        assert.that(paragraph.source).is.undefined();
        assert.that(paragraph.metadata).is.undefined();
        done();
      });

      letter.write(expected);
    });

    test('returns a paragraph with a formatted message when data is given.', function (done) {
      var input = {
        level: 'info',
        message: 'App {{foo}} started.',
        metadata: {
          foo: 'bar'
        },
        module: {
          name: 'foo',
          version: '0.0.1'
        }
      };

      var expected = 'App bar started.';

      letter.once('data', function (paragraph) {
        assert.that(paragraph.message).is.equalTo(expected);
        done();
      });

      letter.write(input);
    });

    test('returns a paragraph with source information if they are given.', function (done) {
      var expected = {
        level: 'info',
        message: 'App started.',
        source: __filename,
        module: {
          name: 'foo',
          version: '0.0.1'
        }
      };

      letter.once('data', function (paragraph) {
        assert.that(paragraph.source).is.equalTo(expected.source);
        done();
      });

      letter.write(expected);
    });

    test('returns a paragraph with metadata if they are given.', function (done) {
      var expected = {
        level: 'info',
        message: 'App started.',
        metadata: {
          foo: 'bar'
        },
        module: {
          name: 'foo',
          version: '0.0.1'
        }
      };

      letter.once('data', function (paragraph) {
        assert.that(paragraph.metadata).is.equalTo(expected.metadata);
        done();
      });

      letter.write(expected);
    });

    test('returns a paragraph with metadata with correctly transformed error objects.', function (done) {
      var expected = {
        level: 'info',
        message: 'App started.',
        metadata: {
          foo: 'bar',
          err: new Error('foobar')
        },
        module: {
          name: 'foo',
          version: '0.0.1'
        }
      };

      letter.once('data', function (paragraph) {
        assert.that(paragraph.metadata.err).is.ofType('object');
        assert.that(paragraph.metadata.err).is.not.instanceOf(Error);
        assert.that(paragraph.metadata.err.name).is.equalTo('Error');
        assert.that(paragraph.metadata.err.message).is.equalTo('foobar');
        assert.that(paragraph.metadata.err.stack).is.ofType('string');
        done();
      });

      letter.write(expected);
    });

    test('increments the paragraph id by 1.', function (done) {
      var input = {
        level: 'info',
        message: 'App started.',
        module: {
          name: 'foo',
          version: '0.0.1'
        }
      };

      letter.once('data', function (firstParagraph) {
        var firstId = firstParagraph.id;

        letter.once('data', function (secondParagraph) {
          var secondId = secondParagraph.id;

          assert.that(firstId).is.lessThan(secondId);
          assert.that(firstId + 1).is.equalTo(secondId);
          done();
        });
      });

      letter.write(input);
      letter.write(input);
    });
  });
});
