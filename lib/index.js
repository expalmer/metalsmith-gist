/**
 * Module dependencies.
 */
var request = require('request');
var Q       = require('q');

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
    debug: options.debug || false
  };

};

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

  var onFail = function ( gist ) {
    that.warnings.push( gist + " don't found on Github.com" );
    isDone();
  };

  this.files[file].gist.forEach( function( gist ) {
    that.getGist( gist ).then( onSuccess , onFail );
  });

};

app.getGist = function( gist ) {

  var deferred = Q.defer();
  var url = this.helpers.githubUrl( gist );

  request( url , function ( error, response, body ) {
    if ( !error && response.statusCode === 200 ) {
      var res = JSON.parse(body);
      deferred.resolve( { gist: gist, res: res } );
    } else {
      deferred.reject( gist );
    }

  });

  return deferred.promise;

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
  }

};


/**
* Helpers
*/

app.helpers = {

  replaceGist: function( contents, gist, value ) {
    return contents.toString().replace("gist:" + gist, value);
  },

  toArray: function( gist ) {
    return gist.trim()
      .replace(/([\s-,])/g,'|')
      .split('|')
      .filter(function( a ){ return a; } );
  },

  githubUrl: function( gist ) {
    return 'https://gist.github.com/' + gist + '.json';
  },

  prepareGistValue: function( ghGist ) {
    var s = '<link rel="stylesheet" href="' + ghGist.stylesheet + '">',
        d = ghGist.div.replace(/(\r\n|\n|\r)/gm,"");
    return s + d;
  }

};
