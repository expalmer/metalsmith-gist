
var equal       = require('assert-dir-equal');
var Metalsmith  = require('metalsmith');
var gist        = require('..');

describe('metalsmith-gist', function(){

  it('should get a gist from Github', function( done ){

    Metalsmith('test/fixtures')
      .use(gist())
      .build(function( err, files ){
        if ( err ) {
          return done(err);
        }
        equal('test/fixtures/expected/index.html', 'test/fixtures/build/index.html');
        done();
      });

  });

});

