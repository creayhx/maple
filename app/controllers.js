var crypto = require('crypto');
var mysql = require('mysql');
var fs = require('fs');
var sqlConfig = require('./sqlConfig').sqlConfig;

// 连接mysql
var conn = mysql.createConnection(sqlConfig);
conn.connect();

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
function thunkify(fn){
    return function(){
        var argv = [...arguments]
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
function sql(sql,val){
    return function(cb){
        conn.query(sql,val,cb);
    }
}
function result(data, result, msg) {
	//接口返回消息
	return {
		data: data,
		result: result,
		msg: msg
	}
}

function getSalt() {
	var res = '';
	var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
	for (var i = 0; i < 32; i++) {
		var id = Math.ceil(Math.random() * chars.length);
		res += chars[--id];
	}
	return res.toLowerCase();
}
function getTime(time) {
	var now = time ? new Date(time) : new Date();
	return now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
}
// **预留资源结束
exports.index = function(req, res) {
	//首页
	res.render('index', {
		title: 'MapleStory'
	})
}
exports.login = function(req, res) {
	//登录页面
	res.header('Content-Disposition','attachment;filename=FileName.txt');
	res.render('login', {
		title: 'login'
	})
}
exports.reg = function(req, res) {
	//注册页面
	res.render('register', {
		title: 'register'
	})
}
exports.signin = function(req, res) {
	//登录
	var _user = req.body; //获取表单中的user对象信息
	conn.query('select * from accounts where name = ?', [_user.name], function(err, ret, fields) {
		if (ret && ret.length > 0) {
			//todo  判断是否有数据
			if (ret[0].salt) {
				// 判断是否加盐
				var password = crypto.createHash('sha512').update(_user.password + ret[0].salt).digest('hex');
				if (password == ret[0].password) {
					req.session.user = ret[0];
					res.json(result(null, true, '正常登录'))
				} else {
					res.json(result(null, false, '密码错误'))
				}
			} else {
				//未加盐可能是由工具生成的帐号
				var password = crypto.createHash('sha1').update(_user.password).digest('hex');
				if (password = ret[0].password) {
					req.session.user = ret[0];
					res.json(result(null, true, '帐号未登录游戏,可以正常登录'))
				} else {
					res.json(result(null, false, '密码错误'))
				}
			}
		} else {
			res.json(result(null, false, '未找到用户'))
		}
	});
}
exports.singup = function(req, res) {
	//注册
	var newUser = req.body;
	var salt = getSalt();
	var password = crypto.createHash('sha512').update(newUser.userPassword + salt).digest('hex');
	var time = getTime();
	conn.query('SELECT name FROM accounts WHERE name = ? limit 1', [newUser.userName], function(err, ret, fiels) {
		if (ret.length == 0) {
			conn.query(
				'INSERT INTO accounts(name,password,salt,createdat,birthday,banned,gm,forumaccid,lastpwemail,tempban,present,cmsloggedin,lastvote,monthvotes,totalvotes,admin,gender,pin,jfmoney,money,boss) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [newUser.userName, password, salt, time, time, 0, 0, 0, time, time, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0],
				function(err, ret, fields) {
					if (!ret.fieldCount) {
						res.json(result(null, true, '注册成功'));
					} else {
						res.json(result(null, false, '注册失败'));
					}
				}
			)
		} else {
			res.json(result(null, false, '用户已存在'))
		}
	});
};
exports.logout = function(req, res) {
	//注销帐号
	var userName = req.body.userName;

	if (req.session.user.name == userName) {
		delete req.session.user;
		res.json(result(null, true, null))
	} else {
		res.json(result(null, false, '退出失败'))
	}
}
exports.vdetail = function(req, res) {
	var name = req.params.name;
	res.render('vdetail', {
		title: "MapleStory Video",
		name: name
	})
};

exports.udetail = function(req, res) {
	conn.query('SELECT * FROM accounts Where name = ?', [req.session.user.name], function(err, result, fileds) {
		res.render('udetail', {
			title: 'MapleStory User Detail',
			gameUser: result[0]
		})
	})
};
exports.pdetail = function(req, res) {
	conn.query('SELECT * FROM characters where characters.accountid in (SELECT accounts.id FROM accounts where accounts.name=?)', [req.session.user.name], function(err, result, fileds) {
		if (result) {
			res.render('pdetail', {
				title: 'MapleStory Player Detail',
				players: result
			})
		}
	})
};
exports.pitem = function(req, res) {
	var players = null;
	var items = null;
	conn.query('SELECT name FROM characters where accountid in (SELECT id FROM accounts where name=?)', [req.session.user.name], function(err, result, fileds) {
		if (result) {
			res.render('playeritem', {
				title: 'MapleStory Player Detail',
				players: result
			})
		}
	})
};
exports.mdetail = function(req,res){
	co(function*(){
		res.render('mdetail',{
			title:"Monster"
		})
	})
}
exports.Item = function(req, res) {
	var name = req.body.name;
	conn.query('SELECT * FROM inventoryitems WHERE characterid in (SELECT id FROM characters WHERE name = ? ) ORDER BY inventorytype,position', [name], function(err, ret, fileds) {
		if (ret && ret.length > 0) {
			res.json(result(ret, true, null));
		} else {
			res.json(result(null, false, '未查询到数据'));
		}
	})
};

exports.loginVer = function(req, res, next) {
	if (req.session.user) {
		console.log('已登录')
		res.redirect('/')
	} else {
		next();
	}
}
exports.onLogin = function(req, res, next) {
	if (req.session.user) {
		next();
	} else {
		res.redirect('/');
	}
}

exports.search = function(req, res) {
	var type = req.params.type;
	if (type == 'gm') {
		res.render('search', {
			title: 'MapleStory Item Search',
			type: type,
			datas: gm
		})
	} else {
		res.render('search', {
			title: 'MapleStory Item Search',
			type: type
		})
	}

}

function sendData(res, ret) {
	//发送查询数据
	if (ret && ret.length > 0) {
		res.json(result(ret, true, null))
	} else {
		res.json(result(null, false, '未找到数据'));
	}
}

exports.searchItem = function(req, res) {
	var content = isNaN(req.body.val) ? req.body.val : parseInt(req.body.val);
	var type = req.body.type;
	var table = '';
	/^\d+$/.test(content) ? (table = type + '_id') : (table = type + '_name');
	conn.query('SELECT ' + type + '_id,' + type + '_name FROM ' + type + '_list WHERE ' + table + ' LIKE "%' + content + '%"', function(err, result, fileds) {
		sendData(res, result);
	})
}
exports.itemDrop = function(req, res) {
	var id = req.body.id;
	var type = req.body.type;
	if (type == 'item') {
		conn.query('SELECT M.mob_id,D.chance,M.mob_name FROM monsterdrops as D join mob_list as M on D.itemid=' + id + ' and D.monsterid=M.mob_id group by D.monsterid order by D.chance', function(err, result, fields) {
			sendData(res, result);
		})
	} else if(type == 'mob') {
		conn.query('SELECT I.item_id,D.chance,I.item_name FROM monsterdrops as D join item_list as I on D.monsterid=' + id + ' and D.itemid=I.item_id group by D.itemid order by D.chance', function(err, result, fields) {
			sendData(res, result);
		})
	} else if(type =='map'){
		conn.query('SELECT Mob.mob_id,Mob.mob_name FROM mob_list as Mob join mob_map as MM on Mob.mob_id=MM.mob_id and MM.map_id=?',[id],function(err,result,fields){
			sendData(res,result);
		})
	}
}
exports.Item = function(req, res) {
	var name = req.body.name;
	conn.query('select Inv.itemid,I.item_base,Inv.inventorytype,Inv.position,Inv.quantity from inventoryitems as Inv join characters as C on Inv.characterid=C.id and C.name=? join item_list as I on Inv.itemid=I.item_id group by Inv.inventorytype,Inv.position;', [name], function(err, result, fileds) {
		sendData(res, result);
	});
};
exports.mobDetail = function(req,res){
	var type = req.body.type;
	var id = req.body.id;
	co(function*(){
		var resp = yield sql('SELECT * FROM mob_detail WHERE mob_id = ?',[id]);
		sendData(res,resp);
	});
}
exports.errorPage = function(req, res) {
	res.render('error', {
		title: '页面未找到'
	})
}
exports.redirectPage = function(req, res, next) {
	res.redirect('/error');
	next();
}

exports.fileDownload = function(req,res){
	res.download('./resources/Images/表情/pia.png','表情.png');
};