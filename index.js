/**
 *
 * @type {*|exports|module.exports}
 *
 *
 *  generator({
        source:path.join(__dirname,'test'),
        target:path.join(__dirname,'locale'),
        extensions:['js','html'],
        locales:['ru','en','uk'],
        keywords:['__'],
        name:'base'
    });
*/

module.exports = require('./lib/generator');