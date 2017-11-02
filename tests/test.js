var generator = require('../lib/generator');

generator.process({
    javascript:true,
    extract:{
        path    : ['./source'],
        match   : /_(?:\(|\s)(?:["'])(.+?)(?:["'])(?:\)|\s?)/g,
        replace : '_(\'$1\')',
        target  : './extract/templates.js'
    },
    params : {
        name: 'messages',
        keywords:['_'],
        source:['./source','./extract'],
        target:'./locale',
        locales:['ru','en','uk']
    }
});