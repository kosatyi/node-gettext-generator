var filewalker  = require('filewalker');
var path        = require('path');
var fs          = require('fs');
var exec        = require('child_process').exec;
var deferred    = require('deferred');
var extend      = require('extend');
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
    if(p.directory){
        o.push('-d');
        o.push(p.directory);
    }
    o.push('-o');
    o.push(p.potfile);
    if(p.keywords){
        p.keywords.forEach(function (keyword) {
            o.push('--keyword='+keyword);
        });
    }
    o.push(p.files.join(' '));
    return execute('xgettext', o.join(' '));
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
			var tmpfile = path.join( folder , [options.name,'tmp'].join('.') );
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
				return msgAttrib('--untranslated',pofile,tmpfile);
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

Generator.msgMerge   = msgMerge;
Generator.msgAttrib  = msgAttrib;
Generator.msgFmt     = msgFmt;
Generator.removeFile = removeFile;


module.exports = Generator;