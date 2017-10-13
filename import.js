var fs = require('fs');
var mysql = require('mysql');
var cheerio = require('cheerio');
// 连接mysql
var conn = mysql.createConnection({
    host:'127.0.0.1',
    user:'root',
    password:'root',
    port:'3306',
    database:'odinms'
});
conn.connect();
function thunkify(fn){
    return function(){
        var ctx = this;
        var argv = new Array(arguments.length);
        for(var i = 0; i < arguments.length; i++){
            argv[i] = arguments[i];
        };
        return function(cb){
            argv.push(cb);
            fn.apply(ctx,argv);
        }
    }
};
function co(generator){
    var gen = generator();
    function next(value){
        var res = value ? gen.next(value) : gen.next();
        if(!res.done){
            if(typeof res.value == 'function'){
                res.value(function(err,data){
                    if(err){
                        console.log(err);
                    }else{
                        next(data);
                    };
                });
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
    };
};
var readFile = thunkify(fs.readFile);

var Import = {
    importCC : function(file){ //导入现金装备 消耗 设置
        co(function*(){
            var data = yield readFile('./string/' + file,'utf-8');
            var $ = cheerio.load(data);
            var  imgDir = $('imgdir[name="'+ file.substr(0, file.lastIndexOf('.')) +'"]').find('imgdir');
            for(var i = 0; i < imgDir.length;i++){
                var n = $(imgDir[i]);
                var id = n.attr('name');
                var name = n.find('string[name="name"]').attr('value');
                var desc = n.find('string[name="desc"]').attr('value');
                if(/^\d+$/.test(id)){
                    var hasCount = yield sql('SELECT * FROM item_list WHERE item_id = ?', [id]);
                    if(hasCount.length == 0){
                        var result = yield sql('INSERT INTO item_list(item_id,item_name,item_desc) VALUES(?,?,?)',[Number(id),name,desc && desc.replace(/(\r)*(\n)*(#[a-zA-Z0-9]*)*(#)?/g,'')]);
                        if(result.fieldCount == 0){
                            console.log( id + ' insert success');
                        }else{
                            console.log(id + ' insert success');
                        };
                    };
                };
            };
        });
    },
    importEE : function(file){ // 导入装备 其他
        co(function*(){
            var data = yield readFile('./string/' + file,'utf-8');
            var $ = cheerio.load(data);
            var  imgDir = $('imgdir[name="'+ file.substr(0, file.lastIndexOf('.')) +'"] imgdir imgdir');
            for(var i = 0; i < imgDir.length;i++){
                var n = $(imgDir[i]);
                var id = n.attr('name');
                var name = n.find('string[name="name"]').attr('value');
                var desc = n.find('string[name="desc"]').attr('value');
                if(/^\d+$/.test(id)){
                    var hasCount = yield sql('SELECT * FROM item_list WHERE item_id = ?', [id]);
                    if(hasCount.length == 0){
                        var result = yield sql('INSERT INTO item_list(item_id,item_name,item_desc) VALUES(?,?,?)',[Number(id),name,desc && desc.replace(/(\r)*(\n)*(#[a-zA-Z0-9]*)*(#)?/g,'')]);
                        if(result.fieldCount == 0){
                            console.log( id + ' insert success');
                        }else{
                            console.log(id + ' insert success');
                        };
                    };
                };
            };
        });
    },
    importMap : function(file){ // 导入装备 其他
        co(function*(){
            var data = yield readFile('./string/' + file,'utf-8');
            var $ = cheerio.load(data);
            var  imgDir = $('imgdir[name="'+ file.substr(0, file.lastIndexOf('.')) +'"] imgdir imgdir');
            for(var i = 0; i < imgDir.length;i++){
                var n = $(imgDir[i]);
                var id = n.attr('name');
                var streetName = n.find('string[name="streetName"]').attr('value');
                var mapName = n.find('string[name="mapName"]').attr('value');
                var name = (streetName ? streetName + '-' : '') + (mapName ? mapName : '');
                if(/^\d+$/.test(id)){
                    var hasCount = yield sql('SELECT * FROM map_list WHERE map_id = ?', [id]);
                    if(hasCount.length == 0){
                        var result = yield sql('INSERT INTO map_list(map_id,map_name) VALUES(?,?)',[Number(id),name]);
                        if(result.fieldCount == 0){
                            console.log( id + ' insert success');
                        }else{
                            console.log(id + ' insert success');
                        };
                    };
                };
            };
        });
    },
    importMob : function(file){ // 导入装备 其他
        co(function*(){
            var data = yield readFile('./string/' + file,'utf-8');
            var $ = cheerio.load(data);
            var  imgDir = $('imgdir[name="'+ file.substr(0, file.lastIndexOf('.')) +'"]').find('imgdir');
            for(var i = 0; i < imgDir.length;i++){
                var n = $(imgDir[i]);
                var id = n.attr('name');
                var name = n.find('string[name="name"]').attr('value');
                if(/^\d+$/.test(id)){
                    var hasCount = yield sql('SELECT * FROM mob_list WHERE mob_id = ?', [id]);
                    if(hasCount.length == 0){
                        var result = yield sql('INSERT INTO mob_list(mob_id,mob_name) VALUES(?,?)',[Number(id),name]);
                        if(result.fieldCount == 0){
                            console.log( id + ' insert success');
                        }else{
                            console.log(id + ' insert success');
                        };
                    };
                };
            };
        });
    },
    importNpc : function(file){ // 导入装备 其他
        co(function*(){
            var data = yield readFile('./string/' + file,'utf-8');
            var $ = cheerio.load(data);
            var  imgDir = $('imgdir[name="'+ file.substr(0, file.lastIndexOf('.')) +'"]').find('imgdir');
            for(var i = 0; i < imgDir.length;i++){
                var n = $(imgDir[i]);
                var id = n.attr('name');
                var name = n.find('string[name="name"]').attr('value');
                if(/^\d+$/.test(id)){
                    var hasCount = yield sql('SELECT * FROM npc_list WHERE npc_id = ?', [id]);
                    if(hasCount.length == 0){
                        var result = yield sql('INSERT INTO npc_list(npc_id,npc_name) VALUES(?,?)',[Number(id),name]);
                        if(result.fieldCount == 0){
                            console.log( id + ' insert success');
                        }else{
                            console.log(id + ' insert success');
                        };
                    };
                };
            };
        });
    },
    importSkill : function(file){ // 导入装备 其他
        co(function*(){
            var data = yield readFile('./string/' + file,'utf-8');
            var $ = cheerio.load(data);
            var  imgDir = $('imgdir[name="'+ file.substr(0, file.lastIndexOf('.')) +'"]>imgdir');
            for(var i = 0; i < imgDir.length;i++){
                var n = $(imgDir[i]);
                var id = n.attr('name');
                var name = n.find('string[name="name"]').attr('value');
                var desc = n.find('string[name="desc"]').attr('value');
                if(/^\d+$/.test(id)){
                    var hasCount = yield sql('SELECT * FROM skill_list WHERE skill_id = ?', [id]);
                    if(hasCount.length == 0){
                        var result = yield sql('INSERT INTO skill_list(skill_id,skill_name,skill_desc) VALUES(?,?,?)',[Number(id),name,desc && desc.replace(/(\r)*(\n)*(#[a-zA-Z0-9]*)*(#)?/g,'')]);
                        if(result.fieldCount == 0){
                            console.log( id + ' insert success');
                        }else{
                            console.log(id + ' insert success');
                        };
                    };
                };
            };
        });
    },
    importMonsterBook : function(file){ // 导入装备 其他
        co(function*(){
            var data = yield readFile('./string/' + file,'utf-8');
            var $ = cheerio.load(data);
            var  imgDir = $('imgdir[name="'+ file.substr(0, file.lastIndexOf('.')) +'"]>imgdir');
            for(var i = 0; i < imgDir.length;i++){
                var n = $(imgDir[i]);
                var id = n.attr('name');
                var child = n.find('imgdir');
                for(var j = 0; j < child.length; j++){
                    console.log($(child[j]).attr('name'));
                };
                // if(/^\d+$/.test(id)){
                //     var hasCount = yield sql('SELECT * FROM skill_list WHERE skill_id = ?', [id]);
                //     if(hasCount.length == 0){
                //         var result = yield sql('INSERT INTO skill_list(skill_id,skill_name,skill_desc) VALUES(?,?,?)',[Number(id),name,desc && desc.replace(/(\r)*(\n)*(#[a-zA-Z0-9]*)*(#)?/g,'')]);
                //         if(result.fieldCount == 0){
                //             console.log( id + ' insert success');
                //         }else{
                //             console.log(id + ' insert success');
                //         };
                //     };
                // };
            };
        });
    }

}
// Import.importCC('Cash.img.xml');
// Import.importCC('Consume.img.xml');
// Import.importEE('Eqp.img.xml');
// Import.importEE('Etc.img.xml');
// Import.importCC('Ins.img.xml');
// Import.importMap('Map.img.xml');
// Import.importMob('Mob.img.xml');
// Import.importNpc('Npc.img.xml');
// Import.importCC('Pet.img.xml');
// Import.importSkill('Skill.img.xml');
Import.importMonsterBook('MonsterBook.img.xml');

