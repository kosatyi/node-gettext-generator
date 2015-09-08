var filewalker  = require('filewalker');
var path        = require('path');
var fs          = require('fs');
var exec        = require('child_process').exec;
var deferred    = require('deferred');
var extend      = require('extend');
/**
 *
 * @param p
 * @returns {*}
 */
function xgettext( p ) {
    var o  = [];
    o.push('--force-po');
    o.push('--from-code=UTF-8');
    o.push('--language=Python');
    if(p.j) o.push('-j');
    if(p.directory){
        o.push('-d');
        o.push(p.directory);
    }
    o.push( '-o' );
    o.push( p.potfile );
    p.keywords.forEach(function (keyword) {
        o.push('--keyword='+keyword);
    });
    o.push(p.files.join(' '));
    return execute('xgettext', o.join(' '));
};
/**
 *
 * @param command
 * @param onSuccess
 * @param onError
 */
function execute(command,params){
    var def = deferred();
    console.log([command,params].join(' '));
    exec([command,params].join(' '), function(error,stdout){
        if (error !== null)
            def.reject(error);
        else
            def.resolve(stdout);
    });
    return def.promise;
};
/**
 *
 * @param target
 * @param folders
 * @returns {*}
 */
function createFolders(target, folders ){
    folders.forEach(function(item){
        target = path.join(target,item);
        if(!fs.existsSync(target)) fs.mkdirSync(target);
    });
    return target;
};
/**
 *
 * @param filePath
 * @param onSuccess
 */
function removeFile(filePath,onSuccess) {
    return execute('rm',['-f',filePath].join(' '));
};
/**
 *
 * @param opts
 * @param onSuccess
 * @param outputPath
 * @param inputPath
 */
function editPOFile (opts, onSuccess, outputPath, inputPath) {
    var opts = opts || '';
    outputPath = outputPath || poFilePath;
    inputPath = inputPath || poFilePath;
    opts += ' -o ' + outputPath;
    return execute('msgattrib',[opts,inputPath].join(' '));
};
/**
 *
 * @param pofile
 * @param potfile
 * @returns {*}
 */
function mergePoFile(pofile,potfile){
    var def = deferred();
    fs.open(pofile,'r',function (error){
        var o;
        if (error !== null) {
            o = [];
            o.push(potfile);
            o.push(pofile);
            execute('cp',o.join(' ')).then(function(){
                def.resolve();
            },function(){
                def.reject();
            });
        }
        else {
            o = ['-q','-U','--no-fuzzy-matching','--previous'];
            o.push(pofile);
            o.push(potfile);
            execute('msgmerge', o.join(' ')).then(function(){
                def.resolve();
            },function(e){
                def.reject(e);
            });
        }
    });
    return def.promise;
};
/**
 *
 * @param options
 */
function buildFiles(options){
    var files     = [];
    var locales   = options.locales  || [];
    var directory = options.source   || '.';
    var keywords  = options.keywords || [];

    filewalker( options.source ).on('file',function(p,s,f){
        files.push(path.join(options.source,p));
    }).on('done',function(){
        locales.forEach(function(locale){
            var folder  = createFolders( options.target , [ locale , 'LC_MESSAGES' ] );
            var potfile = path.join( folder , [options.name,'pot'].join('.') );
            var pofile  = path.join( folder , [options.name,'po'].join('.') );
            removeFile( potfile ).then(function(){
                return xgettext({
                    potfile   : potfile ,
                    directory : directory ,
                    keywords  : keywords ,
                    files     : files
                });
            }).then(function(){
                return mergePoFile(pofile,potfile);
            }).then(function(){
                return removeFile(potfile);;
            });
        });
    }).on('error', function(err) {
        console.error(err);
    }).walk();
};

module.exports = function(options){
    buildFiles( extend({
        name:'base',
        keywords:[],
        source:'.',
        target:'.',
        locales:[]
    },options));
};