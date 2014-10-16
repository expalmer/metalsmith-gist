/**
 * Module dependencies.
 */
var request = require('request');
var Q       = require('q');
var crypto  = require('crypto');
var fs      = require('fs');
var path    = require('path');

/**
* Gist prototype.
*/
var app = Gist.prototype;

/**
* Expose `plugin`.
*/
exports = module.exports = plugin;

/**
 * Metalsmith plugin to get gists on Github
 *
 * @param {Object} options (optional)
 *   @property {Array} keys
 * @return {Function}
 */

function plugin( options ) {

  var options = options || {};

  return function ( files, metalsmith, done ) {

    var app = new Gist( options, files );
    app.init( function() {
      app.showWarnings();
      done();
    });

  };

};


/**
* Initialize a new `Gist`.
*/

function Gist( options, files ) {

  this.files = files;
  this.posts = [];
  this.warnings = [];
  this.options = {
    debug: options.debug || false,
    caching: options.caching !== false, // null, undefined default to true
    cacheDir: options.cacheDir || ".gists"
  };

}

app.init = function( callback ) {

  var that = this,
      total = 0;

  Object.keys( this.files ).forEach( function( file ) {
    if ( that.files[file].gist ) {
      that.posts.push( file );
    }
  });

  if ( !this.posts.length ) {
    this.warnings.push( "you dont have posts with gist" );
    return callback();
  }

  total = this.posts.length;

  var isDone = function() {
    total -= 1;
    if ( total === 0 ) {
      return callback();
    }
  };

  this.posts.forEach( function( file ) {

    that.eachPost( file, function() {
      isDone();
    });

  });

};


app.eachPost = function( file, callback ) {

  if ( typeof this.files[file].gist === 'string' ) {
    this.files[file].gist = this.helpers.toArray( this.files[file].gist );
  }

  var that = this,
      total = this.files[file].gist.length;

  var isDone = function () {
    total -= 1;
    if ( total === 0 ) {
      return callback();
    }
  }

  var onSuccess = function ( args ) {
    that.replacePost( file, args.gist, args.res, function( res ) {
      isDone();
    });
  };

  var onFail = function ( reason ) {
    if ( reason.statusCode ) {
      that.warnings.push( reason.gist.name + " not found on Github.com (" + reason.statusCode + ")" );
    } else {
      that.warnings.push( "Error: " + reason.gist.name + ": " + ( reason.message || reason ) );
    }
    isDone();
  };

  this.files[file].gist.forEach( function( gist ) {
    that.getGist( gist ).then( onSuccess , onFail );
  });

};

app.getGist = function( gist ) {

  var cachedGist = this.options.caching && this.getCachedData( gist );
  if (cachedGist) {
    return Q({ gist: gist, res: cachedGist });
  }

  var that = this;
  var deferred = Q.defer();
  var url = this.helpers.githubUrl( gist );

  request( url, deferred.makeNodeResolver() );

  return deferred.promise
    .spread( function( response, body ) {
      if ( response.statusCode !== 200 ) {
        throw { statusCode: response.statusCode };
      }
      that.writeCachedData( gist, body );
      var res = JSON.parse(body);
      return { gist: gist, res: res };
    })
    .fail( function( reason ) {
      reason.gist = gist; // make sure we have an associated gist to the error
      throw reason;       // re-throw to keep the promise rejected
    });
};


app.replacePost = function ( file, gist, ghGist, callback ) {

  var value = this.helpers.prepareGistValue( ghGist );
      contents = this.helpers.replaceGist( this.files[file].contents, gist, value );

  this.files[file].contents = new Buffer( contents );
  callback('replaced ' + gist );

};

app.showWarnings = function() {

  if ( this.warnings.length && this.options.debug ) {
    this.warnings.forEach( function( w ) {
      console.log( "metalsmith-gist: " + w );
    });
  } else if ( this.warnings.length ) {
    console.log( "Warnings suppressed. Set debug:true to see warnings." );
  }

};

app.getCachedData = function( gist ) {
  var cacheName = path.resolve( path.join( './', this.cacheName( gist ) ) );

  if ( fs.existsSync( cacheName ) ) {
    return require( cacheName );
  } else {
    return null;
  }

};

app.writeCachedData = function( gist, body ) {

  var cacheName = this.cacheName( gist );
  this.helpers.makeCacheDir( this.options.cacheDir );
  fs.writeFileSync( cacheName, body );

};

app.cacheName = function( gist ) {

  var md5sum = crypto.createHash( 'md5' );
  md5sum.update( gist.fullName );
  var name = md5sum.digest( 'hex' );
  return path.join( this.options.cacheDir, name + '.json' );

};


/**
* Helpers
*/

app.helpers = {

  replaceGist: function( contents, gist, value ) {
    return contents.toString().replace("gist:" + gist.fullName, value);
  },

  toArray: function( gist ) {
    return gist.trim()
      .replace(/([\s,])/g,'|')
      .split('|')
      .map(function( a ) {
        var parts = a.split(':');
        return {fullName: a, name: parts[0], file: parts[1]};
      });
  },

  githubUrl: function( gist ) {
    return 'https://gist.github.com/' + gist.name + '.json' + (gist.file ? '?file=' + gist.file : '');
  },

  prepareGistValue: function( ghGist ) {
    var s = '<link rel="stylesheet" href="' + ghGist.stylesheet + '">',
        d = ghGist.div.replace(/(\r\n|\n|\r)/gm,"");
    return s + d;
  },

  makeCacheDir: function( directory ) {
    if ( !fs.existsSync( directory ) ) {
      fs.mkdir( directory );
    }
  }

};
