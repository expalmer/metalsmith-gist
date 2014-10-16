# metalsmith-gist

A [Metalsmith](https://github.com/segmentio/metalsmith) plugin that lets you get gist from [Github Gist](https://gist.github.com)

## Installation

    $ npm install metalsmith-gist

## Usage

step 1

```js
var gist = require('metalsmith-gist');

metalsmith.use(gist({
  debug: true,       // optional, it's only to show simple warnings
  caching: true,     // optional, to caching your gists. default is `true`
  cacheDir: '.gists' // optional, cache directory. default is `.gists`
}));
```

step 2

```
---
title: test
gist: expalmer/4bc6203dc2a3f7134e78
---

Hello World

gist:expalmer/4bc6203dc2a3f7134e78

```

## You can get single files too.

```
---
title: test
gist: expalmer/4bc6203dc2a3f7134e78 sukima/510438:load_config.rb
---

Hello World

gist:expalmer/4bc6203dc2a3f7134e78 // here we will get all files that exist in this gist

gist:sukima/510438:load_config.rb  // here we will get only a single file of this gist

```

You can put as many files as you want, you only should put on the head all files together separated by spaces, like this:

```
---
title: test
gist: expalmer/hash1 expalmer/hash2 expalmer/hash3:file1.js expalmer/hash3:file2.js
---
...
```

## CLI Usage

```json
{
  "plugins": {
    "metalsmith-gist": {
      "debug": "false"
    }
  }
}
```

## Caching

When the plugin first runs it will download all the gists referenced and store them in the `.gists` folder of the project. This will cache the content so subsequent runs will be significantly faster because they will not make network requests every time.

This also means that if you make changes to your gists you must remove the cache to receive the update. A simple way to clear the case is to remove the cache directory: (`rm .gists/*`).

There are a few options you can use to customize the caching.

* `caching` - true/false - turn on or off caching support. Default: `true`
* `cacheDir` - string - the cache directory to save to. Default: `.gists`

## License

  MIT
