var generator = require('../lib/generator');

generator({
    name: 'messages',
    keywords:['__'],
    source:'./source',
    target:'./locale',
    locales:['ru','en','uk']
})(function(){

});
