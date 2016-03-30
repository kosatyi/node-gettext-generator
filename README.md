# Node Gettext Generator
----
## Requirements
Node Gettext Generator requires `Node v0.10.42` or grater.
## Installation
Add dependency to package.json
```php
{
  ...
  "dependencies": {
     "node-gettext-generator": "git://github.com/kosatyi/node-gettext-generator"
  }
  ...
}
```
## Example
```javascript
var generator = require('node-gettext-generator');
  generator({
    name: 'messages',
    keywords:['_'],
    source:['./source_target1','./source_target2'],
    target:'./locale',
    locales:['en','de']
  })(function(){
    console.log('generation complete');
  });
```





