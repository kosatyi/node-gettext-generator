var generator = require('../lib/generator');

generator({
    name: 'messages',
    keywords:['_'],
    source:['./source','./templates'],
    target:'./locale',
    locales:['ru','en','uk']
})(function(){

});
