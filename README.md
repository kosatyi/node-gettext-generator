# Node Gettext Generator

![npm](https://img.shields.io/npm/v/node-gettext-generator.svg)
![downloads](https://img.shields.io/npm/dt/node-gettext-generator.svg)
![license](https://img.shields.io/npm/l/node-gettext-generator.svg) 
![github-issues](https://img.shields.io/github/issues/kosatyi/node-gettext-generator.svg) 

![nodei.co](https://nodei.co/npm/node-gettext-generator.png?downloads=true&downloadRank=true&stars=true)


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