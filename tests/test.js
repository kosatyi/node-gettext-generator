var generator = require('../lib/generator');


generator({
    name: 'messages',
    keywords:['_'],
    source:['./source','./templates'],
    target:'./locale',
    locales:['ru','en','uk']
})(function(){
	
});

generator.extractTranslation({
    path    : ['./source','./templates'],
    match   : /_(?:\(|\s)(?:["'])(.+?)(?:["'])(?:\)|\s?)/g,
    replace : '_(\'$1\')',
    target  : './templates.js'
}).then(function(){

});
