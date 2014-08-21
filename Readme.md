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

## License

  MIT