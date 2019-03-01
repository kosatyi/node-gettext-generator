# Node Gettext Generator

<p align="center">
<a href="https://www.npmjs.com/package/node-gettext-generator"><img src="https://img.shields.io/npm/v/node-gettext-generator.svg" /></a>
<a href="https://www.npmjs.com/package/node-gettext-generator"><img src="https://img.shields.io/npm/dt/node-gettext-generator.svg" /></a>
<a href="https://github.com/kosatyi/node-gettext-generator"><img src="https://img.shields.io/github/license/kosatyi/node-gettext-generator.svg" /></a>
<a href="https://kosatyi.com/"><img src="https://img.shields.io/badge/official-website-green.svg" /></a>
</p>


## Requirements

Node Gettext Generator requires `Node v0.10.42` or greater.

## Installation

Add dependency to package.json

```php
{
  ...
  "dependencies": {
     "node-gettext-generator": "^0.2.9"
  }
  ...
}
```

## Example

```javascript
var generator = require('node-gettext-generator');
generator.process({
    extract:{
        path  :['./src/views'],
        target:'./src/locale/templates.js'
    },
    params : {
        name: 'messages',
        keywords:['_'],
        source:['./src/views','./src/js/app','./src/locale'],
        target:'./locales',
        locales:['ru','en','uk','lv','cs','fr','sk']
    },
    javascript:{
        namespace:'i18n'
    }
});
```