var generator = require('../lib/generator');

generator({
    name: 'messages',
    keywords:['_'],
    source:'./source',
    target:'./locale',
    locales:['ru','en','uk']
});