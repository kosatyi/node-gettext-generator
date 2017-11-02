var filewalker  = require('filewalker');
var path        = require('path');
var fs          = require('fs');
var exec        = require('child_process').exec;
var deferred    = require('deferred');
var extend      = require('extend');
var converter   = require('i18next-conv');
var util        = require('util');
/**
 *
 * @param arg
 * @returns {boolean}
 */
function isArray(arg){
    return Object.prototype.toString.call(arg) === '[object Array]';
}
/**
 *
 * @param command
 * @param onSuccess
 * @param onError
 */
function execute(command,params){
	var defer = deferred();
	exec([command,params].join(' '), function(error,stdout){
		if (error !== null)
            defer.reject(error);
		else
            defer.resolve(stdout);
	});
	return defer.promise;
};
/**
 *
 * @param p
 * @returns {*}
 */
function xGetText( p ) {
    var o  = [];
    o.push('--force-po');
    if(p.charset){
        o.push(['--from-code=', p.charset].join(''));
    }
    if(p.language){
        o.push(['--language=', p.language].join(''));
    }
    if( p.directory ){
        o.push('-d');
        o.push( p.directory );
    }
    o.push('-o');
    o.push(p.potfile);
    if(p.keywords){
        p.keywords.forEach(function (keyword) {
            o.push(['--keyword=',keyword].join(''));
        });
    }
    o.push(p.files.join(' '));
    return execute('xgettext', o.join(' ')).then(function(){

    });
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
function removeFile( filePath ) {
    return execute('rm',['-f',filePath].join(' '));
};
/**
 * 
 * @param options
 * @param input
 * @param output
 */
function msgAttrib(options,input,output) {
	return execute('msgattrib',[options,'-o',output||input,input].join(' '));
};
/**
 *
 * @param pofile
 * @param potfile
 * @returns {*}
 */
function msgMerge(pofile,potfile){
    var def = deferred();
    fs.open(pofile,'r',function (po){
        var o,c;
        if (po !== null) {
            c = 'cp';
            o = [];
            o.push(potfile);
            o.push(pofile);
        }
        else {
            c = 'msgmerge';
            o = ['-q','-U','--no-fuzzy-matching','--previous'];
            o.push(pofile);
            o.push(potfile);
        }
        execute(c, o.join(' ') ).then(function(){
            def.resolve();
        },function(e){
            def.reject(e);
        });
    });
    return def.promise;
};

function msgFmt(pofile,mofile){
    var def = deferred();
    var opt = [pofile,'-o',mofile];
    execute('msgfmt', opt.join(' ')).then(function(){
        def.resolve();
    },function(e){
        def.reject(e);
    });
    return def;
}

function findFiles(source){
	var files  = [];
	var result = deferred();
	var source = typeof(source)=='string' ? [source] : source ;
	deferred.map(source,function(folder){
		var def = deferred();
		filewalker( folder ).on('file',function(p){
			files.push(path.join(folder,p));
		}).on('done',function(){
			def.resolve();
		}).on('error', function(err){
			def.reject(err);
		}).walk();
		return def.promise;
	}).then(function(){
		result.resolve(files);
	});
	return result.promise;
};
/**
 *
 * @param arr
 * @returns {*}
 */
function arrayUnique(arr){
    var len = arr.length;
    var i = -1;
    while (i++ < len) {
        var j = i + 1;
        for (; j < arr.length; ++j) {
            if (arr[i] === arr[j]) {
                arr.splice(j--, 1);
            }
        }
    }
    return arr;
};
function charsetFix(file,charset){
    var source  = fs.readFileSync(file).toString();
        source = source.replace(/charset=CHARSET/g,['charset',charset].join('='));
    fs.writeFileSync(file,source);
    return true;
};
/**
 *
 * @param options
 */
function extractTranslation(options){
    var options = options = extend({
        match   : /_(?:\(|\s)(?:["'])(.+?)(?:["'])(?:\)|\s?)/g,
        replace : '_(\'$1\')'
    },options);
    return findFiles(options.path).then(function(files){
        var translation = [];
        files.forEach(function(file){
            var source  = fs.readFileSync(file).toString();
            var matches = source.match(options.match);
            if( matches )
                translation = translation.concat(matches);
        });
        translation = translation.map(function(item){
            item = item.trim();
            if( options.replace )
                item = item.replace(options.match,options.replace);
            return item;
        })
        translation = arrayUnique(translation);
        fs.writeFileSync(options.target,translation.join('\n'));
        return this;
    });
};
/**
 *
 * @param options
 */
function GetTextGenerator(options){
    var locales   = options.locales  || [];
    var keywords  = options.keywords || [];
	var defer     = deferred();
	findFiles(options.source).then(function(files){
		deferred.map(locales,function(locale) {
			var folder  = createFolders( options.target , [ locale , 'LC_MESSAGES' ] );
			var potfile = path.join( folder , [options.name,'pot'].join('.') );
			var pofile  = path.join( folder , [options.name,'po'].join('.') );
			var mofile  = path.join( folder , [options.name,'mo'].join('.') );
			return removeFile( potfile ).then(function(){
				return xGetText({
					potfile   : potfile ,
					keywords  : keywords ,
					files     : files ,
					language  : options.language,
					charset   : options.charset
				});
			}).then(function(){
				return msgMerge(pofile,potfile);
			}).then(function(){
                return charsetFix(pofile,options.charset);
            }).then(function(){
				return msgFmt(pofile,mofile);
			}).then(function(){
				return removeFile(potfile);
			});
		})(function(){
			defer.resolve();
		});
    });
	return defer.promise;
};

/**
 *
 * @param params
 * @returns {*}
 */
function generateJSON( params ){
    var result = deferred();
    deferred.map(params.locales,function(lang){
        var defer = deferred();
        var basepath = path.resolve([params.target,lang].join('/'));
        var source = path.resolve([params.target,lang,'LC_MESSAGES',[params.name,'.po'].join('')].join('/') );
        var target = path.resolve([params.target,lang,'translation.json'].join('/'));
        converter.gettextToI18next(lang,source,target,{
            quiet : true,
            headers:{
                charset:'utf-8'
            }
        },function(){
            defer.resolve({
                lang:lang,
                path:basepath,
                file:target
            });
        });
        return defer.promise;
    })(function (data) {
        result.resolve(data);
    });
    return result.promise;
};


function generateJS(data,options){
    data.forEach(function(item){
        var source  = fs.readFileSync(item.file);
        var target  = path.resolve([item.path,'translation.js'].join('/'));
        var content = util.format('(function(k,v){this[k]=v})(%j,%s);',item.lang,source.toString());
        fs.writeFileSync(target,content);
    });
}

/**
 *
 * @param options
 * @constructor
 */
function Generator(options){
    return GetTextGenerator(extend({
        name:'base',
        language:'JavaScript',
        charset:'UTF-8',
        keywords:[],
        source:['.'],
        target:'.',
        locales:[]
    },options));
};

Generator.extractTranslation   = extractTranslation;
Generator.generateJSON = generateJSON;
Generator.generateJS = generateJS;
Generator.msgMerge   = msgMerge;
Generator.msgAttrib  = msgAttrib;
Generator.msgFmt     = msgFmt;
Generator.removeFile = removeFile;
Generator.execute    = execute;
Generator.process = function(options){
    return Generator.extractTranslation(options.extract).then(function(){
        return Generator(options.params);
    }).then(function(){
        return Generator.generateJSON(options.params);
    }).then(function( data ){
        if( options.javascript ){
            return Generator.generateJS(data,options.javascript);
        }
    });
};

module.exports = Generator;