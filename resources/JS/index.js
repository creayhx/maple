$(function(){
	window.maple = {
		type:location.href.split('/')[location.href.split('/').length-1],
		equa : '',
		use : '',
		opt : '',
		items : '',
		spec : '',
		index : null,
		start:function(){
			var that = this;
			var inputAll = [];
			var $inputAll = $('.userlogin input');
			for(var i = 0; i < $inputAll.length; i++){
				inputAll.push( $inputAll[i] )
			}
			$('.userlogin input').blur(function(){ //输入验证
				if( $(this).val() == '' && $(this).attr('class') != 'reg' ){
					$(this).css('border','1px solid red')
				}else{
					$(this).css('border','')
				};
			});
			$('.reg').click(function(){ //注册验证
				that.verification(inputAll);
			})
			$('.login').click(function(){ //登录验证
				that.verification(inputAll);
			})

			// ****************login and register*********************

			$('.logout').click(function(){ //注销
				$.ajax({
					type:'post',
					url:'/logout',
					data:{username:$('.user').text()},
					success:function(data){
						if(data.success){
							window.location.reload();
						}
					}
				})
			});

			// ****************loginOut*********************

			$('.user').click(function(){ //打开菜单  关闭菜单
				var state = $('.tool');
				if(state.css('display') == 'none'){
					state.css('display','block');
				}else{
					state.css('display','none');
				}
				return false;
			})
			$(document).click(function(){  //菜单消失
				$('.tool').hide();
				$('.plist').hide();
			});
			$('.close').click(function(){ //关闭绑定窗口
				$('.index-alert').hide();
			});
			var musicon = $('.item-music'); //初始化为全部歌曲
			$('.item-music').click(function(){ //歌曲切换
				musicon.removeClass('item-music-on');
				$('audio').attr('src','../Sounds/'+$(this).text()+'.mp3')
				$('audio')[0].play();
				musicon = $(this);
				$(this).addClass('item-music-on');
				$('.item-control').removeClass('item-music-play').addClass('item-music-pause').show();
			});
			$('.item-control').click(function(){
				if( $(this).hasClass('item-music-pause') ){
					$(this).removeClass('item-music-pause').addClass('item-music-play');
					$('audio')[0].pause();
				}else{
					$(this).removeClass('item-music-play').addClass('item-music-pause');
					$('audio')[0].play();
				}
			});

			$('.binduser').click(function(){  //显示绑定狂
				$('.index-alert').show();
			});

			$('.bok').click(function(){ //用户绑定
				var val = $(this).prev().val();
				if( val != '' && val.length < 20){
					$.ajax({
						type:'post',
						url:'/bind',
						data:{bind:val},
						success:function(data){
							if(data.success){
								$('.index-alert').hide();
								setTimeout(function(){
									window.location.reload();
								}, 200);
							}else{
								$('.bok').val('账户错误')
								setTimeout(function(){
									$('.bok').val('绑定')
								}, 1000);
							}
						}
					})
				}
				return false;
			})

			// ****************index*********************
			$('.schbox').keydown(function(event){ //回车搜索
				if( event.which == '13' ){
					maple.type != 'gm' ? maple.search( $(this).val()) : maple.searchGM($(this).val());
				}
			});
			$('.schbox').keyup(function(){//显示搜索
				if($(this).val() == ''){
					if(maple.type != 'gm'){
						$('.search-content').show();
						$('.search-result').hide();
					}else{
						$('.search-content li').each(function(){
							$(this).show();
						})
					}
				}
			});

			$('.sch').click(function(){ //搜索
				var val = $(this).prev().val();
				maple.type != 'gm' ? maple.search(val) : maple.searchGM(val);
			});

			/*player item*/
			var plist = $('.plist'); //玩家列表
			$('.findPlayer').click(function(){
				plist.is(':hidden') ? plist.slideDown(55) : plist.slideUp(55);
				return false;
			});
			$('.plist ul li').click(function(){
				if($(this).text() != '空'){
					$('.findPlayer').empty().append('<span>'+$(this).text()+'</span>');
				 	maple.searchItem($(this).text());
				 	navItem.removeClass('on');
				 	navItem.find(':first-child').addClass('on');
					$('.item-content-nav').show();
				}
			})
			var navItem = $('.item-content-nav li');
			$('.item-content-nav li').click(function(){
				var index = $(this).index();
				navItem.removeClass('on') && $(this).addClass('on');
				maple.showItem(index);
			})
		},
		verification:function(inputAll){
			var state = inputAll.every(function(item){
					return $(item).val() !== '' && $(item).val().length < 20
				});
				if(state){
					$('form')[0].submit();
				}
		},
		search:function(val){
			var str = '';
			$.ajax({
				type:'post',
				url:'/searchItem',
				data:{schb:val,type:maple.type},
				success:function(data){
					$('.search-content').hide();
					$('.search-result').show();
					$('.search-result ul').empty();
					if(data.itemdata.length > 0){
						if(maple.type =='item'){
							data.itemdata.forEach(function(item){
								str+='<li>'+item.W_itemid+' '+item.W_itemname+'</li>'
							})
						}
						if(maple.type =='map'){
							data.itemdata.forEach(function(item){
								str+='<li>'+item.W_mapid+' '+item.W_mapname+'</li>'
							})
						}
						if(maple.type =='npc'){
							data.itemdata.forEach(function(item){
								str+='<li>'+item.W_npcid+' '+item.W_npcname+'</li>'
							})
						}
						if(maple.type =='mob'){
							data.itemdata.forEach(function(item){
								str+='<li>'+item.W_mobid+' '+item.W_mobname+'</li>'
							})
						}
						$('.search-result ul').append(str);
					}else{
						$('.search-result ul').append('<li style="color:#F59A37">搜索结果为空</li>')
					}
				}
			})
		},
		searchGM:function(val){
			$('.search-content li').each(function(){
				if( $(this).text().indexOf(val) == -1 ){
					$(this).hide();
				}
			})
		},
		searchItem:function(name){
			maple.equa='';
			maple.use= '';
			maple.opt= '';
			maple.items='';
			maple.spec= '';
			$.ajax({
				url: '/Item',
				type: 'post',
				data: {name:name},
				success:function(data){
					data.data.forEach(function(item,index){
						item.itemid = '0'+item.itemid;
						switch(item.inventorytype){
							case 1 : maple.equa+= '<li style="background-image:url(/images/item/'+item.itemid.slice(0,4)+'/'+item.itemid+'.info.iconRaw.png)"></li>\r\n'; break;
							case 2 : maple.use+= '<li style="background-image:url(/images/item/'+item.itemid.slice(0,4)+'/'+item.itemid+'.info.iconRaw.png)"><span>'+item.quantity+'</span></li>\r\n'; break;
							case 3 : maple.opt+= '<li style="background-image:url(/images/item/'+item.itemid.slice(0,4)+'/'+item.itemid+'.info.iconRaw.png)"><span>'+item.quantity+'</span></li>\r\n'; break;
							case 4 :maple.items+= '<li style="background-image:url(/images/item/'+item.itemid.slice(0,4)+'/'+item.itemid+'.info.iconRaw.png)"><span>'+item.quantity+'</span></li>\r\n';break;
							case 5 :
								if(item.itemid.slice(0,4) == '0500'){
									maple.spec+= '<li style="background-image:url(/images/item/'+item.itemid.slice(0,4)+'/'+item.itemid.slice(1,8)+'/info.iconRaw.png)"><span>'+item.quantity+'</span></li>\r\n';
								}else{
									maple.spec+= '<li style="background-image:url(/images/item/'+item.itemid.slice(0,4)+'/'+item.itemid+'.info.iconRaw.png)"><span>'+item.quantity+'</span></li>\r\n';
								}
						}
					});
					maple.showItem(0);
				}
			})
		},
		showItem:function(index){
			if(index != maple.index){
				switch(index){
					case 0 : $('.item-content-list ul').empty().append(maple.equa);break;
					case 1 : $('.item-content-list ul').empty().append(maple.use);break;
					case 2 : $('.item-content-list ul').empty().append(maple.opt);break;
					case 3 : $('.item-content-list ul').empty().append(maple.items);break;
					case 4 : $('.item-content-list ul').empty().append(maple.spec);break;
				}
				maple.index = index;
			}
		}
	}
	maple.start();
})
window.onload = function(){
	$('.onload').hide();
}