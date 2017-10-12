/*用作导入数据用途*/

var fs = require('fs');
var mysql = require('mysql');
var cheerio = require('cheerio');

var conn = mysql.createConnection(require('./app/sqlConfig').sqlConfig);
    conn.connect();

function thunkify(fn){
    return function(){
        var argv = Array.prototype.slice.call(auguments);
        var ctx = this;
        return function(done){
            argv.push(done);
            try{
                fn.apply(ctx,argv);
            }catch(err){
                console.log(err);
            };
        };
    };
};
function co(generator){
    var gen = generator();
    function next(value){
        var res = value ? gen.next(value) : gen.next();
        if(!res.done){
            if( typeof res.value === 'function'){
                res.value(function(err,result){
                    if(err){console.log(err)}
                    next(result);
                })
            }else{
                next(res.value);
            };
        };
    };
    next();
};

function sql(sql,val){
    return function(cb){
        conn.query(sql,val,cb);
    }
}

var readFloder = thunkify(fs.readdir);
var readFile = thunkify(fs.readFile);
//


function importItemString(){
    //导入物品详情
    co(function*(){
        var files = yield readFloder('./Data/String/Item/');
        for(let i of files){
            var file = yield readFile(`./Data/String/Item/${i}`,'utf-8')
            var $ = cheerio.load(file);
            var imgDir = $('imgDir');
            for(let j = 0; j < imgDir.length; j++){
                var id = parseInt( $(imgDir[j]).attr('name') );
                if(!isNaN(id) ){
                    var name = $(imgDir[j]).find('string[name=name]').attr('value');
                    var desc = $(imgDir[j]).find('string[name=desc]').attr('value');
                    name = name ? name : '';
                    desc = desc ? desc : '';
                    var text = (name && desc) ? (name + '-' + desc):(name + desc);
                    var exist = yield sql('select * from item_list where item_id = ?',[id]);
                    if(exist && exist.length == 0){
                        var resp = yield sql('INSERT INTO item_list(item_id,item_name) values(?,?)',[id,text])
                        if(resp){
                            console.log(`${id} Success`);
                        }
                    }else{
                        console.log(`${id} Exist`)
                    }
                }
            }
        }
    })
}

function importMobDetail(){
    //导入怪物详情
    function contains(arr, obj) {
      var i = arr.length;
      while (i--) {
        if (arr[i] === obj) {
          return true;
        }
      }
      return false;
    }
    co(function*(){
        var files = yield readFloder('./Data/Mob/');
        var mobArr = ["bodyAttack", "level", "maxHP", "maxMP", "speed", "PADamage", "PDDamage", "MADamage", "MDDamage", "acc", "eva", "exp", "undead", "pushed", "summonType", "mobType","boss"];
        for(let i = 0; i < files.length; i++){
            var id = parseInt(files[i].split('.')[0]);
            var file = yield readFile(`./Data/Mob/${files[i]}`,'utf-8')
            var $ =cheerio.load(file);
            var int = $('int');
            for(let j = 0; j < int.length; j++){
                var name = $(int[j]).attr('name');
                var value = $(int[j]).attr('value');
                if(contains(mobArr,name)){
                    var resp = yield sql(`UPDATE mob_detail SET ${name}=${value} where mob_id=${id}`);
                    if(resp){
                        console.log(`${id} ${name} Success`);
                    }
                }
            }
        }
    })
}

function importItemImgBase(){
    //导入Item  base64
    co(function*(){
        var floder = yield readFloder('./Data/Item/');
        for(let i = 0; i < floder.length; i++){
            var files = yield readFloder(`./Data/Item/${floder[i]}`);
            for(let j = 0; j < files.length; j++){
                var file = yield readFile(`./Data/Item/${floder[i]}/${files[j]}`,'utf-8');
                var $ = cheerio.load(file);
                var imgDir = $('imgdir');
                for(let m = 0; m < imgDir.length; m++){
                    var k = imgDir[m];
                    var name = $(k).attr('name');
                    if(/^\d{6,}$/.test(name)){
                        var id = parseInt(name);
                        var base = $(k).find('canvas[name=icon]').attr('basedata');
                        if(!base){
                            var addr = $(k).find('uol').attr('value')
                            if(addr){
                                var prevId = addr.match(/\d{6,}/);
                                base = $('imgDir[name='+prevId+']').find('canvas[name=icon]').attr('basedata');
                            }
                        }
                        var res = yield sql('UPDATE item_list SET item_base = ? WHERE item_id = ?',[base,id]);
                        if(res){
                            console.log(`${id} Success`)
                        };

                    };
                };
            };
        };
    });
}
function importMobImgBase(){
    co(function*(){
        var files = yield readFloder('./Data/Mob/');
        for(let i = 0; i < files.length; i++){
            var file = yield readFile(`./Data/Mob/${files[i]}`,'utf-8')
            var id = parseInt(files[i].split('.')[0]);
            var $ = cheerio.load(file);
            var imgDir = $('imgDir');
            for(let j = 0; j < imgDir.length; j++){
                let k = imgDir[j];
                let name = $(k).attr('name');
                if(name.indexOf('stand') != -1 || name.indexOf('fly') != -1){
                    base = $(k).find('canvas').attr('basedata');
                    var res = yield sql('UPDATE mob_list SET mob_base = ? WHERE mob_id = ?',[base,id])
                    console.log(`${id} Success`)
                }
            }
        }
    });
};
function importCharacterBase(){
    co(function*(){
        var floder = yield readFloder('./Data/Character/');
        for(let i = 0; i < floder.length; i++){
            var files = yield readFloder(`./Data/Character/${floder[i]}`);
            for(let j = 0; j < files.length; j++){
                var file = yield readFile(`./Data/Character/${floder[i]}/${files[j]}`,'utf-8');
                var id = parseInt(files[j].split('.')[0]);
                var $ = cheerio.load(file);
                var base = $('imgDir canvas[name=icon]').attr('basedata');
                var res = yield sql('UPDATE item_list SET item_base = ? WHERE item_id = ?',[base,id]);
                if(res){console.log(`${id} Success`)};
            };
        };
    });
};

function importMonsterMap(){
    co(function*(){
        var file = yield readFile('./Data/String/MonsterBook/MonsterBook.img.xml');
        var $ = cheerio.load(file);
        var imgDir = $('imgDir');
        for(let i = 0; i < imgDir.length; i++){
            var k = imgDir[i];
            var name = $(k).attr('name');
            if(/\d{6,}/.test(name)){
                var maps = $(k).find('imgDir[name=map] int');
                for(let j = 0; j < maps.length; j++){
                    var value = $(maps[j]).attr('value');
                    var res = yield sql('INSERT INTO mob_map(mob_id,map_id) VALUES (?,?)',[name,value]);
                    if(res){console.log(`${name} Success`)}
                };
            };

        };
    });
};
