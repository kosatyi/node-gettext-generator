# Node Gettext Generator
----
## Requirements
Node Gettext Generator requires `Node v0.10.42` or greater.
## Installation
Add dependency to package.json
```php
{
  ...
  "dependencies": {
     "node-gettext-generator": "^0.2.8"
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





