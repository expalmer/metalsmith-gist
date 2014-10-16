# metalsmith-gist

A [Metalsmith](https://github.com/segmentio/metalsmith) plugin that lets you get gist from [Github Gist](https://gist.github.com)

## Installation

    $ npm install metalsmith-gist

## Usage

step 1

```js
var gist = require('metalsmith-gist');

metalsmith.use(gist({
  debug: true // optional, it's only to show simple warnings
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
