var Control = require('./controllers')

module.exports = function(app){
	app.use(function(req,res,next){
		app.locals.user = req.session.user;
		next();
	});

	app.get('/',Control.index); //打开首页
	app.get('/login',Control.loginVer,Control.login); //登录
	app.get('/reg',Control.reg); //注册
	app.get('/vdetail/:name',Control.vdetail);//视频
	app.get('/user',Control.udetail);//用户信息
	app.get('/players',Control.pdetail);//人物信息
	app.get('/search',Control.search);//搜索页面
	app.get('/item',Control.pitem) // 物品详情
	app.get('/mob',Control.mdetail) // 怪物详情
	app.get('/fileDownload',Control.fileDownload)
	app.get('/error',Control.errorPage)//404页面
//接口
	app.post('/signin',Control.signin);//登录
	app.post('/signup',Control.singup);//注册
	app.post('/logout',Control.onLogin,Control.logout);//注销
	app.post('/searchItem',Control.searchItem)//搜索物品
	app.post('/itemDrop',Control.itemDrop)//搜索物品爆率
	app.post('/item',Control.Item);//查看人物身上的装备
	app.post('/mobDetail',Control.mobDetail);//查看人物身上的装备
	app.get('*',Control.redirectPage)// 404跳转
};