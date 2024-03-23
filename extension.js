/*-------------------------------------------------------

                    -----《理工杀》-----
当前版本：2.0
武将包：
	316杀：蒲谦，刘通，陈耀仕
	316杀-SP：SP汉坤成，SP朱辛坤，SP陈曦，SP任冠宇，SP王文煊，SP刘通，汉坤成＆朱辛坤
	理工杀：冯梓超，王宸昊，葛东建，纪汉涛，刘奕初，王润石＆曾镝文，王昭雯，张峻豪，张天宇，王郁嘉，綦俊凯，王思淇，于斌，王逸轩

-------------------------------------------------------*/


game.import("extension",function(lib,game,ui,get,ai,_status){
return {
    name:"理工杀",
    connect:true,
    content:function(config,pack){
		game.logResult=function(result,space){
			space=space||'';
			if(Array.isArray(result)){
				game.log(space+'_array');
				for(var item of result)
					game.logResult(item,space);
			}else if(get.is.object(result)){
				for(var key in result){
					game.log(space,key);
					game.logResult(result[key],space+'--');
				}
			}else
				game.log(space,result);
		};
		game.countSuit=function(player,position){
			var suits=[]
			for(var card of player.getCards(position))
				if(!suits.contains(card.suit))
					suits.push(card.suit);
			return suits.length;
		};
		game.getSuit=function(player,position){
			var suits=[]
			for(var card of player.getCards(position))
				if(!suits.contains(card.suit))
					suits.push(card.suit);
			return suits;
		};
		get.swapSeatEffect=function(target,player,viewer){
			viewer=viewer||player;
			var num=0,current=player.next;
			while(true){
				num-=get.sgn(get.attitude(viewer,current));
				if(current==target) break;
				current=current.next;
			}
			while(true){
				if(current==player) break;
				num+=get.sgn(get.attitude(viewer,current))*1.1;
				current=current.next;
			}
			return num;
		};
		get.copyBySkill=function(card,skill){
			var cardx=get.copy(card)
			cardx[skill+'_copy']=true;
			return cardx;
		};
		
		// 旧版使用，王文煊风骚
		if(game.getAllGlobalHistory==undefined){
			game.getAllGlobalHistory=function(key,filter){
				var list=[];
				var all=_status.globalHistory;
				for(var j=0;j<all.length;j++){
					if(!key||!all[j][key]){
						list.push(all[j]);
					}
					else{
						if(!filter) list.addArray(all[j][key]);
						else{
							var history=all[j][key].slice(0);
							for(var i=0;i<history.length;i++){
								if(filter(history[i])) list.push(history[i]);
							}
						}
					}
				}
				return list;
			};
		}
		_status.globalHistory=[{
			cardMove:[],
			custom:[],
			useCard:[],
			changeHp:[],
		}],
		lib.element.content.useCard=function(){
			"step 0"
			if(!card){
				console.log('err: no card',get.translation(event.player));
				event.finish();
				return;
			}
			if(!get.info(card,false).noForceDie) event.forceDie=true;
			if(cards.length){
				var owner=(get.owner(cards[0])||player);
				var next=owner.lose(cards,'visible',ui.ordering).set('type','use');
				var directDiscard=[];
				for(var i=0;i<cards.length;i++){
					if(!next.cards.contains(cards[i])){
						directDiscard.push(cards[i]);
					}
				}
				if(directDiscard.length) game.cardsGotoOrdering(directDiscard);
			}
			//player.using=cards;
			var cardaudio=true;
			if(event.skill){
				if(lib.skill[event.skill].audio){
					cardaudio=false;
				}
				if(lib.skill[event.skill].log!=false){
					player.logSkill(event.skill);
				}
				if(get.info(event.skill).popname){
					player.tryCardAnimate(card,event.card.name,'metal',true);
				}
			}
			else if(!event.nopopup){
				if(lib.translate[event.card.name+'_pop']){
					player.tryCardAnimate(card,lib.translate[event.card.name+'_pop'],'metal');
				}
				else{
					player.tryCardAnimate(card,event.card.name,'metal');
				}
			}	
			if(event.audio===false){
				cardaudio=false;
			}
			if(cardaudio){
				game.broadcastAll(function(player,card){
					if(lib.config.background_audio){
						if(get.type(card)=='equip'&&!lib.config.equip_audio) return;
						var sex=player.sex=='female'?'female':'male';
						var audioinfo=lib.card[card.name].audio;
						// if(audioinfo||true){
							if(card.name=='sha'&&(card.nature=='fire'||card.nature=='thunder'||card.nature=='ice'||card.nature=='stab')){
								game.playAudio('card',sex,card.name+'_'+card.nature);
							}
							else{
								if(typeof audioinfo=='string'){
									if(audioinfo.indexOf('ext:')==0) game.playAudio('..','extension',audioinfo.slice(4),card.name+'_'+sex);
									else game.playAudio('card',sex,audioinfo);
								}
								else{
									game.playAudio('card',sex,card.name);
								}
							}
						// }
						// else if(get.type(card)!='equip'){
						// 	game.playAudio('card/default');
						// }
					}
				},player,card);
			}
			if(event.animate!=false&&event.line!=false){
				if((card.name=='wuxie'||card.name=='youdishenru')&&event.getParent().source){
					var lining=event.getParent().sourcex||event.getParent().source2||event.getParent().source;
					if(lining==player&&event.getParent().sourcex2){
						lining=event.getParent().sourcex2;
					}
					if(Array.isArray(lining)&&event.getTrigger().name=='jiedao'){
						player.line(lining[0],'green');
					}
					else{
						player.line(lining,'green');
					}
				}
				else{
					var config={};
					if(card.nature=='fire'||
						(card.classList&&card.classList.contains('fire'))){
						config.color='fire';
					}
					else if(card.nature=='thunder'||
						(card.classList&&card.classList.contains('thunder'))){
						config.color='thunder';
					}
					if(event.addedTarget){
						player.line2(targets.concat(event.addedTargets),config);
					}
					else if(get.info(card,false).multitarget&&targets.length>1&&!get.info(card,false).multiline){
						player.line2(targets,config);
					}
					else{
						player.line(targets,config);
					}
				}
				if(event.throw!==false) player.$throw(cards);
				if(lib.config.sync_speed&&cards[0]&&cards[0].clone){
					var waitingForTransition=get.time();
					event.waitingForTransition=waitingForTransition;
					cards[0].clone.listenTransition(function(){
						if(_status.waitingForTransition==waitingForTransition&&_status.paused){
							game.resume();
						}
						delete event.waitingForTransition;
					});
				}
			}
			event.id=get.id();
			event.excluded=[];
			event.directHit=[];
			event.customArgs={default:{}};
			if(typeof event.baseDamage!='number') event.baseDamage=get.info(card,false).baseDamage||1;
			if(event.oncard){
				event.oncard(event.card,event.player);
			}
			player.actionHistory[player.actionHistory.length-1].useCard.push(event);
			game.getGlobalHistory().useCard.push(event);
			if(event.addCount!==false){
				if(player.stat[player.stat.length-1].card[card.name]==undefined){
					player.stat[player.stat.length-1].card[card.name]=1;
				}
				else{
					player.stat[player.stat.length-1].card[card.name]++;
				}
			}
			if(event.skill){
				if(player.stat[player.stat.length-1].skill[event.skill]==undefined){
					player.stat[player.stat.length-1].skill[event.skill]=1;
				}
				else{
					player.stat[player.stat.length-1].skill[event.skill]++;
				}
				var sourceSkill=get.info(event.skill).sourceSkill;
				if(sourceSkill){
					if(player.stat[player.stat.length-1].skill[sourceSkill]==undefined){
						player.stat[player.stat.length-1].skill[sourceSkill]=1;
					}
					else{
						player.stat[player.stat.length-1].skill[sourceSkill]++;
					}
				}
			}
			if(targets.length){
				var str=(targets.length==1&&targets[0]==player)?'#b自己':targets;
				if(cards.length&&!card.isCard){
					if(event.addedTarget){
						game.log(player,'对',str,'使用了',card,'（',cards,'，指向',event.addedTargets,'）');
					}
					else{
						game.log(player,'对',str,'使用了',card,'（',cards,'）');
					}
				}
				else{
					if(event.addedTarget){
						game.log(player,'对',str,'使用了',card,'（指向',event.addedTargets,'）');
					}
					else{
						game.log(player,'对',str,'使用了',card);
					}
				}
			}
			else{
				if(cards.length&&!card.isCard){
					if(event.addedTarget){
						game.log(player,'使用了',card,'（',cards,'，指向',event.addedTargets,'）');
					}
					else{
						game.log(player,'使用了',card,'（',cards,'）');
					}
				}
				else{
					if(event.addedTarget){
						game.log(player,'使用了',card,'（指向',event.addedTargets,'）');
					}
					else{
						game.log(player,'使用了',card);
					}
				}
			}
			if(card.name=='wuxie'){							game.logv(player,[card,cards],[event.getTrigger().card]);
				}
			else{
				game.logv(player,[card,cards],targets);
			}
			event.trigger('useCard1');
			"step 1"
			event.trigger('useCard2');
			"step 2"
			event.trigger('useCard');
			event._oncancel=function(){
				game.broadcastAll(function(id){
					if(ui.tempnowuxie&&ui.tempnowuxie._origin==id){
						ui.tempnowuxie.close();
						delete ui.tempnowuxie;
					}
				},event.id);
			};
			"step 3"
			event.sortTarget=function(animate,sort){
				var info=get.info(card,false);
				if(num==0&&targets.length>1){
					if(!info.multitarget){
						if(!event.fixedSeat&&!sort){
							targets.sortBySeat((_status.currentPhase||player));
						}
						if(animate)	for(var i=0;i<targets.length;i++){
							targets[i].animate('target');
						}
					}
					else if(animate){
						for(var i=0;i<targets.length;i++){
							targets[i].animate('target');
						}
					}
				}
			}
			event.sortTarget();
			event.getTriggerTarget=function(list1,list2){
				var listx=list1.slice(0).sortBySeat((_status.currentPhase||player));
				for(var i=0;i<listx.length;i++){
					if(get.numOf(list2,listx[i])<get.numOf(listx,listx[i])) return listx[i];
				}
				return null;
			}
			"step 4"
			if(event.all_excluded) return;
			if(!event.triggeredTargets1) event.triggeredTargets1=[];
			var target=event.getTriggerTarget(targets,event.triggeredTargets1);
			if(target){
				event.triggeredTargets1.push(target);
				var next=game.createEvent('useCardToPlayer',false);
				if(event.triggeredTargets1.length==1) next.isFirstTarget=true;
				next.setContent('emptyEvent');
				next.targets=targets;
				next.target=target;
				next.card=card;
				next.cards=cards;
				next.player=player;
				next.excluded=event.excluded;
				next.directHit=event.directHit;
				next.customArgs=event.customArgs;
				if(event.forceDie) next.forceDie=true;
				event.redo();
			}
			"step 5"
			if(event.all_excluded) return;
			if(!event.triggeredTargets2) event.triggeredTargets2=[];
			var target=event.getTriggerTarget(targets,event.triggeredTargets2);
			if(target){
				event.triggeredTargets2.push(target);
				var next=game.createEvent('useCardToTarget',false);
				if(event.triggeredTargets2.length==1) next.isFirstTarget=true;
				next.setContent('emptyEvent');
				next.targets=targets;
				next.target=target;
				next.card=card;
				next.cards=cards;
				next.player=player;
				next.excluded=event.excluded;
				next.directHit=event.directHit;
				next.customArgs=event.customArgs;
				if(event.forceDie) next.forceDie=true;
				event.redo();
			}
			"step 6"
			var info=get.info(card,false);
			if(!info.nodelay&&event.animate!=false){
				if(event.delayx!==false){
					if(event.waitingForTransition){
						_status.waitingForTransition=event.waitingForTransition;
						game.pause();
					}
					else{
						game.delayx();
					}
				}
			}
			"step 7"
			if(event.all_excluded) return;
			if(!event.triggeredTargets3) event.triggeredTargets3=[];
			var target=event.getTriggerTarget(targets,event.triggeredTargets3);
			if(target){
				event.triggeredTargets3.push(target);
				var next=game.createEvent('useCardToPlayered',false);
				if(event.triggeredTargets3.length==1) next.isFirstTarget=true;
				next.setContent('emptyEvent');
				next.targets=targets;
				next.target=target;
				next.card=card;
				next.cards=cards;
				next.player=player;
				next.excluded=event.excluded;
				next.directHit=event.directHit;
				next.customArgs=event.customArgs;
				if(event.forceDie) next.forceDie=true;
				event.redo();
			}
			"step 8"
			if(event.all_excluded) return;
			if(!event.triggeredTargets4) event.triggeredTargets4=[];
			var target=event.getTriggerTarget(targets,event.triggeredTargets4);
			if(target){
				event.triggeredTargets4.push(target);
				var next=game.createEvent('useCardToTargeted',false);
				if(event.triggeredTargets4.length==1) next.isFirstTarget=true;
				next.setContent('emptyEvent');
				next.targets=targets;
				next.target=target;
				next.card=card;
				next.cards=cards;
				next.player=player;
				next.excluded=event.excluded;
				next.directHit=event.directHit;
				next.customArgs=event.customArgs;
				if(event.forceDie) next.forceDie=true;
				if(targets.length==event.triggeredTargets4.length){
					event.sortTarget();
				}
				event.redo();
			}
			"step 9"
			var info=get.info(card,false);
			if(info.contentBefore){
				var next=game.createEvent(card.name+'ContentBefore');
				next.setContent(info.contentBefore);
				next.targets=targets;
				next.card=card;
				next.cards=cards;
				next.player=player;
				next.type='precard';
				if(event.forceDie) next.forceDie=true;
			}
			else if(info.reverseOrder&&get.is.versus()&&targets.length>1){
				var next=game.createEvent(card.name+'ContentBefore');
				next.setContent('reverseOrder');
				next.targets=targets;
				next.card=card;
				next.cards=cards;
				next.player=player;
				next.type='precard';
				if(event.forceDie) next.forceDie=true;
			}
			else if(info.singleCard&&info.filterAddedTarget&&event.addedTargets&&event.addedTargets.length<targets.length){
				var next=game.createEvent(card.name+'ContentBefore');
				next.setContent('addExtraTarget');
				next.target=target;
				next.targets=targets;
				next.card=card;
				next.cards=cards;
				next.player=player;
				next.type='precard';
				next.addedTarget=event.addedTarget;
				next.addedTargets=event.addedTargets;
				if(event.forceDie) next.forceDie=true;
			}
			"step 10"
			if(event.all_excluded) return;
			var info=get.info(card,false);
			if(num==0&&targets.length>1){
				event.sortTarget(true,true);
			}
			if(targets[num]&&targets[num].isDead()) return;
			if(targets[num]&&targets[num].isOut()) return;
			if(targets[num]&&targets[num].removed) return;
			if(targets[num]&&info.ignoreTarget&&info.ignoreTarget(card,player,targets[num])) return;
			if(targets.length==0&&!info.notarget) return;
			if(targets[num]&&event.excluded.contains(targets[num])){
			var next=game.createEvent('useCardToExcluded',false);
				next.setContent('emptyEvent');
				next.targets=targets;
				next.target=targets[num];
				next.num=num;
				next.card=card;
				next.cards=cards;
				next.player=player;
				return;
			};
			var next=game.createEvent(card.name);
			next.setContent(info.content);
			next.targets=targets;
			next.card=card;
			next.cards=cards;
			next.player=player;
			next.num=num;
			next.type='card';
			next.skill=event.skill;
			next.multitarget=info.multitarget;
			next.preResult=event.preResult;
			next.baseDamage=event.baseDamage;
			if(event.forceDie) next.forceDie=true;
			if(event.addedTargets){
				next.addedTargets=event.addedTargets;
				next.addedTarget=event.addedTargets[num];
				next._targets=event._targets;
			}
			if(info.targetDelay===false){
				event.targetDelay=false;
			}
			next.target=targets[num];
			for(var i in event.customArgs.default) next[i]=event.customArgs.default[i];
			if(next.target&&event.customArgs[next.target.playerid]){
				var customArgs=event.customArgs[next.target.playerid];
				for(var i in customArgs) next[i]=customArgs[i];
			}
			if(next.target&&event.directHit.contains(next.target)) next.directHit=true;
			if(next.target&&!info.multitarget){
				if(num==0&&targets.length>1){
					// var ttt=next.target;
					// setTimeout(function(){ttt.animate('target');},0.5*lib.config.duration);
				}
				else{
					next.target.animate('target');
				}
			}
			if(!info.nodelay&&num>0){
				if(event.targetDelay!==false){
					game.delayx(0.5);
				}
			}
			"step 11"
			if(event.all_excluded) return;
			if(!get.info(event.card,false).multitarget&&num<targets.length-1&&!event.cancelled){
				event.num++;
				event.goto(10);
			}
			"step 12"
			if(get.info(card,false).contentAfter){
				var next=game.createEvent(card.name+'ContentAfter');
				next.setContent(get.info(card,false).contentAfter);
				next.targets=targets;
				next.card=card;
				next.cards=cards;
				next.player=player;
				next.preResult=event.preResult;
				next.type='postcard';
				if(event.forceDie) next.forceDie=true;
			}
			"step 13"
			if(event.postAi){
				event.player.logAi(event.targets,event.card);
			}
			if(event._result){
				event.result=event._result;
			}
			//delete player.using;
			if(document.getElementsByClassName('thrown').length){
				if(event.delayx!==false) game.delayx();
			}
			else{
				event.finish();
			}
			"step 14"
			event._oncancel();
		};
		lib.element.content.phasing=function(){
			'step 0'
			while(ui.dialogs.length){
				ui.dialogs[0].close();
			}
			if(!player.noPhaseDelay&&lib.config.show_phase_prompt){
				player.popup('回合开始');
			}
			if(lib.config.glow_phase){
				if(_status.currentPhase){
					_status.currentPhase.classList.remove('glow_phase');
					game.broadcast(function(player){
						player.classList.remove('glow_phase');
					},_status.currentPhase);
				}
				player.classList.add('glow_phase');
				game.broadcast(function(player){
					player.classList.add('glow_phase');
				},player);
			}
			_status.currentPhase=player;
			_status.discarded=[];
			game.phaseNumber++;
			player.phaseNumber++;
			game.syncState();
			game.addVideo('phaseChange',player);
			if(game.phaseNumber==1){
				delete player._start_cards;
				if(lib.configOL.observe){
					lib.configOL.observeReady=true;
					game.send('server','config',lib.configOL);
				}
			}
			game.log();
			game.log(player,'的回合开始');
			player._noVibrate=true;
			if(get.config('identity_mode')!='zhong'&&get.config('identity_mode')!='purple'&&!_status.connectMode){
				var num;
				switch(get.config('auto_identity')){
					case 'one':num=1;break;
					case 'two':num=2;break;
					case 'three':num=3;break;
					case 'always':num=-1;break;
					default:num=0;break;
				}
				if(num&&!_status.identityShown&&game.phaseNumber>game.players.length*num&&game.showIdentity){
					if(!_status.video) player.popup('显示身份');
					_status.identityShown=true;
					game.showIdentity(false);
				}
			}
			player.ai.tempIgnore=[];
			_status.globalHistory.push({
				cardMove:[],
				custom:[],
				useCard:[],
				changeHp:[],
			});
			game.countPlayer2(function(current){
				current.actionHistory.push({useCard:[],respond:[],skipped:[],lose:[],gain:[],sourceDamage:[],damage:[],custom:[],useSkill:[]});
				current.stat.push({card:{},skill:{}});
				if(event.parent._roundStart){
					current.getHistory().isRound=true;
					current.getStat().isRound=true;
				}
			});
			player.getHistory().isMe=true;
			player.getStat().isMe=true;
			if(event.parent._roundStart){
				game.getGlobalHistory().isRound=true;
			}
			if(ui.land&&ui.land.player==player){
				game.addVideo('destroyLand');
				ui.land.destroy();
			}
			'step 1'
			event.trigger('phaseBeginStart');
		};
		
		// for(var key in lib.imported.character.理工杀.characterReplace)
		//	   lib.characterReplace[key]=lib.imported.character.理工杀.characterReplace[key];
		
		lib.config.all.characters.add('ligongsha');
		// lib.config.all.cards.add('ligongsha');
		
		lib.rank.rarity.junk.addArray(['lgs_zhangliao','lgs_zhangliaox']);
		lib.rank.rarity.rare.addArray([
			"sp_wangwenxuan","sp_chenxi","lgs_qijunkai","sp_chenyaoshi","lgs_zhangjiahui",
			"lgs_yubin","lgs_zhangtianyu","lgs_pengyuhong","lgs_weixinran","lgs_qiyue","lgs_wanghuan",
		]);
		lib.rank.rarity.epic.addArray([
			"sp_zhuxinkun","sp_puqian","lgs_chenxi","lgs_puqian","lgs_wangwenxuan","lgs_chenyaoshi","lgs_zhuxinkun",
			"lgs_wangsiqi","lgs_liuyichu","lgs_wangzhaowen","lgs_wangyujia","sp_hankunchengzhuxinkun","lgs_sunqingyue",
			"lgs_wangyixuan","lgs_guozichen","lgs_huxiaoyu","lgs_liujingyi","lgs_sunjiazhi","lgs_zhangjunhao",
			"lgs_yeyueda","lgs_lixiaoting","lgs_chenglinuo","lgs_wangjiaqi","lgs_guojingjun","lgs_gedongjian",
			"lgs_liyifei","lgs_lizhaofu","lgs_wangqi","lgs_muqing",
		]);
		lib.rank.rarity.legend.addArray([
			"sp_hankuncheng","sp_renguanyu","sp_liutong","lgs_liutong","lgs_hankuncheng","lgs_fengzichao","lgs_jihantao",
			"lgs_wangchenhao","lgs_zhouruiqi","lgs_wangrunshizengdiwen","lgs_yuxiaoran","lgs_luyeyang",
			"lgs_qujiaqi","lgs_wanglinjing","lgs_wanghongshuo","lgs_wangyuan",
		]);
		
		if (!game.getExtensionConfig('理工杀', 'TheFirstTimes')) {
			lib.config.characters.unshift('ligongsha');
			game.saveConfigValue('characters');
			// lib.config.cards.add('ligongsha');
            // game.saveConfigValue('cards');
			game.saveExtensionConfig('理工杀', 'TheFirstTimes', true);
		}
	},
	precontent:function (ligongsha){

game.import('character',function(lib,game,ui,get,ai,_status){
	return {
		name:'ligongsha',
		connect:true,
		character:{
			"sp_hankuncheng":["male","qun",4,["lgs_gangrou","lgs_yanhuan"],['ext:理工杀/sp_hankuncheng.jpg','db:extension-理工杀:sp_hankuncheng.jpg']],
			"sp_zhuxinkun":["male","qun",3,["lgs_gangqu","lgs_liepo","lgs_xiushen"],["zhu",'ext:理工杀/sp_zhuxinkun.jpg','db:extension-理工杀:sp_zhuxinkun.jpg']],
			"sp_chenxi":["male","qun",4,["lgs_boshi","lgs_youtu"],['ext:理工杀/sp_chenxi.jpg','db:extension-理工杀:sp_chenxi.jpg']],
			"sp_renguanyu":["male","qun","4/8",["lgs_xinyou","lgs_qingshen"],['ext:理工杀/sp_renguanyu.jpg','db:extension-理工杀:sp_renguanyu.jpg']],
			"sp_wangwenxuan":["male","qun",4,["lgs_polu","lgs_juesha"],['ext:理工杀/sp_wangwenxuan.jpg','db:extension-理工杀:sp_wangwenxuan.jpg']],
			"sp_liutong":["male","qun",4,["lgs_tiewan"],['ext:理工杀/sp_liutong.jpg','db:extension-理工杀:sp_liutong.jpg']],
			"sp_hankunchengzhuxinkun":["male","qun",4,["lgs_zaoxing","lgs_qianye"],['ext:理工杀/sp_hankunchengzhuxinkun.jpg','db:extension-理工杀:sp_hankunchengzhuxinkun.jpg']],
			"sp_chenyaoshi":["male","qun",3,["lgs_xingchi","lgs_bushi"],['ext:理工杀/sp_chenyaoshi.jpg','db:extension-理工杀:sp_chenyaoshi.jpg']],
			"sp_puqian":["male","qun",4,["lgs_huishi","lgs_jiechong"],['ext:理工杀/sp_puqian.jpg','db:extension-理工杀:sp_puqian.jpg']],
			"lgs_puqian":["male","shen",4,["lgs_qishi","lgs_yange"],['ext:理工杀/lgs_puqian.jpg','db:extension-理工杀:lgs_puqian.jpg']],
			"lgs_liutong":["male","shen","4/5",["lgs_yian","lgs_xiaoyi"],['ext:理工杀/lgs_liutong.jpg','db:extension-理工杀:lgs_liutong.jpg']],
			"lgs_chenyaoshi":["male","shen",4,["lgs_beishan","lgs_shenghua","lgs_manfu"],['ext:理工杀/lgs_chenyaoshi.jpg','db:extension-理工杀:lgs_chenyaoshi.jpg']],
			"lgs_hankuncheng":["male","shen",4,["lgs_shiyuan","lgs_qianyin"],['ext:理工杀/lgs_hankuncheng.jpg','db:extension-理工杀:lgs_hankuncheng.jpg','forbidai']],
			"lgs_chenxi":["male","shen",4,["lgs_jifei","lgs_minghao"],['ext:理工杀/lgs_chenxi.jpg','db:extension-理工杀:lgs_chenxi.jpg']],
			"lgs_wangwenxuan":["male","shen",3,["lgs_fengsao","lgs_weizun"],['ext:理工杀/lgs_wangwenxuan.jpg','db:extension-理工杀:lgs_wangwenxuan.jpg']],
			"lgs_zhuxinkun":["male","shen",3,["lgs_jieshen","lgs_fenqu"],['ext:理工杀/lgs_zhuxinkun.jpg','db:extension-理工杀:lgs_zhuxinkun.jpg']],
			"lgs_renguanyu":["male","shen",4,["lgs_zongyu","lgs_nixi"],['ext:理工杀/lgs_renguanyu.jpg','db:extension-理工杀:lgs_renguanyu.jpg']],
			
			"lgs_fengzichao":["male","shen",3,["lgs_jinyi","lgs_qiujin"],['ext:理工杀/lgs_fengzichao.jpg','db:extension-理工杀:lgs_fengzichao.jpg']],
			"lgs_wangchenhao":["male","shen",3,["lgs_daimeng","lgs_shensuan"],['ext:理工杀/lgs_wangchenhao.jpg','db:extension-理工杀:lgs_wangchenhao.jpg']],
			"lgs_gedongjian":["male","shen",3,["lgs_fengyu","lgs_jianxing"],['ext:理工杀/lgs_gedongjian.jpg','db:extension-理工杀:lgs_gedongjian.jpg']],
			"lgs_jihantao":["male","shen",4,["lgs_yonglan","lgs_yinzhi"],['ext:理工杀/lgs_jihantao.jpg','db:extension-理工杀:lgs_jihantao.jpg']],
			"lgs_liuyichu":["female","shen",3,["lgs_guanglan","lgs_hairong"],['ext:理工杀/lgs_liuyichu.jpg','db:extension-理工杀:lgs_liuyichu.jpg']],
			"lgs_wangrunshizengdiwen":["male","shen",3,["lgs_kubi"],['ext:理工杀/lgs_wangrunshizengdiwen.jpg','db:extension-理工杀:lgs_wangrunshizengdiwen.jpg']],
			"lgs_wangzhaowen":["female","shen",3,["lgs_tianle","lgs_jieyou"],['ext:理工杀/lgs_wangzhaowen.jpg','db:extension-理工杀:lgs_wangzhaowen.jpg']],
			"lgs_zhangjunhao":["male","shen",4,["lgs_zhiyong","lgs_linyi"],['ext:理工杀/lgs_zhangjunhao.jpg','db:extension-理工杀:lgs_zhangjunhao.jpg']],
			"lgs_zhangtianyu":["male","shen",4,["lgs_miaokou"],['ext:理工杀/lgs_zhangtianyu.jpg','db:extension-理工杀:lgs_zhangtianyu.jpg']],
			"lgs_wangyujia":["male","shen",3,["lgs_qiezhu","lgs_woxun"],['ext:理工杀/lgs_wangyujia.jpg','db:extension-理工杀:lgs_wangyujia.jpg']],
			"lgs_qijunkai":["male","shen",4,["lgs_jisun","lgs_hongqi"],['ext:理工杀/lgs_qijunkai.jpg','db:extension-理工杀:lgs_qijunkai.jpg']],
			"lgs_wangsiqi":["female","shen",3,["lgs_hanxiao","lgs_chenghuan"],['ext:理工杀/lgs_wangsiqi.jpg','db:extension-理工杀:lgs_wangsiqi.jpg']],
			"lgs_yubin":["male","shen",3,["lgs_ganggan","lgs_xiyan"],['ext:理工杀/lgs_yubin.jpg','db:extension-理工杀:lgs_yubin.jpg']],
			"lgs_wangyixuan":["male","shen",4,["lgs_feiqiu","lgs_yeyin"],['ext:理工杀/lgs_wangyixuan.jpg','db:extension-理工杀:lgs_wangyixuan.jpg']],
			"lgs_guozichen":["male","shen",4,["lgs_cangmo","lgs_youli"],['ext:理工杀/lgs_guozichen.jpg','db:extension-理工杀:lgs_guozichen.jpg']],
			"lgs_huxiaoyu":["male","shen",3,["lgs_shanxuan","lgs_jieyi"],['ext:理工杀/lgs_huxiaoyu.jpg','db:extension-理工杀:lgs_huxiaoyu.jpg']],
			"lgs_wangqi":["male","shen",4,["lgs_shannian", "lgs_jingyao"],['ext:理工杀/lgs_wangqi.jpg','db:extension-理工杀:lgs_wangqi.jpg']],
			"lgs_liujingyi":["male","shen",3,["lgs_qishang"],['ext:理工杀/lgs_liujingyi.jpg','db:extension-理工杀:lgs_liujingyi.jpg']],
			"lgs_zhangjiahui":["female","shen",3,["lgs_qiaohui","lgs_qingwei"],['ext:理工杀/lgs_zhangjiahui.jpg','db:extension-理工杀:lgs_zhangjiahui.jpg']],
			"lgs_sunqingyue":["female","shen",3,["lgs_qiaqun","lgs_langfang"],['ext:理工杀/lgs_sunqingyue.jpg','db:extension-理工杀:lgs_sunqingyue.jpg']],
			"lgs_pengyuhong":["male","shen",4,["lgs_chengmian","lgs_zhiji"],['ext:理工杀/lgs_pengyuhong.jpg','db:extension-理工杀:lgs_pengyuhong.jpg']],
			"lgs_sunjiazhi":["male","shen",3,["lgs_mengxu","lgs_yiying"],['ext:理工杀/lgs_sunjiazhi.jpg','db:extension-理工杀:lgs_sunjiazhi.jpg']],
			"lgs_zhouruiqi":["male","shen",3,["lgs_shuanglun","lgs_yanta","lgs_yingcun"],['ext:理工杀/lgs_zhouruiqi.jpg','db:extension-理工杀:lgs_zhouruiqi.jpg']],
			"lgs_wanghongshuo":["male","shen",4,["lgs_fangyan","lgs_ezuo","lgs_tuqiang"],['ext:理工杀/lgs_wanghongshuo.jpg','db:extension-理工杀:lgs_wanghongshuo.jpg']],
			"lgs_yeyueda":["male","shen",4,["lgs_xingxi","lgs_bomie"],['ext:理工杀/lgs_yeyueda.jpg','db:extension-理工杀:lgs_yeyueda.jpg']],
			"lgs_lixiaoting":["female","shen",4,["lgs_zhenji","lgs_xinxing"],['ext:理工杀/lgs_lixiaoting.jpg','db:extension-理工杀:lgs_lixiaoting.jpg']],
			"lgs_zhangliao":["male","wei",4,["lgs_tuxi","lgs_huiwei"],['ext:理工杀/lgs_zhangliao.jpg','db:extension-理工杀:lgs_zhangliao.jpg']],
			"lgs_yuxiaoran":["female","shen","2/3",["lgs_jingshu","lgs_duyi"],['ext:理工杀/lgs_yuxiaoran.jpg','db:extension-理工杀:lgs_yuxiaoran.jpg','forbidai']],
			"lgs_wanglinjing":["female","shen",3,["lgs_xiaokan","lgs_caisi"],['ext:理工杀/lgs_wanglinjing.jpg','db:extension-理工杀:lgs_wanglinjing.jpg','forbidai']],
			"lgs_liyifei":["male","shen",6,["lgs_chijiang","lgs_huiyou"],['ext:理工杀/lgs_liyifei.jpg','db:extension-理工杀:lgs_liyifei.jpg']],
			"lgs_luyeyang":["male","shen",4,["lgs_yinwei","lgs_shenhuai"],['ext:理工杀/lgs_luyeyang.jpg','db:extension-理工杀:lgs_luyeyang.jpg']],
			"lgs_qujiaqi":["female","shen",3,["lgs_qjinyi","lgs_shuangzhi"],['ext:理工杀/lgs_qujiaqi.jpg','db:extension-理工杀:lgs_qujiaqi.jpg']],
			"lgs_qiyue":["female","shen",3,["lgs_kaizhu","lgs_jiangxin"],['ext:理工杀/lgs_qiyue.jpg','db:extension-理工杀:lgs_qiyue.jpg','forbidai']],
			"lgs_zhangliaox":["male","wei",4,["lgs_tuxix","lgs_huiweix"],['ext:理工杀/lgs_zhangliao.jpg','db:extension-理工杀:lgs_zhangliao.jpg','forbidai']],
			"lgs_guojingjun":["female","shen",3,["lgs_biluo","lgs_qinhe"],['ext:理工杀/lgs_guojingjun.jpg','db:extension-理工杀:lgs_guojingjun.jpg']],
			"lgs_wangjiaqi":["female","shen",3,["lgs_zhiqian","lgs_wendao"],['ext:理工杀/lgs_wangjiaqi.jpg','db:extension-理工杀:lgs_wangjiaqi.jpg','forbidai']],
			"lgs_weixinran":["female","shen",3,["lgs_liangcong","lgs_gufang"],['ext:理工杀/lgs_weixinran.jpg','db:extension-理工杀:lgs_weixinran.jpg']],
			"lgs_chenglinuo":["female","shen",3,["lgs_yasi","lgs_linuo"],['ext:理工杀/lgs_chenglinuo.jpg','db:extension-理工杀:lgs_chenglinuo.jpg']],
			"lgs_lizhaofu":["male","shen",3,["lgs_chaojie","lgs_jueyi"],['ext:理工杀/lgs_lizhaofu.jpg','db:extension-理工杀:lgs_lizhaofu.jpg']],
			"lgs_wangyuan":["female","shen",3,["lgs_qinmian","lgs_yunshi"],['ext:理工杀/lgs_wangyuan.jpg','db:extension-理工杀:lgs_wangyuan.jpg']],
			"lgs_muqing":["female","shen",3,["lgs_jiaoxin","lgs_keyan","lgs_renjian"],['ext:理工杀/lgs_muqing.jpg','db:extension-理工杀:lgs_muqing.jpg','forbidai']],
			"lgs_wanghuan":["female","shen",3,["lgs_shouye","lgs_ciai","lgs_shixin"],['zhu','ext:理工杀/lgs_wanghuan.jpg','db:extension-理工杀:lgs_wanghuan.jpg']],
			
			"sp_zengdiwen":["male","qun",4,["lgs_zhanyue","lgs_huixie"],['ext:理工杀/sp_zengdiwen.jpg','db:extension-理工杀:sp_zengdiwen.jpg']],
			"sp_wanghongshuo":["male","qun",4,["lgs_zhenghuo","lgs_huahuo","lgs_henhuo"],['ext:理工杀/sp_wanghongshuo.jpg','db:extension-理工杀:sp_wanghongshuo.jpg','forbidai']],
			"sp_wangrunshi":["male","qun",4,["lgs_zhenmi","lgs_jiehuo"],['ext:理工杀/sp_wangrunshi.jpg','db:extension-理工杀:sp_wangrunshi.jpg']],
			"sp_wangyixuan":["male","qun",4,["lgs_touliang","lgs_huanzhu"],['ext:理工杀/sp_wangyixuan.jpg','db:extension-理工杀:sp_wangyixuan.jpg','forbidai']],
		},
		characterTitle:{
			"sp_hankuncheng":"怀勇兼柔",
			"sp_zhuxinkun":"健身达人",
			"sp_chenxi":"下晓地理",
			"sp_renguanyu":"天非吾往",
			"sp_wangwenxuan":"篮球明猩",
			"sp_liutong":"麒麟臂",
			"sp_hankunchengzhuxinkun":"黑白双坤",
			"sp_chenyaoshi":"香香",
			"sp_puqian":"预言家",
			"lgs_puqian":"哈士谦",
			"lgs_liutong":"易平义士",
			"lgs_chenyaoshi":"满腹经纶",
			"lgs_chenxi":"博古通今",
			"lgs_wangwenxuan":"猩宝",
			"lgs_hankuncheng":"成略怀德",
			"lgs_zhuxinkun":"正则律己",
			"lgs_renguanyu":"软骨鱼",
			"lgs_fengzichao":"求佛问道",
			"lgs_wangchenhao":"神算子",
			"lgs_gedongjian":"二蛋",
			"lgs_jihantao":"散神洞世",
			"lgs_liuyichu":"万卷于怀",
			"lgs_wangrunshizengdiwen":"天骄双宝",
			"lgs_wangzhaowen":"国宝",
			"lgs_zhangjunhao":"勇闯天涯",
			"lgs_zhangtianyu":"妙语连珠",
			"lgs_wangyujia":"前路漫漫",
			"lgs_qijunkai":"快意千里",
			"lgs_wangsiqi":"菡萏含苞",
			"lgs_yubin":"怕剃头",
			"lgs_wangyixuan":"夜的使者",
			"lgs_guozichen":"胸藏五学",
			"lgs_huxiaoyu":"璀璨烟火",
			"lgs_wangqi":"仁者情圣",
			"lgs_liujingyi":"尚美崇真",
			"lgs_zhangjiahui":"秀外慧中",
			"lgs_sunqingyue":"初降之露",
			"lgs_pengyuhong":"考拉",
			"lgs_sunjiazhi":"午梦初回",
			"lgs_zhouruiqi":"海阔凭鱼跃",
			"lgs_wanghongshuo":"活力胖子",
			"lgs_yeyueda":"世尘笑淡",
			"lgs_zhangliao":"威震逍遥",
			"lgs_zhangliaox":"威震逍遥",
			"lgs_yuxiaoran":"静女其姝",
			"lgs_lixiaoting":"闲庭信步",
			"lgs_wanglinjing":"指笑世艰",
			"lgs_liyifei":"诚以待人",
			"lgs_luyeyang":"板砖",
			"lgs_qujiaqi":"青青子衿",
			"lgs_qiyue":"朗日清风",
			"lgs_guojingjun":"挥毫落纸",
			"lgs_wangjiaqi":"譬如朝露",
			"lgs_weixinran":"清水芙蓉",
			"lgs_chenglinuo":"清奇瑰巧",
			"lgs_lizhaofu":"扁甫",
			"lgs_wangyuan":"文质彬彬",
			"lgs_muqing":"恪业秉初",
			"lgs_wanghuan":"师者仁心",
			"sp_zengdiwen":"骐骥一跃",
			"sp_wangrunshi":"石der",
			"sp_wanghongshuo":"大师",
			"sp_wangyixuan":"黑哥",
		},
		characterIntro: {}, 
		characterSort: {
			ligongsha: {
				st316sha: ['lgs_puqian','lgs_liutong','lgs_chenyaoshi','lgs_chenxi','lgs_hankuncheng','lgs_wangwenxuan','lgs_zhuxinkun','lgs_renguanyu'],
				sp316sha: ['sp_hankuncheng','sp_zhuxinkun','sp_chenxi','sp_renguanyu','sp_wangwenxuan','sp_liutong','sp_puqian','sp_chenyaoshi','sp_hankunchengzhuxinkun'],
				stligongsha: ['lgs_fengzichao','lgs_wangchenhao','lgs_gedongjian','lgs_jihantao','lgs_liuyichu',
							'lgs_wangrunshizengdiwen','lgs_wangzhaowen','lgs_zhangjunhao','lgs_zhangtianyu',
							'lgs_wangyujia','lgs_qijunkai','lgs_wangsiqi','lgs_yubin','lgs_wangyixuan','lgs_guozichen',
							'lgs_huxiaoyu','lgs_wangqi','lgs_liujingyi','lgs_zhangjiahui','lgs_sunqingyue','lgs_pengyuhong',
							'lgs_sunjiazhi','lgs_zhouruiqi','lgs_wanghongshuo','lgs_yeyueda','lgs_lixiaoting','lgs_yuxiaoran',
							'lgs_wanglinjing','lgs_liyifei','lgs_luyeyang','lgs_qujiaqi','lgs_qiyue','lgs_guojingjun',
							'lgs_wangjiaqi','lgs_weixinran','lgs_chenglinuo','lgs_lizhaofu','lgs_wangyuan','lgs_muqing','lgs_wanghuan'],
				spligongsha: ['sp_zengdiwen','sp_wanghongshuo','sp_wangrunshi','sp_wangyixuan']
			},
		},
		characterFilter:{
			// shen_diaochan:function(mode){
				// return mode=='identity'||mode=='doudizhu'||mode=='single'||(mode=='versus'&&_status.mode!='standard'&&_status.mode!='three');
			// },
			sp_puqian:function(mode){
				return mode=='identity';
			},
		},
		characterReplace:{
			lgs_liutong:['lgs_liutong','sp_liutong'],
			sp_liutong:['sp_liutong','lgs_liutong'],
			lgs_chenyaoshi:['lgs_chenyaoshi','sp_chenyaoshi'],
			sp_chenyaoshi:['sp_chenyaoshi','lgs_chenyaoshi'],
			lgs_chenxi:['lgs_chenxi','sp_chenxi'],
			sp_chenxi:['sp_chenxi','lgs_chenxi'],
			lgs_hankuncheng:['lgs_hankuncheng','sp_hankuncheng'],
			sp_hankuncheng:['sp_hankuncheng','lgs_hankuncheng'],
			lgs_wangwenxuan:['lgs_wangwenxuan','sp_wangwenxuan'],
			sp_wangwenxuan:['sp_wangwenxuan','lgs_wangwenxuan'],
			lgs_puqian:['lgs_puqian','sp_puqian'],
			sp_puqian:['sp_puqian','lgs_puqian'],
			lgs_zhuxinkun:['lgs_zhuxinkun','sp_zhuxinkun'],
			sp_zhuxinkun:['sp_zhuxinkun','lgs_zhuxinkun'],
			lgs_renguanyu:['lgs_renguanyu','sp_renguanyu'],
			sp_renguanyu:['sp_renguanyu','lgs_renguanyu'],
			lgs_wanghongshuo:['lgs_wanghongshuo','sp_wanghongshuo'],
			sp_wanghongshuo:['sp_wanghongshuo','lgs_wanghongshuo'],
			lgs_wangyixuan:['lgs_wangyixuan','lgs_wangyixuan'],
			sp_wangyixuan:['sp_wangyixuan','lgs_wangyixuan'],
		},
		perfectPair:{
			sp_hankuncheng:['sp_zhuxinkun','sp_chenxi','sp_renguanyu','sp_wangwenxuan','sp_liutong','sp_chenyaoshi'],
			sp_zhuxinkun:['sp_hankuncheng','sp_chenxi','sp_renguanyu','sp_wangwenxuan','sp_liutong','sp_chenyaoshi'],
			sp_chenxi:['sp_hankuncheng','sp_zhuxinkun','sp_renguanyu','sp_wangwenxuan','sp_liutong','sp_chenyaoshi'],
			sp_renguanyu:['sp_hankuncheng','sp_zhuxinkun','sp_chenxi','sp_wangwenxuan','sp_liutong','sp_chenyaoshi'],
			sp_wangwenxuan:['sp_hankuncheng','sp_zhuxinkun','sp_chenxi','sp_renguanyu','sp_liutong','sp_chenyaoshi'],
			sp_liutong:['sp_hankuncheng','sp_zhuxinkun','sp_chenxi','sp_renguanyu','sp_wangwenxuan','sp_chenyaoshi'],
			sp_chenyaoshi:['sp_hankuncheng','sp_zhuxinkun','sp_chenxi','sp_renguanyu','sp_wangwenxuan','sp_liutong'],
		},
		skill:{  
			"lgs_gangrou":{
				mark:true,
				locked:false,
				zhuanhuanji:true,
				marktext:"☯",
				intro:{
					content:function(storage,player,skill){
						if(player.storage.lgs_gangrou==true) return '出牌阶段，你可以弃置一张黑色牌，重置本回合【杀】的使用次数';
						return '你可以将一张非基本牌当【杀】使用或打出，然后重铸一张基本牌';
					},
				},
				init:function(player){
					player.addSkill("lgs_gangrou_gang");
				},
				// mod:{
					// aiOrder:function(player,card,num){
						// if(get.itemtype(card)=='card'&&player==_status.currentPhase){
							// if(card.name=='jiu') return num+get.order('lgs_gangrou_gang')-get.order('sha');
							// if(card.name=='sha') return num+4;
							// if(card.name=='shunshou') return num+1;
						// }
					// },
				// },
				group:'lgs_gangrou_chongzhu',
				subSkill:{
					chongzhu:{
						trigger:{player:['useCardAfter','respondAfter']},
						filter:function(event,player){
							// game.log(event.content);
							if(event.skill!='lgs_gangrou_gang') return false;
							return player.countCards('h',{type:'basic'});
						},
						direct:true,
						content:function(){
							'step 0'
							player.chooseCard('h',true,'请重铸一张基本牌',function(card,player){
								return get.type(card)=='basic';
							}).set('ai',function(card){
								var bonus=0;
								if(card.color=='red') bonus+=2.5;
								if(card.suit=='diamond'){
									if(card.name=='shan') bonus+=1.5;
									else bonus-=1;
								}
								if(card.suit=='spade')bonus-=1;
								return bonus-get.value(card);
							});
							'step 1'
							if(result.bool){
								player.lose(result.cards,ui.discardPile,'visible');
								player.$throw(result.cards,1000);
								game.log(player,'将',result.cards,'置入了弃牌堆');
								player.draw();
							}                                
						},
						sub:true,
					},
					gang:{
						name:"刚柔",
						intro:{
							content:function(){
								return '你可以将一张非基本牌当杀使用或打出，然后重铸一张基本牌。';
							},
						},
						enable:["chooseToUse","chooseToRespond"],
						filter:function(event,player){
							return player.countCards('he');
						},
						check:function(card){
							var bonus = 0;
							var player=get.owner(card);
							if(player.hasSkill("lgs_yanhuan")){
								if(player==_status.currentPhase){
									if(card.suit=='diamond'&&card.name!='zhuge')bonus+=4;
									else if(!player.countCards('he',{suit:'spade'}))bonus-=1;
									var hc=player.getCards('h');
									var eq=player.getCards('e');
									if(eq.contains(card)){
										for (var ahc of hc){
											if(get.subtype(ahc)==get.subtype(card)&&ahc.suit=='diamond'&&ahc.name!='zhuge'){
												bonus+=6;
												break;
											}
										} 
									}
								}
								if(player!=_status.currentPhase){
									if(card.suit=='heart')bonus+=2;
									if(card.suit=='diamond')bonus-=1.5;
								}
								if(card.suit=='spade')bonus-=1;
							}
							return 8+bonus-get.value(card);
						},
						prompt:"将一张非基本牌当杀使用或打出",
						position:"hes",
						filterCard:function(card){
							return get.type(card)!='basic';
						},
						viewAs:{
							name:"sha",
						},
						precontent:function(player){
							player.addSkill("lgs_gangrou_rou");
							player.removeSkill("lgs_gangrou_gang");
							player.changeZhuanhuanji('lgs_gangrou');
						},
						mod:{
							aiOrder:function(player,card,num){
								if(get.itemtype(card)=='card'&&player==_status.currentPhase){
									if(card.name=='jiu') return num+get.order('lgs_gangrou')-get.order('sha');
									if(card.name=='sha') return num+4;
									if(card.name=='shunshou') return num+1;
								}
							},
						},
						ai:{
							respondSha:true,
							reverseEquip:true,
							skillTagFilter:function(player,tag,arg){
								if(tag=='reverseEquip')return player.countCards('he',function(card){
									return get.subtype(card)=='equip1'&&card.suit=='diamond';
								})>1;
							},
							order:function(item,player){
								if (player==_status.currentPhase){
									// var weapon=player.getEquip(1);
									// if(weapon&&weapon.suit=='diamond'&&weapon.name!='zhuge')return 10;
									for(var cur of player.getCards('e'))
										if(cur&&cur.suit=='diamond')
											return 11;
									if(player.countCards('he',{suit:'diamond'}))
										return 8.1;
									if(player.countCards('he')-player.countCards('h','basic')<=1)return 3.5;
									return 6.5;
								}
								return 4.5;
							},
						},
					},
					rou:{
						name:"刚柔",
						intro:{
							content:function(){
								return '出牌阶段，你可以弃置一张黑色牌，重置本回合杀的使用次数。';
							},
						},
						enable:"phaseUse",
						filter:function(event,player){
							return player.countCards('he',{color:'black'})>0;
						},
						position:"he",
						prompt:"弃置一张黑色牌，重置杀的使用次数",
						filterCard:function(card){
							return get.color(card)=='black';
						},
						check:function(card){
							var bonus=0,player=_status.event.player;
							if(card.suit=='spade')bonus+=6;
							if(get.type(card,'trick')=='basic')bonus+=2;
							else if(!player.countCards('he',{suit:'diamond'})||!player.hasValueTarget('sha'))bonus-=4;
							// game.log('rou-check-card:',card,'; result:'+(4+bonus-get.value(card)));
							return 4+bonus-get.value(card);
						},
						discard:true,
						visible:true,
						content:function(){
							player.getStat().card.sha=0;
							player.addSkill("lgs_gangrou_gang");
							player.removeSkill("lgs_gangrou_rou");
							player.changeZhuanhuanji('lgs_gangrou');
						},
						ai:{
							order:function(item,player){
								if(player.countCards('e',{suit:'diamond'})&&player.countCards('h',function(card){
									return card.suit=='diamond'&&get.type(card)=='equip';
								})) return 11;
								if(player.countCards('he',{suit:'spade'})) return 8;
								return 2.5;
							},
							// order:2.5,
							result:{
								player:function(player){
									if(player.countCards('h','sha')+player.countCards('h')-player.countCards('h','basic')>2) return 1;
									if(player.countCards('h','sha')+player.countCards('h')-player.countCards('h','basic')>1) return 0.6;
									if(player.countCards('h','sha')+player.countCards('h')-player.countCards('h','basic')>0){
										if(player.countCards('he',{suit:'spade'})||(player.countCards('he',{suit:'diamond'})-player.countCards('he','basic',{suit:'diamond'})+player.countCards('he','sha',{suit:'diamond'})))
											return 0.3;
										return player.getUseValue({name:'sha'})>10?0.1:-0.5;
									}
									return -1;
								},
							},
						},
					},
				},
			},
			// "lgs_gangrou":{
				// mark:true,
				// locked:false,
				// zhuanhuanji:true,
				// marktext:"☯",
				// intro:{
					// content:function(storage,player,skill){
						// if(player.storage.lgs_gangrou==true) return '出牌阶段，你可以弃置一张黑色牌，重置本回合【杀】的使用次数';
						// return '你可以将一张非基本牌当【杀】使用或打出，然后重铸一张基本牌';
					// },
				// },
				// init:function(player){
					// game.broadcastAll(function(){
						// var skill=get.info('lgs_gangrou');
						// skill.enable=skill.enable_gang;
						// skill.viewAs=skill.viewAs_gang;
						// skill.filterCard=skill.filterCard_gang;
						// skill.position=skill.position_gang;
						// skill.prompt=skill.prompt_gang;
						// skill.check=skill.check_gang;
						// // skill.precontent=skill.precontent_gang;
						// skill.onuse=skill.onuse_gang;
						// skill.mod=skill.mod_gang;
						// skill.ai=skill.ai_gang;
					// });
				// },
				// filter:function(event,player){
					// return player.countCards('he');
				// },
				// enable_gang:["chooseToUse","chooseToRespond"],
				// viewAs_gang:{name:"sha"},
				// filterCard_gang:function(card){
					// return get.type(card)!='basic';
				// },
				// position_gang:"hes",
				// prompt_gang:"将一张非基本牌当杀使用或打出",
				// check_gang:function(card){
					// var bonus = 0;
					// var player=get.owner(card);
					// if(player.hasSkill("lgs_yanhuan")){
						// if(player==_status.currentPhase){
							// if(card.suit=='diamond'&&card.name!='zhuge')bonus+=4;
							// else if(!player.countCards('he',{suit:'spade'}))bonus-=1;
							// var hc=player.getCards('h');
							// var eq=player.getCards('e');
							// if(eq.contains(card)){
								// for (var ahc of hc){
									// if(get.subtype(ahc)==get.subtype(card)&&ahc.suit=='diamond'&&ahc.name!='zhuge'){
										// bonus+=6;
										// break;
									// }
								// } 
							// }
						// }
						// if(player!=_status.currentPhase){
							// if(card.suit=='heart')bonus+=2;
							// if(card.suit=='diamond')bonus-=1.5;
						// }
						// if(card.suit=='spade')bonus-=1;
					// }
					// return 8+bonus-get.value(card);
				// },
				// precontent:function(player){
					// player.changeZhuanhuanji('lgs_gangrou');
				// },
				// onuse_gang:function(links,player){
					// var next=game.createEvent('lgs_gangrou_onuse',false,_status.event.getParent());
					// next.player=player;
					// next.setContent(function(){
						// game.broadcastAll(function(){
							// var skill=get.info('lgs_gangrou');
							// skill.enable=skill.enable_rou;
							// skill.filterCard=skill.filterCard_rou;
							// skill.position=skill.position_rou;
							// skill.prompt=skill.prompt_rou;
							// skill.check=skill.check_rou;
							// skill.content=skill.content_rou;
							// skill.mod=skill.mod_rou;
							// skill.ai=skill.ai_rou;
							// skill.viewAs=null;
							// // skill.precontent=null;
							// skill.onuse=null;
						// });
					// });
				// },
				// mod_gang:{
					// aiOrder:function(player,card,num){
						// if(get.itemtype(card)=='card'&&player==_status.currentPhase){
							// if(card.name=='jiu') return num+get.order('lgs_gangrou')-get.order('sha');
							// if(card.name=='sha') return num+4;
							// if(card.name=='shunshou') return num+1;
						// }
					// },
				// },
				// ai_gang:{
					// respondSha:true,
					// reverseEquip:true,
					// skillTagFilter:function(player,tag,arg){
						// if(tag=='reverseEquip')return player.countCards('he',function(card){
							// return get.subtype(card)=='equip1'&&card.suit=='diamond';
						// })>1;
					// },
					// order:function(item,player){
						// if (player==_status.currentPhase){
							// // var weapon=player.getEquip(1);
							// // if(weapon&&weapon.suit=='diamond'&&weapon.name!='zhuge')return 10;
							// for(var cur of player.getCards('e'))
								// if(cur&&cur.suit=='diamond')
									// return 11;
							// if(player.countCards('he',{suit:'diamond'}))
								// return 8.1;
							// if(player.countCards('he')-player.countCards('h','basic')<=1)return 3.5;
							// return 6.5;
						// }
						// return 4.5;
					// },
				// },
				// enable_rou:'phaseUse',
				// filterCard_rou:function(card){
					// return get.color(card)=='black';
				// },
				// position_rou:"he",
				// prompt_rou:"弃置一张黑色牌，重置杀的使用次数",
				// check_rou:function(card){
					// var bonus=0,player=_status.event.player;
					// if(card.suit=='spade')bonus+=6;
					// if(get.type(card,'trick')=='basic')bonus+=2;
					// else if(!player.countCards('he',{suit:'diamond'})||!player.hasValueTarget('sha'))bonus-=4;
					// // game.log('rou-check-card:',card,'; result:'+(4+bonus-get.value(card)));
					// return 4+bonus-get.value(card);
				// },
				// content_rou:function(){
					// player.getStat().card.sha=0;
					// player.changeZhuanhuanji('lgs_gangrou');
					// game.broadcastAll(function(){
						// var skill=get.info('lgs_gangrou');
						// skill.enable=skill.enable_gang;
						// skill.viewAs=skill.viewAs_gang;
						// skill.filterCard=skill.filterCard_gang;
						// skill.position=skill.position_gang;
						// skill.prompt=skill.prompt_gang;
						// skill.check=skill.check_gang;
						// skill.precontent=skill.precontent_gang
						// skill.onuse=skill.onuse_gang;
						// skill.mod=skill.mod_gang;
						// skill.ai=skill.ai_gang;
						// skill.content=null;
					// });
					// var skill=get.info('lgs_gangrou');
				// },
				// ai_rou:{
					// order:function(item,player){
						// if(player.countCards('e',{suit:'diamond'})&&player.countCards('h',function(card){
							// return card.suit=='diamond'&&get.type(card)=='equip';
						// })) return 11;
						// if(player.countCards('he',{suit:'spade'})) return 8;
						// return 2.5;
					// },
					// // order:2.5,
					// result:{
						// player:function(player){
							// if(player.countCards('h','sha')+player.countCards('h')-player.countCards('h','basic')>2) return 1;
							// if(player.countCards('h','sha')+player.countCards('h')-player.countCards('h','basic')>1) return 0.6;
							// if(player.countCards('h','sha')+player.countCards('h')-player.countCards('h','basic')>0){
								// if(player.countCards('he',{suit:'spade'})||(player.countCards('he',{suit:'diamond'})-player.countCards('he','basic',{suit:'diamond'})+player.countCards('he','sha',{suit:'diamond'})))
									// return 0.3;
								// return player.getUseValue({name:'sha'})>10?0.1:-0.5;
							// }
							// return -1;
						// },
					// },
				// },
				// group:'lgs_gangrou_chongzhu',
				// subSkill:{
					// chongzhu:{
						// trigger:{player:['useCardAfter','respondAfter']},
						// filter:function(event,player){
							// // game.log(event.content);
							// if(event.skill!='lgs_gangrou') return false;
							// return player.countCards('h',{type:'basic'});
						// },
						// direct:true,
						// content:function(){
							// 'step 0'
							// player.chooseCard('h',true,'请重铸一张基本牌',function(card,player){
								// return get.type(card)=='basic';
							// }).set('ai',function(card){
								// var bonus=0;
								// if(card.color=='red') bonus+=2.5;
								// if(card.suit=='diamond'){
									// if(card.name=='shan') bonus+=1.5;
									// else bonus-=1;
								// }
								// if(card.suit=='spade')bonus-=1;
								// return bonus-get.value(card);
							// });
							// 'step 1'
							// if(result.bool){
								// player.lose(result.cards,ui.discardPile,'visible');
								// player.$throw(result.cards,1000);
								// game.log(player,'将',result.cards,'置入了弃牌堆');
								// player.draw();
							// }                                
						// },
						// sub:true,
					// },
				// },
			// },
			"lgs_yanhuan":{
				mod:{
					aiOrder:function(player,card,num){
						if(get.itemtype(card)=='card'){
							if(player==_status.currentPhase)
								if(card.suit=='diamond'){
									if(card.name=='zhuge') return 9;
									return num+0.1;
								}
							else
								if(card.suit=='heart')return num+0.1;
						}
					},
					aiValue:function(player,card,num){
						if(_status.event.name=='chooseToDiscard'){
							if(get.suit(card)=='heart') return num+0.1;
							if(player==_status.currentPhase&&get.suit(card)=='spade') return num-0.1;
							if(player!=_status.currentPhase&&get.suit(card)=='club') return num-0.1;
						}
					},
					aiUseful:function(){
						return lib.skill.lgs_yanhuan.mod.aiValue.apply(this,arguments);
					},
				},
				ai:{
					reverseEquip:true,
					skillTagFilter:function(player,tag){
						if(tag=='reverseEquip'&&player.countCards('he','equip',{suit:'diamond'})<2)return false;
					},
					effect:{
						player:function(card,player,target){
							if(player==_status.currentphase&&card.suit=='diamond') return [1,1];
							if(player!=_status.currentphase&&card.suit=='heart') return [1,1];
						},
					},
					threaten:1.2,
				},
				group:["lgs_yanhuan_shiyong","lgs_yanhuan_qizhi"],
				subSkill:{
					shiyong:{
						trigger:{
							player:"useCard",
						},
						filter:function(event,player){
							if(player==_status.currentPhase&&get.suit(event.card)=='diamond'){
								return true;
							}
							if(player!=_status.currentPhase&&get.suit(event.card)=='heart'){
								return true;
							}
							return false;
						},
						frequent:true,
						content:function(){
							'step 0'
							player.draw();
						},
						sub:true,
					},
					qizhi:{
						trigger:{
							player:"loseAfter",
						},
						filter:function(event,player){
							if(event.type!='discard') return false;
							var evt=event.getl(player);
							if(!evt||!evt.cards2) return false;
							for(var i=0;i<evt.cards2.length;i++){
								if(player==_status.currentPhase&&get.suit(event.cards[i])=='spade') return true;
								if(player!=_status.currentPhase&&get.suit(event.cards[i])=='club') return true;
							}
							return false;
						},
						frequent:true,
						content:function(){
							'step 0'
							player.draw();
						},
						sub:true,
					},
				},
			},
			"lgs_gangqu":{
				subSkill:{
					wuxiao:{},
				},
				enable:["chooseToUse","chooseToRespond"],
				viewAs:function(cards,player){
					if(player.countCards('h','sha')) return {name:'sha',isCard:true};
					return {name:'sha'};
				},
				filter:function(event,player){
					return event.filterCard({name:'sha'},player,event)&&player.countCards('he')&&!player.hasSkill("lgs_gangqu_wuxiao");
				},
				prompt:function(event){
					var player=event.player
					if(player.countCards('h','sha')) return '弃置所有杀并摸等量牌，视为使用一张【杀】';
					return '将一张牌当杀使用或打出';
				},
				filterCard:function(card,player){
					if(player.countCards('h','sha')) return get.name(card)=='sha';
					return true;
				},
				position:'he',
				selectCard:function(){
					var player=get.player();
					if(player.countCards('h','sha')>0){
						return -1;
					}
					return 1;
				},
				precontent:function(){
					player.logSkill('lgs_gangqu');
					player.showHandcards(get.translation(player)+'发动了【刚躯】'); 
					if(player.countCards('h','sha')>0){
						var num=player.countCards('h','sha');
						player.discard(player.getCards('h','sha'));
						player.draw(num);
						event.result.card={name:'sha',isCard:true};
						event.result.cards=[];
					}
					else player.addTempSkill("lgs_gangqu_wuxiao");
				},
				log:false,
				popname:true,
				ai:{
					respondSha:true,
					order:function(item,player){
						var shaN=player.countCards('h','sha');
						if(shaN>2&&player.countCards('e','zhuge'))return get.order({name:'sha'})-0.05;
						if(shaN)return get.order({name:'sha'})+0.05;
						return get.order({name:'sha'});
					},
					effect:{
						player:function(card,player,target){
							// game.log('skill: '+_status.event.skill);
							if(_status.event.skill=='lgs_gangqu'&&player.countCards('h','sha')){
								if(player.countCards('e','zhuge')&&player.countCards('h','sha')>2) return 0;
								return [1,1];
							}
						}
					}
				},
			},
			"lgs_liepo":{
				trigger:{target:'shaBegin'},
				filter:function(event,player){
					return event.card.name=='sha'&&player.countCards('h','shan')==0;
				},
				content:function(){
					trigger.cancel();
					player.line(trigger.player);
					trigger.player.useCard({name:'juedou',isCard:true},player);
				},
				ai:{
					threaten:0.9,
				},
			},
			"lgs_xiushen":{
				zhuSkill:true,
				trigger:{global:'useCardToTargeted'},
				filter:function(event, player){
					if(event.target==player) return false;
					if(!player.hasZhuSkill('lgs_xiushen')) return false;
					if(event.target.group!='qun') return false;
					return event.card.name=='sha'&&event.target.countCards('h','sha')>0;
				},
				direct:true,
				content:function(){
					'step 0'
					trigger.target.chooseCard(get.prompt('lgs_xiushen'),function(card){
						return card.name=='sha';
					}).set('ai',function(card){
						if(!_status.event.check) return -1;
						return 7-get.value(card);
					}).set('check',function(){
						return get.attitude(trigger.target,player);
					}()>0);
					'step 1'
					if (result.bool){
						player.logSkill('lgs_xiushen');
						trigger.target.give(result.cards,player);
					}
					else
						event.finish();
					'step 2'
					player.chooseCard(get.prompt('lgs_xiushen'),function(card){
						return card.name=='shan';
					}).set('ai',function(card){
						if(!_status.event.check) return -1;
						return 10-get.value(card);
					}).set('check',function(){
						return get.attitude(player,trigger.target);
					}()>=0);
					'step 3'
					if (result.bool)
						player.give(result.cards,trigger.target);
				},
			},
			"lgs_qishi":{
				subSkill:{
					cishu:{
						marktext:"起事",
						intro:{
							content:"本回合其他角色因“起事”展示了#次手牌",
						},
						init:function(player){
							player.storage.lgs_qishi_cishu=1;
							player.markSkill("lgs_qishi_cishu");
							player.syncStorage("lgs_qishi_cishu");
						},
						onremove:function(player){
							player.unmarkSkill("lgs_qishi_cishu");
							delete player.storage.lgs_qishi_cishu;
						},
					},
				},
				audio:'ext:理工杀:1',
				enable:"phaseUse",
				selectTarget:1,
				filterTarget:function(card,player,target){
					return target!=player&&target.countCards('h')>0;
				},
				content:function(){
					'step 0'
					player.chat('你个弟弟');
					player.discardPlayerCard(target,'h',true);
					'step 1'
					if(!result.bool){
						event.finish();
					}
					var cards=target.getCards('h');
					var suit=get.suit(cards[0],target);
					for(var i=1;i<cards.length;i++){
						if(get.suit(cards[i],target)!=suit) event.finish();
					}
					'step 2'
					// player.chooseBool(get.prompt2('quanji')).set('frequentSkill','quanji');
					target.chooseBool("是否展示手牌并对"+get.translation(player)+"进行报复？").set('ai',function(){
						var evt=_status.event.getParent();
						return 0.1-get.attitude(_status.event.player,evt.player);
					});
					'step 3'
					if(!result.bool){
						event.finish();
					}
					'step 4'    
					player.chat('哥我错了');
					target.showHandcards();
					if(player.hasSkill("lgs_qishi_cishu")){
						player.storage.lgs_qishi_cishu++;
						player.syncStorage("lgs_qishi_cishu");
					}else{
						player.addTempSkill("lgs_qishi_cishu");
					}
					event.num1=target.countCards('h');
					event.num2=player.storage.lgs_qishi_cishu;
					var str1="弃置"+get.translation(player)+event.num1+"张牌";
					var str2="对"+get.translation(player)+"造成"+event.num2+"点伤害";                        
					target.chooseControl().set('ai',function(){
						if(event.num2*2<event.num1) return 0;
						return 1;
					}).set('choiceList',[str1,str2]).set('choice',choice);
					'step 5'
					if(result.index==0){
						target.discardPlayerCard(player,'he',event.num1,true);
					}else{
						player.damage(event.num2,target);
					}
				},
				ai:{
					order:11,
					result:{
						target:function(player,target){
							var skillList=['shangshi','lianying','kongcheng','tuntian','retuntian','oltuntian','boss_juejing'];
							for(var skill of skillList)
								if(target.hasSkill(skill))
									return 0;
							return -1;
						},
						player:function(player,target){
							if(get.attitude(player,target)>0) return 0;  // 对队友发动无风险
							if(player.storage.lgs_qishi_cishu) return -2;
							if(target.countCards('h')>4) return -0.1;
							if(target.countCards('h')==4) return -0.3;
							if(target.countCards('h')==3) {
								if(player.hp<=1)return -1;
								if(player.hp<=2)return -0.7;
								return -0.5;
							}
							return -2.5;
						},
					},
					threaten:1.4,
				},
			},
			"lgs_yange":{
				audio:'ext:理工杀:1',
				trigger:{
					player:"judge",
				},
				forced:true,
				content:function(){
					trigger.fixedResult={
						suit:"club",
						color:"black",
					};
				},
				ai:{
					effect:{
						target:function(card,player,target){
							if(card&&['bingliang','bagua'].contains(card.name)) return 'zeroplayertarget';
						},
					},
				},
			},
			"lgs_yian":{
				marktext:"易安",
				intro:{
					content:"你已发动了#次“易安”。",
				},
				trigger:{
					player:['loseAfter','changeHp'],
					global:['equipAfter','addJudgeAfter','gainAfter','loseAsyncAfter','addToExpansionAfter'],
				},
				priority:1,
				forced:true,
				filter:function(event,player){
					if(player==_status.currentPhase) return false;
					if(event.name!='changeHp'&&(event.name!='gain'||event.player!=player)){
						var evtl=event.getl(player);
						if(!evtl||!evtl.hs||!evtl.hs.length) return false;
					}
					return player.countCards('h')==player.hp&&!_status.dying.length&&!game.hasPlayer(function(current){
						return current.hp<1;
					});
				},
				content:function(){
					"step 0"
					if(!player.hasSkill("lgs_yingsuo")) player.addMark('lgs_yian',1,false);
					var cards=Array.from(ui.ordering.childNodes);
					while(cards.length){
						cards.shift().discard();
					}
					"step 1"
					var evt=_status.event.getParent('phase');
					if(evt){
						game.resetSkills();
						_status.event=evt;
						_status.event.finish();
						_status.event.untrigger(true);
					}
				},
				ai:{
					noh:true,
					maixie:true,
					maixie_defend:true,
					skillTagFilter:function(player,tag){
						if(tag=='noh'&&player==_status.currentPhase){
							if(player.hasSkill('lgs_xiaoyi'))
								return player.countCards('h')>player.countMark("lgs_yian")&&player.hp-player.countCards('h')!=1;
							return player.countCards('h')>player.hp;
						}
						if((tag=='maixie'||tag=='maixie_defend')&&(player==_status.currentPhase||player.hp-player.countCards('h')!=1||player.hp<=2)) return false;
					},
				},
				// group:'lgs_yian_log',
				// subSkill:{
					// log:{
						// trigger:{target:'useCardToTarget',},
						// direct:true,
						// content:function(){
							// 'step 0'
							// //player.draw();
							// game.log((player.hasSkillTag('maixie')?'hasMaixie':'noMaixie'));
							// game.log((player.hasSkillTag('noh')?'hasNoh':'noNoh'));
						// },
						// sub:true,
					// },
				// },
			},
			"lgs_xiaoyi":{
				skillAnimation:true,
				juexingji:true,
				trigger:{player:'phaseZhunbeiBegin'},
				forced:true,
				unique:true,
				filter:function(event,player){
					return player.countMark("lgs_yian")>=player.countCards('h');
				},
				derivation:"lgs_yingsuo",
				content:function(){
					player.unmarkSkill("lgs_yian");
					player.drawTo(player.maxHp);
					player.loseMaxHp();
					player.addSkill("lgs_yingsuo");
					player.awakenSkill("lgs_xiaoyi");
				},
				ai:{
					noh:true,
					skillTagFilter:function(player,tag){
						if(tag=='noh'&&(player.countCards('h')<=player.countMark("lgs_yian")||player.hp-player.countCards('h')==1||!player.hasSkill('lgs_yian')))return false;
						return true;
					},
					threaten:2.5,
				},
			},
			"lgs_yingsuo":{
				trigger:{global:"useCardToTargeted",},
				filter:function(event,player){
					return event.card.name=='sha'&&event.target.countCards('h')<=player.countCards('h')&&event.target.isIn();
				},
				check:function(event,player){
					var curr=_status.currentPhase,target=event.target,diff=player.hp-player.countCards('h'),useless=player.countCards('h',function(card){
						return get.value(card)+get.useful(card)<2;
					});
					// 对友方直接发动
					if(get.attitude(player,target)>0)return true;
					// 若无法发动易安
					if(player==curr||!player.hasSkill('lgs_yian')) return player.countCards('e','baiyin')&&player.hp<player.maxHp;	
					// 若可能触发易安
					if(get.attitude(player,curr)>0)
						return diff!=0&&diff!=1&&((player.countCards('e','baiyin')&&player.hp<player.maxHp)||useless>0);
					return diff==1||useless>0;
				},
				content:function(){
					'step 0'
					var str1="将一张手牌交给"+get.translation(trigger.target)+"，然后摸一张牌";
					var str2="收回任意张装备区里的牌";
					player.chooseControl().set('ai',function(){
						if(event.num2*2<event.num1) return 0;
						return 1;
					}).set('choiceList',[str1,str2]).set('ai',function(){
						var evt=_status.event;//.getparent();
						var player=evt.player,curr=_status.currentPhase,target=evt.target;
						var atti=get.attitude(player,target),diff=player.hp-player.countCards('h'),useless=player.countCards('h',function(card){
							return get.value(card)+get.useful(card)<2;
						});
						// 若不能发动易安
						if(player==curr||!player.hasSkill('lgs_yian')){
							if(atti<=0){
								if(player.countCards('e','baiyin')&&player.hp<player.maxHp)return 1;//
								if(useless)return 0;
							}
							if(atti>0)return 0;
							return 1;
						}
						// 若可能触发易安
						if(atti>0)return 0;
						if(atti<=0){
							// return (get.attitude(player,curr)>0?1:0)
							if(get.attitude(player,curr)>0)
								return ((player.countCards('e','baiyin')&&player.hp<player.maxHp)?1:0);
							return 0;//((diff==1||useless>0)?0:1);
						}
						return 0;
					}).set('choice',choice);
					'step 1'
					if(result.index!=0){
						player.gainPlayerCard(player,'e',true,[1,Infinity]);
						event.finish();
					}
					'step 2'
					if(trigger.target!=player){
						player.chooseCard(true,'h','交给'+get.translation(trigger.target)+'一张手牌').set('ai',function(card){
							if(card.name=='shan') return 1;
							return 0;
						});
					}
					else{
						player.draw();
						event.finish();
					}
					'step 3'
					trigger.target.gain(result.cards,player,'give');
					game.delay();
					'step 4'
					player.draw();
				},
				ai:{
					threaten:2.5,
				},
			},
			"lgs_beishan":{
				trigger:{player:'phaseJieshuBegin'},
				filter:function(event,player){
					if(player.getExpansions('lgs_beishan').length) return false;
					return true;
				},
				frequent:true,
				content:function(){
					'step 0'
					player.draw(2);
					'step 1'
					var nh=player.countCards('h');
					if(nh){
						player.chooseCard('h',[1,nh],'将任意张手牌置于你的武将牌上作为“膳”').set('ai',function(card){
							var player=_status.event.player;
							if(!player.hasSkill('lgs_shenghua'))return -1;
							// 计算合适目标数
							var goodTarget=game.filterPlayer(function(current){
								if(player.storage.shlv==1&&current==player) return false;
								if(current.countCards('j','lebu')||current.countCards('j','bingliang')||current.hasSkill('lgs_zaoxing_tag1')) return false;
								if(get.attitude(player,current)>1) return true;
								return current.countCards('h')-current.getHandcardLimit()>0&&!current.hasSkill('keji');
								// target.countCards('j',function(card){
									// return get.effect(target,{
										// name:card.viewAs||card.name,
										// cards:[card],
									// },target,target)
								// }
							});
							// 分等级讨论
							if(player.storage.shlv==1){
								if(player.countCards('h',{suit:'heart'})
								&&player.countCards('h',{suit:'diamond'})
								&&player.countCards('h',{suit:'spade'})
								&&player.countCards('h',{suit:'club'})){
									if(ui.selected.cards.filter(function(cardx){
										return get.suit(cardx,player)==get.suit(card,player);
									}).length)return -1;
									return 999-get.value(card);
								}
								// var base = (player.getNext().position==1?1:player.storage.lgs_shenghua_cishu+1);??
								if(goodTarget.length<1||ui.selected.cards.length>=player.storage.lgs_shenghua_cishu+1) return -1;
								return 5-get.value(card);
							}
							else if(player.storage.shlv==2){
								// 计算无用手牌数
								var useless=0;
								for (var hc in player.getCards('h'))
									if (5-get.value(card))useless++;
								// 确定预期发动次数
								var expectedNum = 0,consumption = 0,nowConsum=player.storage.lgs_shenghua_cishu+1,updated=false;
								for(var i in goodTarget){
									if(consumption+nowConsum>useless)break;
									if(goodTarget[i].seat<=player.seat&&!updated){
										updated=true;
										nowConsum=1;
									}
									consumption+=nowConsum++;
								}
								// while(expectedNum<goodTarget){
									// if(consumption+nowConsum>useless)break;
									// consumption+=nowConsum++;
									// expectedNum++;
								// }
								if(ui.selected.cards.length>=consumption) return -get.value(card);
								return 5-get.value(card);
							}
						});
					}
					else{
						event.finish();
					}
					'step 2'
					if(result.bool){
						player.addToExpansion(result.cards,player,'giveAuto').gaintag.add('lgs_beishan');
						//event.trigger("addCardToStorage");
					}
				},
				onremove:function(player,skill){
					var cards=player.getExpansions(skill);
					if(cards.length) player.loseToDiscardpile(cards);
				},
				marktext:'膳',
				intro:{
					name:'备膳',
					content:'expansion',
					markcount:'expansion',
				},
			},
			lgs_shenghua:{
				group:['lgs_shenghua_cishu'],
				subSkill:{
					cishu:{
						marktext:"生花",
						intro:{
							content:"本轮发动了#次“生花”",
						},
						trigger:{global:'roundStart'},
						direct:true,
						content:function(){
							player.storage.lgs_shenghua_cishu=0;
							player.syncStorage("lgs_shenghua_cishu");
						},
					},
				},
				init:function(player){
					player.storage.shlv=1;
					player.storage.lgs_shenghua_cishu=0;
					// player.markSkill("lgs_shenghua_cishu");
					// player.syncStorage("lgs_shenghua_cishu");
				},
				trigger:{global:'phaseDrawAfter'},
				filter:function(event,player){
					if((event.player==player||player.storage.lgs_shenghua_cishu==1)&&player.storage.shlv==1)return false;
					return player.getExpansions('lgs_beishan').length>player.storage.lgs_shenghua_cishu;
				},
				check:function(event,player){
					if(player.storage.shlv==1){
						if(player.getExpansions('lgs_beishan').length>=4) return false;
						if(event.player.getNext()==player&&player.getExpansions('lgs_beishan').length==player.storage.lgs_shenghua_cishu+1) return true;
					}
					var target=event.player
					return (get.attitude(player,target)>0
							||get.attitude(player,target)<0&&target.countCards('h')-target.getHandcardLimit()>2)&&!target.skipList.contains('phaseUse'); 
				},
				content:function(){
					'step 0'
					player.storage.lgs_shenghua_cishu++;
					player.syncStorage("lgs_shenghua_cishu");
					player.chooseCardButton("移去"+player.storage.lgs_shenghua_cishu+"张“膳”",player.getExpansions('lgs_beishan'),player.storage.lgs_shenghua_cishu,true);
					'step 1'
					if(!result.bool){
						event.finish();
					}
					player.loseToDiscardpile(result.links);
					'step 2'
					event.target=trigger.player;
					player.chooseControl("准备阶段","判定阶段","摸牌阶段","出牌阶段","弃牌阶段","结束阶段").set('ai',function(){
						var evt=_status.event.getParent();
						if(get.attitude(evt.player,evt.target)>0){
							if(evt.target.skipList.contains('phaseUse') && evt.target.countCards('h')>=evt.target.getHandcardLimit()) return 3;
							if(evt.target.hasSkill('rejieyue')) return 5;
							return 2;
						}
						if(get.attitude(evt.player,evt.target)<0) return 4;
						return 1;
					}).set('prompt',"请选择一个阶段令其执行");
					'step 3'
					player.line(event.target);
					var next;
					switch(result.control){
						case "准备阶段":
							next=trigger.player.phaseZhunbei();
							break;
						case "判定阶段":
							next=trigger.player.phaseJudge();
							break;
						case "摸牌阶段":
							next=trigger.player.phaseDraw();
							break;
						case "出牌阶段":
							next=trigger.player.phaseUse();
							break;
						case "弃牌阶段":
							next=trigger.player.phaseDiscard();
							break;
						case "结束阶段":
							next=trigger.player.phaseJieshu();
							break;
					}
					event.next.remove(next);
					trigger.getParent('phase').next.push(next);
					game.log(event.target,'获得了额外的'+result.control);
				},
				ai:{
					combo:'lgs_beishan',
					threaten:1.3,
				},
			},
			"lgs_manfu":{
				skillAnimation:true,
				juexingji:true,
				trigger:{player:'phaseZhunbeiBegin'},
				forced:true,
				unique:true,
				filter:function(event,player){
					var suits=[];
					var cards=player.getExpansions("lgs_beishan");
					for(var i=0;i<cards.length;i++){
						suits.add(get.suit(cards[i]));
					}
					return suits.length==4;
				},
				content:function(){
					'step 0'
					player.chooseDrawRecover(2,true,function(event,player){
						if(player.hp==1&&player.isDamaged()) return 'recover_hp';
						return 'draw_card';
					});
					'step 1'
					player.loseMaxHp();
					player.storage.shlv=2;
					player.awakenSkill('lgs_manfu');
				},
			},
			"lgs_boshi":{
				audio:'shelie',
				trigger:{
					player:"phaseDrawBegin1",
				},
				filter:function(event,player){
					return !event.numFixed;
				},
				check:function(event, player){
					return !(player.countCards('h') == 0 && player.hp <= 2);
				},
				content:function(){
					"step 0"
					trigger.changeToZero();
					event.cards=get.cards(10);
					"step 1"
					var next=player.chooseButton(['【博识】：请选择一张牌获得之',event.cards]);
					next.set('filterButton',function(button){
						for(var i=0;i<ui.selected.buttons.length;i++){
							if(get.suit(ui.selected.buttons[i].link)==get.suit(button.link)) return false;
						}
						return true;
					});
					next.set('ai',function(button){
						return get.value(button.link,_status.event.player);
					});
					next.set('cards',event.cards);
					"step 2"
					for(var i=event.cards.length-1;i>=0;i--){
						if(result.bool&&result.links.contains(event.cards[i])){
							player.gain(event.cards[i],'draw');
						}
						else{
							event.cards[i].fix();
							ui.cardPile.insertBefore(event.cards[i],ui.cardPile.childNodes[0]);
						}
					}
					game.updateRoundNumber();
				},
			},
			"lgs_youtu":{
				init:function(player){
					if(player==_status.currentPhase){
						player.addTempSkill('lgs_youtu_markGain');
						player.addTempSkill('lgs_youtu_markLoss');
					}
				},
				trigger:{
					player:"phaseJieshuBegin",
				},
				filter:function(event,player){
					return player.storage.lgs_youtu_markLoss >= player.storage.lgs_youtu_markGain;
				},
				direct:true,
				content:function(){
					'step 0'
					if (event.invokeTimes == undefined) event.invokeTimes=0;
					var zai = '';
					if (event.invokeTimes == 1) zai='再次';
					var next = player.chooseTarget('是否'+zai+'发动【忧途】，令一名角色摸一张牌，然后你可以弃置其一张牌?');
					next.set('ai',function(target){
						var attitude=get.attitude(_status.event.player,target),card=get.cards(1)[0];
						var uv=get.useful(card)+get.value(card),disc=false;
						if(uv<3) disc=true;
						ui.cardPile.insertBefore(card,ui.cardPile.childNodes[0]);
						if(!disc){
							if(attitude>0){
								if(_status.event.player==target) attitude+=2;
								return attitude+Math.max(0,6-target.countCards('h'));
							}
							return -attitude;
						}
						if(attitude<=0){
							var value=0,equips=target.getCards('e');
							for(var eq of equips)
								value=Math.max(get.equipValue(eq),value);
							return value;
						}
						return 3;
					});
					'step 1'
					event.target=NaN;
					if(result.bool){
						event.invokeTimes+=1;
						event.invoked=true;
						event.target=result.targets[0];
						player.logSkill('忧途',event.target);
						// player.line(event.target,'green');
						event.target.draw();
					}
					else
						event.invoked = false;
					'step 2'
					if (event.target){
						var next2 = player.chooseBool('是否弃置'+get.translation(event.target)+'一张牌？');
						next2.set('ai', function(){
							var evt = _status.event.getParent();
							return get.attitude(evt.player, evt.target) < 0;
						});
					}
					'step 3'
					if(result.bool)
						player.discardPlayerCard(event.target, 'he', true);
					'step 4'
					if (event.invoked && event.invokeTimes < 2)
						event.goto(0);
					game.updateRoundNumber();
				},
				ai:{
					threaten:1.4,
				},
				group:"lgs_youtu_recordStart",
				subSkill:{
					markLoss:{
						marktext:"失",
						intro:{
							content:"本回合失去了#张牌",
						},
						init:function(player){
							player.storage.lgs_youtu_markLoss=0;
							player.markSkill("lgs_youtu_markLoss");
							player.syncStorage("lgs_youtu_markLoss");
						},
						onremove:function(player){
							player.unmarkSkill("lgs_youtu_markLoss");
							delete player.storage.lgs_youtu_markLoss;
						},
						trigger:{
							player:"loseAfter",
							global:["equipAfter","addJudgeAfter","gainAfter","loseAsyncAfter","addToExpansionAfter"],
						},
						filter:function(event,player){
							if(player!=_status.currentPhase){
								return event.name=='lose'&&event.type=='discard'&&event.cards2.filter(function(card){
									return get.name(card,event.hs.contains(card)?player:false)=='sha';
								}).length>0;
							};
							if(event.name=='gain'&&event.player==player) return false;
							var evt=event.getl(player);
							return evt&&evt.cards2&&evt.cards2.length>0;
						},
						forced:true,
						silent:true,
						content:function(){
							var num1=trigger.getl(player).hs.length;
							var num2=trigger.getl(player).es.length;
							player.storage.lgs_youtu_markLoss += num1 + num2;
							player.syncStorage("lgs_youtu_markLoss");
						},
						sub:true,
						popup:false,
					},
					markGain:{
						marktext:"得",
						intro:{
							content:"本回合获得了#张牌",
						},
						init:function(player){
							player.storage.lgs_youtu_markGain=0;
							player.markSkill("lgs_youtu_markGain");
							player.syncStorage("lgs_youtu_markGain");
						},
						onremove:function(player){
							player.unmarkSkill("lgs_youtu_markGain");
							delete player.storage.lgs_youtu_markGain;
						},
						trigger:{
							player:"gainAfter",
						},
						forced:true,
						silent:true,
						filter:function(event, player){
							return event.cards && player == _status.currentPhase;
						},
						content:function(){
							player.storage.lgs_youtu_markGain += trigger.cards.length;
							player.syncStorage("lgs_youtu_markGain");
						},
						sub:true,
						popup:false,
					},
					recordStart:{
						trigger:{
							player:"phaseZhunbeiBegin",
						},
						forced:true,
						silent:true,
						content:function(){
							player.addTempSkill("lgs_youtu_markLoss");
							player.addTempSkill("lgs_youtu_markGain");
						},
						sub:true,
						popup:false,
					},
				},
			},
			"lgs_xinyou":{
				onremove:true,
				intro:{
					markcount:()=>0,
					content:function(storage,player){
						return "上个出牌阶段【心由】使用的牌名："+get.translation(storage);
					},
				},
				trigger:{
					player:"phaseUseBegin",
				},
				filter:true,
				direct:true,
				popname:true,
				content:function(){
					'step 0'
					// ai
					var go=false
					if(player.hp<player.maxHp)
						go=(player.maxHp>2?true:false);
					else
						go=(player.maxHp>3?true:false);
					
					var list=[],list2=[]
					if(lib.filter.cardUsable({name:'sha',isCard:true},player)&&game.hasPlayer(function(current){
						return player.canUse('sha',current);
					}))
						list.push(['','','sha']);
					for(var i of lib.inpile_nature)
						if(lib.filter.cardUsable({name:'sha',nature:i,isCard:true},player)&&game.hasPlayer(function(current){
							return player.canUse({name:'sha',nature:i,isCard:true},current);
						}))
							list.push(['','','sha',i]);
					if(lib.filter.cardUsable({name:'tao'},player)&&game.hasPlayer(function(current){
						return player.canUse('tao',current);
					}))
						list.push(['','','tao']);
					if(lib.filter.cardUsable({name:'jiu'},player)&&game.hasPlayer(function(current){
						return player.canUse('jiu',current);
					}))
						list.push(['','','jiu']);
					for(var i=0;i<lib.inpile.length;i++){
						var type=get.type(lib.inpile[i]);                        
						if(type=='trick'&&game.hasPlayer(function(current){
							return player.canUse(lib.inpile[i],current);
						}))
							list2.push(['','',lib.inpile[i]]);
					}
					player.chooseButton(["心由：你可以减一点体力上限，视为使用一张牌",[list.concat(list2),'vcard']]).set('filterButton',function(button){
						return true;
					}).set('ai',function(button){
						if(!_status.event.check) return 0;
						var card={name:button.link[2],nature:button.link[3],isCard:true},player=_status.event.player
						if(player.storage.lgs_xinyou==card.name) return player.getUseValue(card)-2;
						return player.getUseValue(card);
					}).set('check',(go?true:false));
					'step 1'
					if(result.bool){
						var card={name:result.links[0][2],nature:result.links[0][3],isCard:true,lgs_xinyou:true}
						event.card=card;
						player.chooseUseTarget('是否减一点体力上限，视为使用一张【'+get.translation(card)+'】？',card).logSkill='lgs_xinyou';
						// player.popup(card.name,player);
					}else{
						player.unmarkSkill('lgs_xinyou');
						if(player.storage.lgs_xinyou){
							player.logSkill('lgs_xinyou');
							player.loseHp();
						}
						delete player.storage.lgs_xinyou;
						event.finish();
					}
					'step 2'
					if(result.bool){
						player.storage.lgs_xinyou=event.card.name;
						player.markSkill('lgs_xinyou');
					}else
						event.goto(0);
				},
				ai:{
					threaten:1.6,
				},
				group:["lgs_xinyou_precontent","lgs_xinyou_draw"],
				subSkill:{
					// updateStorage:{
						// init:function(player){
							// player.storage.lgs_xinyou_updateStorage = [];
							// player.syncStorage("lgs_xinyou_updateStorage");
						// },
						// trigger:{
							// player:"phaseEnd",
						// },
						// direct:true,
						// silent:true,
						// sub:true,
						// content:function(){
							// while(player.getStorage('lgs_xinyou').length != 0)
								// player.unmarkAuto('lgs_xinyou',[player.getStorage('lgs_xinyou')[0]]);
							// for (var i = 0; i < player.storage.lgs_xinyou_updateStorage.length; i++)
								// player.markAuto('lgs_xinyou',[player.storage.lgs_xinyou_updateStorage[i]]);
							// player.storage.lgs_xinyou_updateStorage = [];
						// },
						// forced:true,
						// popup:false,
					// },
					precontent:{
						trigger:{player:'useCardBefore'},
						filter:function(event,player){
							return event.skill=='lgs_xinyou'&&event.player.isAlive();
						},
						direct:true,
						content:function(){
							player.loseMaxHp();
						},
					},
					draw:{
						trigger:{player:"useCard"},
						filter:function(event,player){
							return event.skill=='lgs_xinyou'&&player.storage.lgs_xinyou!=undefined&&event.card.name!=player.storage.lgs_xinyou;
						},
						forced:true,
						silent:true,
						sub:true,
						content:function(){
							player.draw();
						},
						// popup:false,
					},
				},
			},
			"lgs_qingshen":{
				skillAnimation:true,
				animateColor:"grey",
				limited:true,
				unique:true,
				mark:true,
				direct:true,
				trigger:{
					player:"phaseJieshuBegin",
				},
				filter:function(event,player){
					return player.getCards("e").length;
				},
				content:function(){
					"step 0"
					// ai
					var ok
					if(player.maxHp<=3) ok=true;
					else ok=(player.countCards('e')>=2);
					//end ai
					
					player.chooseTarget('###是否发动【轻身】？###限定技，结束阶段，你可以选择一名其他角色，以任意次序将装备区里的牌依次当杀对其使用，然后你增加等同于以此法造成伤害总数的体力上限。',function(card,player,target){
						if(player.canUse({name:'sha'},target,false)) return true;
						return false;
					},false).set('ai',function(target){
						if(!_status.event.ok) return 0;
						var player=_status.event.player,effect=0
						for(var card of player.getCards('e'))
							effect+=get.effect(target,get.autoViewAs({name:'sha'},[card]),player,player);
						return effect;
					}).set('cards',player.getCards('e')).set('ok',ok);
					"step 1"
					if (result.bool){
						event.target=result.targets[0];
						player.line(event.target);
						player.logSkill('lgs_qingshen',event.target);
					}  
					else
						event.finish();
					"step 2"
					var cards=player.getCards('e');event.moreThanOne=false;
					if (cards.length>1){
						event.moreThanOne=true;
						player.chooseButton(["轻身：请选择一张装备牌当杀使用",[cards,'vcard']],true);                                            
					}
					"step 3"
					player.useCard({name:'sha'},event.target,[(event.moreThanOne?result.links[0]:player.getCards('e')[0])]).card.rgyqingshen=true;
					"step 4"
					var cs=player.getCards('e'),canConti=true;
					for(var i=0;i<cs.length;i++)
						if(!player.canUse({name:'sha',cards:[cs[i]]},event.target,false)) 
							canConti=false;
					if (player.getCards('e').length&&event.target.isAlive()&&canConti)
						event.goto(2);  
					"step 5"
					player.gainMaxHp(player.storage.lgs_qingshen_damage);
					player.storage.lgs_qingshen_damage=0;
					player.awakenSkill('lgs_qingshen');
				},
				group:"lgs_qingshen_recordDamage",
				subSkill:{
					recordDamage:{
						charlotte:true,
						init:function(player){
							player.storage.lgs_qingshen_damage = 0;
							player.syncStorage("lgs_qingshen_damage");
						},
						trigger:{
							source:"damageSource",
						},
						filter:function(event,player){
							return event.card&&event.card.rgyqingshen==true&&player.isAlive();
						},
						direct:true,
						sub:true,
						content:function(){
							"step 0"
							player.storage.lgs_qingshen_damage+=trigger.num;
						},
					},
				},
			},
			"lgs_jinyi":{
				trigger:{
					player:'gainAfter',
				},
				direct:true,
				filter:function (event,player){
					return event.cards&&event.cards.length>0&&!player.hasSkill('lgs_jinyi_failed');
				},
				content:function(){
					'step 0'
					var zhiduo='',num=trigger.cards.length;
					if(num>1) zhiduo='至多';
					player.chooseCardTarget({
						prompt:'是否发动【近易】，将'+zhiduo+num+'张牌交给一名其他角色？',
						filterCard:true,
						selectCard:[1,trigger.cards.length],
						position:'he',
						filterTarget:function(card,player,target){
							return player!=target;// &&target!=event.temp;
						},
						ai1:function(card){
							if(!player.hasSkill('lgs_qiujin')||player.hasSkill('lgs_qiujin_failed'))return -1;
							if(player.countCards('he')-ui.selected.cards.length<3) return -1;
							if(card.name=='du') return 20;
							return 20-get.value(card)-get.useful(card);//(_status.event.player.countCards('h')-_status.event.player.hp);
						},
						ai2:function(target){
							var att=get.attitude(_status.event.player,target);
							if(ui.selected.cards.length&&ui.selected.cards[0].name=='du'){
								if(target.hasSkillTag('nodu')) return 0;
								return 1-att;
							}
							return att-4;
						},
					});  // .set('prompt','是否发动【近易】，将'+zhiduo+num+'张牌交给一名其他角色？');
					'step 1'
					if(result.bool){
						player.addTempSkill('lgs_jinyi_failed');
						event.target=result.targets[0];
						// player.line(event.target);
						player.logSkill('lgs_jinyi',target);
						event.target.gain(result.cards,player,'give');
					}
				},
				ai:{
					expose:0.3,
				},
				subSkill:{
					failed:{},
				},
			},
			"lgs_qiujin":{
				marktext:'谨',
				intro:{
					name:'求谨',
					name2:'谨',
					content:'当前有#个“谨”标记',
				},
				trigger:{
					player:'loseAfter',
					global:['equipAfter','addJudgeAfter','gainAfter','loseAsyncAfter','addToExpansionAfter'],
				},
				direct:true,
				filter:function(event,player){
					if(event.name=='gain'&&event.player==player) return false;
					var evt=event.getl(player);
					return evt&&evt.cards2&&evt.cards2.length>0&&!player.hasSkill("lgs_qiujin_failed");
				},
				content:function(){
					'step 0'
					var num=trigger.cards.length;
					if(num<player.countMark('lgs_qiujin')){
						player.chooseBool('是否发动【求谨】，移除一个“谨”标记并摸'+num+'张牌？').set(ai,function(){return true;});
					}
					else if(num==player.countMark('lgs_qiujin')){
						player.logSkill('lgs_qiujin');
						player.draw(num);
						player.addTempSkill("lgs_qiujin_failed");
						event.finish();
					}
					else if(num>player.countMark('lgs_qiujin')){
						player.logSkill('lgs_qiujin');
						player.addMark('lgs_qiujin',num-player.countMark('lgs_qiujin'));
						event.finish();
					}
					'step 1'
					if(result.bool){
						player.logSkill('lgs_qiujin');
						player.removeMark('lgs_qiujin',1);
						player.draw(trigger.cards.length);
					}
				},
				onremove:true,
				subSkill:{
					failed:{charlotte:true},
				},
			},
			"lgs_polu":{
				audio:'benxi',
				enable:"phaseUse",
				selectTarget:1,
				selectCard:1,
				position:'he',
				discard:false,
				filterCard:true,
				filterTarget:function(card,player,target){
					var next=target.getNext(),prev=target.getPrevious();
					if(target.getExpansions('lgs_polu_po').length)return false;
					return next==player||prev==player||next.hasSkill('lgs_polu_po')||prev.hasSkill('lgs_polu_po');
				},
				check:function(card){
					var player=get.owner(card),bonus=0;
					if(card.name=='sha'){
						if(card.color=='red')bonus-=0.2;
						if(card.nature=='fire')bonus-=0.3;
						if(card.nature=='thunder')bonus-=0.2;
					}
					if(card==player.getEquip(1)&&card.name!='zhuge'||card==player.getEquip(4))return -1;
					return ((player.countCards('h','sha')==1&&card.name=='sha')||(player.countCards('h','jiu')==1&&card.name=='jiu'))?-1:10+bonus-get.value(card);
				},
				content:function(){
					'step 0'
					event.forceDie=true;//效果未知
					target.addToExpansion(cards,player,'giveAuto').gaintag.add('lgs_polu_po');
					'step 1'
					target.addSkill('lgs_polu_po');
				},
				mod:{
					globalFrom:function(from,to,current){
						//距离计算时无视被破路角色
						var left=[],right=[],left2=from,right2=from,n=1,m=1,nx=0,mx=0;
						while(left2!=to){
							left2=left2.previous;
							if(left2!=to) left.push(left2);
						}
						while(right2!=to){
							right2=right2.next;
							if(right2!=to) right.push(right2);
						}
						if(to==left2){
							for(var i of left){
								if(i.isAlive()&&!i.isOut()&&!i.hasSkill('undist')&&!i.hasSkill('lgs_polu_po')&&!i.isMin(true)) n++;
							}
						}
						if(to==right2){
							for(var i of right){
								if(i.isAlive()&&!i.isOut()&&!i.hasSkill('undist')&&!i.hasSkill('lgs_polu_po')&&!i.isMin(true)) m++;
							}
						}
						return n<m?n:m;
					},
					targetInRange:function(card,player,target){
						//对破路角色使用牌无距离限制
						if(target.hasSkill('lgs_polu_po')){
							return true;
						}
					},
				},
				ai:{// 待迭代功能：判断防具，出牌阶段结束时破路存牌，区别对待队友敌人,多个破路目标做选择
					order:8,//[8,1],
					result:{
						target:0.8,
						player:function(player,target){
							if(!player.countCards('sha'))return -1;  // 不考虑存牌时可这么写
							if(game.hasPlayer(function(current){
								return get.attitude(player,current)<0&&(current.hasSkill('sheyi')||current.hasSkill('zhenwei'));
							}))return -1;
							var skillList=['lgs_liepo','liuli','tianxiang'];
							var l=0,r=0,temp,players=game.filterPlayer(),goodTarget=[],weakEnemy=[],attRange=player.getAttackRange();
							for(var i=0;i<players.length;i++){
								var current=players[i],defend=false,lowHp=false,dist=0,diff=0,hasArmor=false,cardsNum=0,needJiu=false;
								// Search for polu-juesha target:attitude,skill,range,hp,cards
								if(get.attitude(player,current)<0){
									// skill条件
									for(var name in skillList)
										if(current.hasSkill(name)){
											defend=true;
											break;
										}
									if(current.hasSkill('lgs_yingsuo')&&current.hp-current.countCards('h')==1)defend=true;
									if(defend)
										continue;
									// hp条件
									lowHp=(current.hp<=1);
									if(current.hp==2){
										if(player.countCards('h','jiu')&&!(current.countCards('e','baiyin')&&!player.countCards('e','qinggang'))){
											needJiu=true;
											lowHp=true;
										}
									}
									if(lowHp&&player.canUse({name:'sha'},current,false)){ // 
										weakEnemy.push(current);
										// 判断是否有充足的牌进行破路
										dist=get.distance(player,current);
										temp=player;l=0;r=0;
										while(temp!=current){
											temp=temp.getPrevious();
											l++;
										}
										temp=player;
										while(temp!=current){
											temp=temp.getNext();
											r++;
										}
										diff=Math.min(l,r);
										if(!player.countCards('e','qinggang')){
											if(current.countCards('e','renwang')&&!player.countCards('h',{name:'sha',color:'red'}))hasArmor=true;
											if(current.countCards('e','tengjia')&&!player.countCards('h',{name:'sha',nature:'fire'})&&!player.countCards('h',{name:'sha',nature:'thunder'}))hasArmor=true;
											if(current.countCards('e','baiyin'))hasArmor=true;
										}
										cardsNum=dist>diff||hasArmor?diff:dist-attRange;
										if(player.countCards('he')>cardsNum+(needJiu?1:0)){
											if(!player.inRange(current))
												goodTarget.push(current);
											// break;// pass
										}
									}
								}
							}
							if(weakEnemy.length){
								// 
								if(player.inRange(weakEnemy[0])||weakEnemy[0].hasSkill('lgs_polu_po')){// 破路视为在攻击范围内，好像不能用inRange判断
									return -1;
								}
								if(l<=r){
									temp=player.getPrevious();
									while(temp.hasSkill('lgs_polu_po'))
										temp=temp.getPrevious();
								}
								else {
									temp=player.getNext();
									while(temp.hasSkill('lgs_polu_po'))
										temp=temp.getNext();
								}
								if(target==temp)return 2;
							}
							return -1;
						},
					},
					
				},
				subSkill:{
					po:{// 被破路子技能
						trigger:{player:'phaseBegin'},
						forced:true,
						popup:false,
						charlotte:true,
						filter:function(event,player){
							return player.getExpansions('lgs_polu_po').length>0;
						},
						content:function(){
							'step 0'
							player.gain(player.getExpansions('lgs_polu_po'),'draw');
							'step 1'
							player.removeSkill('lgs_polu_po');
						},
						marktext:'破路',
						intro:{
							markcount:'expansion',
							content:'已成为【破路】的目标',
						},
						ai:{
							unequip2:true,
						},
						onremove:function(player,skill){
							var cards=player.getExpansions(skill);
							if(cards.length) player.loseToDiscardpile(cards);
							delete player.storage[skill];
						},
					},
				},
			},
			"lgs_juesha":{
				audio:'shajue',
				trigger:{
					player:'useCardToPlayered',
				},
				shaRelated:true,
				filter:function(event,player){
					return event.card.name=='sha'&&event.getParent().baseDamage>=(event.target.hp+event.target.hujia);
				},
				check:function(event,player){
					return get.attitude(player,event.targets[0])<0;
				},
				content:function(){
					player.line(trigger.target);
					trigger.getParent().directHit.push(trigger.target);
					trigger.getParent().baseDamage++;
				},
				ai:{
					// presha:true,
					directHit_ai:true,
					skillTagFilter:function(player,tag,arg){
						var target=arg.target
						if(get.attitude(player,target)>0||arg.card.name!='sha') return false;
						if(player.storage.jiu==undefined)
							player.storage.jiu=0;
						return 1+player.storage.jiu>=target.hp+target.hujia;
					},
				},
			},
			"lgs_daimeng":{
				trigger:{target:'useCardToBefore'},
				priority:15,
				filter:function(event,player){
					return get.number(event.card)>=10;
				},
				check:function(event,player){
					return get.effect(player,event.card,event.player,player)<0;
				},
				content:function(){
					game.log(trigger.card,'对',trigger.target,'无效');
					trigger.cancel();
				},
				ai:{
					effect:{
						target:function(card,player,target,current){
							if(typeof card =='string') return;
							if(card.number<10) return;
							if(card.lgs_daimeng_copy) return;
							var cardx=get.copyBySkill(card,'lgs_daimeng');
							if(get.effect(target,cardx,player,target)<0)
								return 'zerotarget';  // get.effect()最后一个参数为主视者
						},
					},
				},
			},
			"lgs_shensuan":{
				mark:true,
				locked:false,
				zhuanhuanji:true,
				marktext:"☯",
				intro:{
					content:function(storage,player,skill){
						if(player.storage.lgs_shensuan==true) return '其他角色使用牌指定唯一目标时，你可以弃置其一张牌，若此牌与其使用的牌点数之和大于13，其摸3张牌';
						return '当你使用或打出牌时，可以弃置任意张牌，若这些牌与你使用或打出的牌点数总和为13，你摸3张牌';
					},
				},
				ai:{
					threaten:1.1,
				},
				group:['lgs_shensuan_1','lgs_shensuan_2'],
				subSkill:{
					'1':{
						trigger:{
							player:['useCard','respond'],
						},
						// "prompt2":"当你使用或打出牌时，可以弃置任意张牌，若这些牌与你使用或打出的牌点数总和为13，你摸3张牌。",
						filter:function(event,player){
							return !player.storage.lgs_shensuan;
						},
						direct:true,
						content:function(){
							'step 0'
							game.delayx();
							player.chooseToDiscard(get.prompt2('lgs_shensuan_1'),'he',[1,player.countCards('he')]).set('ai',function(cardx){
								if(_status.event.aicards==undefined){
									var player=_status.event.player;
									var cds=player.getCards('he');
									// 通过搜索算法，获取所有合法牌组
									var sum=13-trigger.card.number,cardSets=[],values=[],tempCard=cds[0],tempSet=[],tempSum=0;
									var searchForCardSets=function(listToSearch,tempSet,sum,tempSum,cardSets,searchIndex){
										for(var i=searchIndex;i<listToSearch.length;i++){
											var card=listToSearch[i]
											// 当前卡组加入某牌后点数和正好为所需值，则加入此牌后的此卡组加入合法卡组
											if(tempSum+card.number==sum)
												cardSets.push(tempSet.concat(card));
											// 当前卡组加入某牌后点数和小于所需值，则将此牌移入当前卡组，再进行搜索
											if(tempSum+card.number<sum)
												searchForCardSets(listToSearch,tempSet.concat(card),sum,tempSum+card.number,cardSets,i+1);
										}
									}
									searchForCardSets(cds,[],sum,0,cardSets,0);
									// 从合法牌组中寻找最低价值牌组
									for(var cardSet of cardSets){
										var value=0;
										for(var card of cardSet)
											value+=get.value(card)+get.useful(card);
										values.push(value);
									}
									if(!cardSets||!cardSets.length)return -1;
									var minIndex=0;
									for(var i=1;i<values.length;i++)
										if(values[i]<values[minIndex])
											minIndex=i;
									if(values[minIndex]>18) _status.event.aicards=[];
									else _status.event.aicards=cardSets[minIndex];
								}
								return _status.event.aicards.contains(cardx)?1:false;
							});
							'step 1'
							if(result.bool){
								player.logSkill('lgs_shensuan');
								var num=0;
								for(var card of result.cards){
									if(card.number)
										num+=card.number;
								}
								if(trigger.card&&trigger.card.number){
									num+=trigger.card.number;
								}
								if(num==13)
									player.draw(3);	
								player.changeZhuanhuanji('lgs_shensuan');
							}
						},
					},
					'2':{
						trigger:{
							global:['useCardToPlayered'],
						},
						"prompt2":"当其他角色使用牌指定唯一目标时，你可以弃置其一张牌，若此牌与其使用的牌点数之和大于13，其摸2张牌。",
						filter:function(event,player){
							return event.targets.length==1&&event.player!=player&&player.storage.lgs_shensuan;
						},
						check:function(event,player){
							var card=event.card,target=event.player;
							if(get.attitude(player,target)>0){
								for(var eq of target.getCards('e'))
									if(eq.number+card.number>13&&2.5-get.equipValue(eq)>0)return true;
								return card.number>10;
							}
							if(get.attitude(player,target)<0){
								for(var eq of target.getCards('e'))
									if(!(card.name=='baiyin'&&target.maxHp-target.hp>0))
										return true;
								return card.number<=10;
							}
							return _status.currentPhase.next==player;
						},
						logTarget:'player',
						content:function(){
							'step 0'
							game.delayx();
							event.selfP=player;
							player.discardPlayerCard(trigger.player,'he',true).set('ai',function(button){
								var player=_status.event.player,evt=_status.event.getTrigger();
								var target=evt.player,card=button.link,cardUsed=evt.card;
								if(get.attitude(player,target)>0){
									if(get.position(card)=='e'&&card.number+cardUsed.number>13)
										return 2.5-get.equipValue(card);
									return cardUsed.number>10?1:-1;
								}
								if(get.attitude(player,target)<0){
									var bonus=0;
									if(get.position(card)=='e'){
										if(card.number+cardUsed.number<=13)bonus+=2;
										return card.name=='baiyin'&&target.maxHp-target.hp>0?-1:get.equipValue(card)+bonus;
									}
									if(cardUsed.number>10)return -1;
									return 1.5;
								}
								return -1;
							});
							'step 1'
							if(result.bool){
								var num=0;
								for(var card of result.cards){
									if(card.number)
										num+=card.number;
								}
								if(trigger.card&&trigger.card.number){
									num+=trigger.card.number;
								}
								if(num>13)
									trigger.player.draw(2);	
								player.changeZhuanhuanji('lgs_shensuan');
							}
						},
					},
				},
			},
			"lgs_fengyu":{
				init:function(player){
					player.storage.fengyued=[];
				},
				trigger:{global:'phaseJieshuBegin',},
				filter:function(event,player){
					return player!=event.player&&!event.player.getHistory('sourceDamage').length&&event.player.countCards('he');
				},
				check:function(event,player){
					return get.attitude(player,event.player)<=0;
				},
				content:function(){
					'step 0'
					var num=1;
					if(!player.storage.fengyued.contains(trigger.player.name)){
						num=2;
						player.storage.fengyued.push(trigger.player.name);
					}
					player.logSkill('lgs_fengyu',trigger.player);
					player.line(trigger.player);
					trigger.player.chooseToDiscard(get.translation(player)+'发动了【讽喻】，请弃置'+(num==1?'一':'两')+'张牌','he',true,num);
					trigger.player.storage.fengyu=false;
				},
				ai:{
					expose:0.3,
				},
			},
			"lgs_jianxing":{
				trigger:{player:['phaseUseBegin','changeHp']},
				filter:function(){
					return game.hasPlayer(function(current){
						return current.countCards('h');
					});
				},
				direct:true,
				content:function(){
					'step 0'
					player.chooseTarget(get.prompt2('lgs_jianxing'),function(card,player,target){
						return target.countCards('h');
					}).set('ai',function(target){
						var player=_status.event.player;
						if(get.attitude(player,target)<=0){
							var bonus=0;
							if(target.hasSkill('lgs_jianxing_block')){
								if(target.storage.lgs_jianxing_block.length>=2) return 0;
								bonus-=1;
								for(var card of target.storage.lgs_jianxing_block)
									if(card.name=='shan')bonus-=2;
							}
							return Math.max(target.countCards('h')+bonus,1)-(get.attitude(player,target)==0?2:0);
						}
						if(target==player&&player==_status.currentPhase&&!player.hasSkill('lgs_jianxing_block')){
							if(player.hp==1&&player.countCards('h','tao',function(card){
								return player.canUse(card);
							})){
								return 7;
							}
							if(player.countCards('h',function(card){
								return player.getUseValue(card)>0;
							}))return 2;
							return 0;
						}
						return 0;
					});
					'step 1'
					if(result.bool){
						event.target=result.targets[0];
						player.logSkill('lgs_jianxing',event.target);
						player.choosePlayerCard(event.target,'h',true).set('ai',function(button){
							var player=_status.event.player,target=_status.event.getParent().target,card=button.link;// 
							if(player==target){
								if(player.hp==1&&card.name=='tao'){
									return 999;
								}
								return player.getUseValue(card);
							}
						});
					}
					else event.finish();
					'step 2'
					var card=result.cards[0];
					player.showCards(card);
					target.addSkill('lgs_jianxing_block');
					target.addGaintag(card,'lgs_jianxing');
					target.storage.lgs_jianxing_block.add(card);
					target.syncStorage('lgs_jianxing_block');
				},
				mod:{
					aiValue:function(player,card,num){
						if(get.name(card)!='tao') return;
						var cards=player.getCards('hs',function(card){
							return get.name(card)=='tao';  // ||get.color(card)=='black';
						});
						var geti=function(){
							if(cards.contains(card)){
								return cards.indexOf(card);
							}
							return cards.length;
						};
						return Math.max(num,[7,6,5][Math.min(geti(),2)]);
					},
					aiUseful:function(){
						return lib.skill.lgs_jianxing.mod.aiValue.apply(this,arguments);
					},
				},
				ai:{
					effect:{
						target:function(card,player,target){
							if(card.name=='recover'&&target.hp<target.maxHp) return [1,1];
						},
					},
				},
				group:['lgs_jianxing_draw','lgs_jianxing_endRemove'],
				subSkill:{
					draw:{
						trigger:{global:'useCard'},
						filter:function(event,player){
							return event.card.isCard&&event.cards.length==1
							&&event.player.hasHistory('lose',function(evt){
								if(evt.getParent()!=event) return false;
								for(var i in evt.gaintag_map){
									if(evt.gaintag_map[i].contains('lgs_jianxing')) return true;
								}
								return false;
							});
						},
						charlotte:true,
						direct:true,
						popup:false,
						forceDie:true,
						content:function(){
							'step 0'
							if(player.isAlive()&&player==_status.currentPhase){
								player.logSkill('lgs_jianxing');
								player.draw();
							}
							'step 1'
							trigger.player.removeSkill('lgs_jianxing_block');
						},
						sub:true,
					},
					endRemove:{
						charlotte:true,
						forced:true,
						popup:false,
						forceDie:true,
						trigger:{global:'phaseJieshuEnd'},
						filter:function(event,player){
							return event.player.hasSkill('lgs_jianxing_block');
						},
						content:function(){
							trigger.player.removeSkill('lgs_jianxing_block');
						},
						sub:true,
					},
					block:{
						init:function(player){
							player.storage.lgs_jianxing_block=[];
							player.syncStorage("lgs_jianxing_block");
						},
						mark:true,
						intro:{
							name:'坚行',
							markcount:storage=>storage.length,
							mark:function(dialog,content,player){
								dialog.addText('展示记录');
								dialog.add(player.storage.lgs_jianxing_block);
							},
						},
						mod:{
							cardEnabled2:function(card,player){
								var tagNum=player.countCards('h',function(card){
									return card.hasGaintag('lgs_jianxing');
								});
								if(tagNum>1)return false;
								if(get.itemtype(card)!='card'||!card.hasGaintag('lgs_jianxing'))return false;
							},
						},
						charlotte:true,
						forced:true,
						popup:false,
						forceDie:true,
						trigger:{player:'damageEnd'},
						filter:function(event,player){
							return event.num>0;
						},
						content:function(){
							player.removeSkill('lgs_jianxing_block');
						},
						onremove:function(player){
							player.removeGaintag('lgs_jianxing');
							delete player.storage.lgs_jianxing_block;
						},
						sub:true,
					},
				},
			},
			'lgs_yonglan':{
				trigger:{
					player:["chooseToRespondAfter","chooseToUseAfter"],
				},
				hiddenCard:function(player,name){
					return name=='wuxie';
				},
				filter:function(event,player){
					if(player==_status.currentPhase||event.responded) return false;
					var evt1=event.getParent(1),evt4=event.getParent(4);
					if(event.name=='chooseToUse'&&(!(event.respondTo&&event.respondTo[1])||event.respondTo[1].name=='wuxie'))return false;
					if(evt1.name=='_wuxie')
						return evt4&&evt4.targets&&evt4.targets.length==1;
					return evt1&&evt1.targets&&evt1.targets.length==1;
				},
				forced:true,
				content:function(){
					"step 0"
					if(trigger.result.bool==false){
						game.log(player,'懒得响应');
						player.draw();
					}
					else{
						if(trigger.result.card.name=='wuxie')
							player.addSkill('lgs_yonglan_discard');
						else
							player.chooseToDiscard('【慵懒】：偷懒失败，请弃一张牌','he',true);
					}
				},
				ai:{
					respondSha:true,
					respondShan:true,
					noautowuxie:true,
					effect:{
						player:function(card,player,target){
							if(get.name(card,player)=='shan'){
								var evt=_status.event.getParent();
								game.log('lgs_yonglan-effect-evt:',evt.name);
								if(player.hp<=2||evt.player.hasSkillTag('damageBonus',false,{player:evt.player,card:evt.card})||evt.baseDamage>1)
									return 1;
								return 0;
							}
							if(card.name=='wuxie'&&player!=_status.currentPhase) return player.countCards('he')==1?1:0;
						},
						target:function(card,player,target,effect){ // 可研究：冲阵，激昂，豹变，凶镬
							if(['sha','juedou','qizhengxiangsheng'].concat(game.filterPlayer().length==2?['nanman','wanjian']:[]).contains(card.name)){
								if(player.hp>=4) return [1,0.9];  // [对目标效果的倍数,对目标效果的加数,对使用者效果的倍数,对使用者效果的加数]
								if(player.hp==3) return [1,0.6];
								if(player.hp==2) return [1,0.3];
							}
						},
					},
					threaten:2,
				},
				subSkill:{
					discard:{
						charlotte:true,
						trigger:{player:'useCard'},
						filter:function(event,player){
							return event.card.name=='wuxie';
						},
						forced:true,
						popup:false,
						silent:true,
						content:function(){
							player.chooseToDiscard('【慵懒】：偷懒失败，请弃一张牌','he',true);
							player.removeSkill('lgs_yonglan_discard');
						},
						sub:true,
					},
				},
			},
			"lgs_yinzhi":{
				enable:"chooseToUse",
				hiddenCard:function(player,name){
					return get.type(name)=='basic'||get.type(name)=='trick';
				},
				filter:function(event,player){
					if(event.responded) return false;
					if(player.countCards('he',{suit:'heart'})
					&&player.countCards('he',{suit:'diamond'})
					&&player.countCards('he',{suit:'club'})
					&&player.countCards('he',{suit:'spade'})){
						for(var i of lib.inpile)
							if(event.filterCard({name:i},player,event)) return true;
					}
					return false;
				},
				chooseButton:{
					dialog:function(event,player){
						var list=[];
						for(var i of lib.inpile){
							if(get.type(i)=='basic'&&event.filterCard({name:i},player,event)){
								list.push(['基本','',i]);
								if(i=='sha'){
									for(var j of lib.inpile_nature) list.push(['基本','','sha',j]);
								}
							}
							if(get.type(i)=='trick'&&event.filterCard({name:i},player,event)) list.push(['锦囊','',i]);
						}
						return ui.create.dialog('隐智',[list,'vcard'],'hidden')
					},
					check:function(button){
						var player=_status.event.player;
						if(button.link[2]=='shan'){
							if(player.hasSkill('lgs_yonglan')&&player!=_status.currentPhase)return 0;
							return 3;
						}
						if(button.link[2]=='wuxie'){
							if(player.hasSkill('lgs_yonglan')&&player!=_status.currentPhase)return (player.countCards('he')==4?3:0);
							return (player.countCards('he')>6?3:0);
						}
						if(button.link[2]=='jiu'){
							if(player.getUseValue({name:'jiu'})<=0) return 0;
							if(player.countCards('h','sha')) return player.getUseValue({name:'jiu'})/4;
						}
						if(button.link[2]=='tao'&&player.maxHp-player.hp==1) return 0;
						return player.getUseValue({name:button.link[2],nature:button.link[3]})/4;
					},
					backup:function(links,player){
						return {
							viewAs:{
								name:links[0][2],
								nature:links[0][3],
							},
							selectCard:4,
							filterCard:function(card,player,target){
								return !ui.selected.cards.filter(function(cardx){
									return get.suit(cardx,player)==get.suit(card,player);
								}).length;
							},
							complexCard:true,
							position:'he',
							popname:true,
							ai1:function(card){
								var player=_status.event.player,color=get.color(card,player);
								if(lib.skill.lgs_yinzhi_backup.viewAs.name=='jiu'&&!player.countCards('h',function(cardx){
									return card!=cardx&&!ui.selected.cards.contains(cardx)&&get.name(cardx,player)=='sha';
								})) return 0;
								return 10-get.value(card)-get.useful(card)+(card.name=='tao'?2:0)+(card.name=='shan'?3:0)+(card.name=='sha'?4:0);
							},
							precontent:function(){
								player.logSkill('lgs_yinzhi');
								event.result.card={
									name:event.result.card.name,
									nature:event.result.card.nature,
									cards:event.result.cards,
								};
							},
							onuse:function(links,player){
								var next=game.createEvent('lgs_yinzhi_recover',false,_status.event.getParent());
								next.player=player;
								next.setContent(function(){player.recover()});
							},
						}
					},
					prompt:function(links,player){
						return '将四张花色各不相同的牌当一张'+get.translation(links[0][3]||'')+get.translation(links[0][2])+'使用，然后回复一点体力';
					},
				},
				mod:{
					aiOrder:function(player,card,num){
						if(get.itemtype(card)!='card')return;
						if(card.name=='baiyin')return 12;
					},
				},
				ai:{
					order:function(item,player){
						if(player.hp==player.maxHp)
							return 1;
						return 11;
					},
					respondShan:true,
					respondSha:true,
					result:{
						player:function(player){
							if(_status.event.dying) return get.attitude(player,_status.event.dying);
							return 1;
						},
					},
				},
			},
			"lgs_guanglan":{
				trigger:{global:'phaseZhunbeiBegin'},
				filter:function(event,player){
					return event.player!=player&&event.player.countCards('h')>0;
				},
				check:function(event,player){
					if(player.hp<=1&&!player.countCards('h','jiu'))return false;
					var att=get.attitude(player,event.player),xNum=0,types=[];
					if(att==0) return false;
					for(var card of player.getCards('he'))
						if(!types.contains(get.type(card,'trick'))){
							types.push(get.type(card,'trick'));
							xNum++;
						}
					if(att<0)return xNum>1&&xNum>=event.player.countCards('h')-(player.hp>=3?2:1);
					if(att>0)return player.hasSkill('lgs_hairong')&&xNum;
				},
				logTarget:'player',
				content:function(){
					'step 0'
					event.time=get.utc();
					var target=trigger.player;
					if(player.countCards('h')>0){
						player.chooseButton(2,['用'+get.translation(target)+'手牌不包含的类别的一张牌交换其一张手牌，否则你摸一张牌并受到一点伤害',get.translation(target.name)+'的手牌',target.getCards('h'),'你的牌',player.getCards('he')]).set('ai',function(button){
							var player=_status.event.player,target=_status.currentPhase,card=button.link,owner=get.owner(card);
							if(get.attitude(player,target)>0)return -1;
							var hasTao=target.countCards('h','tao')>0;
							if(owner==player)return hasTao?(12-get.value(card)):(7-get.value(card));
							if(owner==target)return get.value(card)+get.useful(card)+(card.name=='tao'?3:0);
						}).set('filterButton',function(button){
							var target=_status.currentPhase;
							if(get.owner(button.link)!=target)
								for(var card of target.getCards('h'))
									if(get.type(button.link,'trick')==get.type(card,'trick'))return false;
							if(ui.selected.buttons.length==1)
								return get.owner(ui.selected.buttons[0].link)!=get.owner(button.link);
							return true;
						}).set('target',target);
					}
					else{
						player.chooseControl('ok').set('dialog',[get.translation(target)+'的手牌',target.getCards('h')]);
						event.goto(2);
					}
					'step 1'
					var time=1000-(get.utc()-event.time);
					if(time>0){
						game.delay(0,time);
					}
					var target=trigger.player;
					if(result.bool){
						if(get.owner(result.links[0])==player){
							event.cardp=result.links[0];
							event.cardt=result.links[1];
						}
						else{
							event.cardp=result.links[1];
							event.cardt=result.links[0];
						}
						player.$giveAuto(event.cardp,target);
						target.gain(event.cardp,player);
						target.give(event.cardt,player);
						event.finish();
					}
					'step 2'
					player.draw();
					'step 3'
					player.damage('nosource');
				},
				ai:{
					threaten:1.1,
				},
				mod:{
					aiValue:function(player,card,num){
						if(get.name(card)!='tao') return;
						var cards=player.getCards('hs',function(card){
							return get.name(card)=='tao'||get.color(card)=='black';
						});
						var geti=function(){
							if(cards.contains(card)){
								return cards.indexOf(card);
							}
							return cards.length;
						};
						return Math.max(num,[7,6,5][Math.min(geti(),2)]);
					},
					aiUseful:function(){
						return lib.skill.lgs_guanglan.mod.aiValue.apply(this,arguments);
					},
				},
			},
			"lgs_hairong":{
				trigger:{player:'damageEnd'},
				filter:function(event,player){
					return event.num>0;
				},
				direct:true,
				content:function(){
					'step 0'
					var types=[]
					for(var card of player.getCards('h'))
						if(!types.contains(get.type(card,'trick')))
							types.push(get.type(card,'trick'));
					event.X=types.length;
					player.chooseControl(['摸1张牌', '令'+get.translation(_status.currentPhase)+'摸'+event.X+'张牌', 'cancel']).set('ai',function(){
						var player=_status.event.player,target=_status.currentPhase,evt=_status.event.getParent()
						if(get.attitude(player,target)<=0)return 0;
						if(evt.X<=1)return 0;
						// if(evt.X==1)return (get.attitude(player,target)>1?1:0);
						return 1;
					}).set('prompt','海容：令你或'+get.translation(_status.currentPhase)+'摸牌');
					'step 1'
					if(result.control!='cancel') {
						if(result.control=='摸1张牌'){
							player.logSkill('lgs_hairong');
							player.draw();
						}
						else{
							player.logSkill('lgs_hairong',_status.currentPhase);
							_status.currentPhase.draw(event.X);
							player.addTempSkill('lgs_hairong_reduce');
						}
					}
				},
				// check:function(event,player){
					// if(get.attitude(player,_status.currentPhase)>0) return true;
					// var types=[],cards=player.getCards('h');
					// for(var card of cards)
						// if(!types.contains(get.type(card,'trick')))types.push(get.type(card,'trick'));
					// return types.length<=1&&_status.currentPhase.countCards('h')>7;
				// },
				ai:{
					pretao:true,
				},
				subSkill:{
					reduce:{
						mark:true,
						intro:{
							mark:function(dialog,content,player){
								var types=[];
								for(var card of player.getCards('h'))
									if(!types.contains(get.type(card,'trick')))
										types.push(get.type(card,'trick'));
								dialog.addText('成为<span class="yellowtext">'+get.translation(_status.currentPhase)+'</span>的牌的目标时，可以为此牌减少至多<span class="bluetext">'+types.length+'</span>个目标');
							},
						},
						trigger:{target:'useCardToTarget'},
						filter:function(event,player){
							return event.player==_status.currentPhase&&event.targets&&event.targets.contains(player)&&player.countCards('h');
						},
						direct:true,
						popup:false,
						content:function(){
							'step 0'
							var xNum=0,types=[];
							for(var card of player.getCards('h'))
								if(!types.contains(get.type(card,'trick'))){
									types.push(get.type(card,'trick'));
									xNum++;
								}
							player.chooseTarget('海容：为'+get.translation(trigger.card)+'减少'+(xNum==1?'':'至多')+xNum+'个目标',[1,xNum],function(card,player,target){
								return _status.event.targets.contains(target);
							}).set('ai',function(target){
								var trigger=_status.event.getTrigger();
								return -get.effect(target,trigger.card,trigger.player,_status.event.player);
							}).set('targets',trigger.targets);
							'step 1'
							if(result.bool){
								// if(!event.isMine()&&!event.isOnline()) game.delayx();
								player.logSkill('lgs_hairong',result.targets);
								trigger.getParent().excluded.addArray(result.targets);
							}
						},
						ai:{
							effect:{
								target:function(card,player,target,current){
									if(typeof card=='string') return;
									if(card.lgs_hairong_copy) return;
									var cardx=get.copyBySkill(card,'lgs_hairong');
									if(get.effect(target,cardx,player,target)<0)
										return 'zerotarget';
								},
							},
						},
					},
				}, // end subSkill
			},
			"lgs_kubi_wuxie":{
				trigger:{player:['chooseToUseBegin','chooseToRespondBegin']},
				filter:function(event,player){
					return event.type=='wuxie'&&!player.countCards('h','wuxie')&&!player.hasSkill('lgs_kubi_block');
				},
				direct:true,
				content:function(){
					'step 0'
					player.chooseButton(["苦逼:选择一种牌并摸1张牌，若摸的牌不是此牌则翻面",[[['锦囊','','wuxie']],'vcard']]).set('ai',function(){
						if(_status.currentPhase.next!=player||player.isTurnedOver()) return 1;
						return 0;
					});
					'step 1'
					if(result.bool){
						player.logSkill('lgs_kubi');
						player.addTempSkill('lgs_kubi_block');
						player.draw();
					}else
						event.finish();
					'step 2'
					if(result[0].name!='wuxie')
						player.turnOver();
				},
				ai:{
					noautowuxie:true,
					skillTagFilter:function(player,tag,arg){
						return !player.hasSkill('lgs_kubi_block');
					},
				},
			},
			"lgs_kubi":{
				locked:false,
				enable:['chooseToUse','chooseToRespond'],
				// trigger:{player:['chooseToUseBegin','chooseToRespondBegin']},
				filter:function(event,player){
					if(player.hasSkill('lgs_kubi_block')||event.type=='wuxie') return false;
					for(var i of lib.inpile){
						if(event.filterCard({name:i},player,event)&&(lib.card[i].notarget||player.hasUseTarget({name:i}))&&!player.countCards('h',i)){
							return true;
						}
					}
					return false;
				},
				log:false,
				delay:false,
				content:function(){
					'step 0'
					var evt=event.getParent(2)
					evt.goto(0);
					var list=[]
					for(var i of lib.inpile){
						if(evt.filterCard({name:i},player,evt)&&(lib.card[i].notarget||player.hasUseTarget({name:i}))){
							switch(get.type(i)){
								case 'basic':
									list.push(['基本','',i]);break;
								case 'trick':case 'delay':
									list.push(['锦囊','',i]);break;
								case 'equip':
									list.push(['装备','',i]);break;
							}
						} 
					}
					player.chooseButton(["苦逼:选择一种牌并摸1张牌，若摸的牌不是此牌则翻面",[list,'vcard']]).set('filterButton',function(button){
						return !player.countCards('h',button.link[2]);
					}).set('ai',function(button){
						var player=_status.event.player
						if(player.isTurnedOver()){
							if(button.link[2]=='renwang') return 3;
							if(get.type(button.link[2])=='equip') return 2;
							return 1;
						}else{
							if(button.link[2]=='sha') return 2;
							return 1;
						}
					});
					'step 1'
					if(result.bool){
						player.logSkill('lgs_kubi');
						player.addTempSkill('lgs_kubi_block');
						event.cardname=result.links[0][2];
						player.draw();
					}else
						event.finish();
					'step 2'
					if(result[0].name!=event.cardname)
						player.turnOver();
				},
				hiddenCard:function(player,name){
					return !player.hasSkill('lgs_kubi_block');
				},
				mod:{
					maxHandcard:function(player,num){
						return num+(player.isTurnedOver()?3:0);
					},
				},
				ai:{
					order:11,
					result:{
						player:function(player,target){
							game.log('lgs_kubi-result');
							game.log(player.isTurnedOver(),_status.currentPhase.next);
							if(_status.currentPhase.next!=player||player.isTurnedOver()) return 1;
							return 0;
						},
					},
					threaten:2,
					respondSha:true,
					respondShan:true,
					skillTagFilter:function(player,tag,arg){
						return !player.hasSkill('lgs_kubi_block');
					},
				},
				group:'lgs_kubi_wuxie',
				subSkill:{
					block:{charlotte:true},
				},
			},
			"lgs_tiewan":{
				trigger:{player:'phaseZhunbeiBegin'},
				check:function(event,player){
					var shas=Math.min(player.getCardUsable('sha'),player.countCards('h','sha',function(card){
						return player.hasValueTarget(card);
					})),bonus=0,muniu=player.getEquip('muniu');
					if(player.countCards('he','zhuge'))shas=player.countCards('h','sha',function(card){
						return player.hasValueTarget(card);
					});
					var cans=player.countCards('h',function(card){
						return get.type(card,'trick')!='equip'&&card.name!='sha'&&player.hasValueTarget(card);
					});
					if(muniu)bonus++;
					if(player.countCards('h','shan'))bonus--;
					bonus-=player.countCards('h','tao')*player.getDamagedHp();
					return 2.5+(player.hp-shas-cans)+bonus;
				},
				content:function(){
					'step 0'
					player.addTempSkill('lgs_tiewan_buff');
					player.addTempSkill('lgs_tiewan_debuff');
				},
				ai:{
					threaten:1.5,
				},
				subSkill:{
					buff:{
						trigger:{player:'useCardToPlayered'},
						filter:function(event,player){
							if(event.getParent().triggeredTargets3.length>1) return false;
							return get.type(event.card,'trick')!='equip';
						},
						content:function(){
							'step 0'
							if(trigger.targets.length==1)
								player.chooseBool('是否发动【铁腕】，令'+get.translation(trigger.targets[0])+'本回合不能使用或打出'+get.translation(get.color(trigger.card,player))+'牌，然后对其造成一点伤害？').set('ai',function(){
									var trigger=_status.event.getTrigger();
									return get.attitude(trigger.player,trigger.targets[0])<=0;
								});
							else
								player.chooseTarget('是否发动【铁腕】，令其中一名目标本回合不能使用或打出'+get.translation(get.color(trigger.card,player))+'牌，然后对其造成一点伤害？',function(card,player,target){
									return trigger.targets.contains(target);
								}).set('ai',function(target){
									var player=_status.event.player;
									return get.damageEffect(target,player,player);
								});
							'step 1'
							if(result.bool){
								var target=(trigger.targets.length==1?trigger.targets[0]:result.targets[0]);
								player.logSkill('lgs_tiewan',target);
								target.addTempSkill('lgs_tiewan_block');
								if(!target.storage.lgs_tiewan_block.contains(get.color(trigger.card,player)))
									target.storage.lgs_tiewan_block.push(get.color(trigger.card,player));
								target.damage();	
							}
							else event.finish();
							'step 2'
							game.delayx();
						},
						ai:{
							directHit_ai:true,
							skillTagFilter:function(player,tag,arg){
								if(['sha','wanjian'].contains(arg.card.name)&&get.color(arg.card,player)=='red'&&!arg.target.hasSkillTag('respondShan'))return true;
								return false;
							},
						},
						sub:true,
					},
					debuff:{
						mark:true,
						intro:{
							markcount:()=>0,
							content:'本回合出牌阶段最多使用1张非装备牌',
						},
						init:function(player){
							player.storage.lgs_tiewan_debuff=0;
						},
						trigger:{player:['useCard1','phaseUseAfter']},
						forced:true,
						popup:false,
						silent:true,
						firstDo:true,
						filter:function(event,player){
							if(event.name=='phaseUse')
								return player.countMark('lgs_tiewan_debuff');
							return get.type(event.card,'trick')!='equip'&&player.isPhaseUsing();
						},
						content:function(){
							if(trigger.name=='phaseUse')
								player.removeMark('lgs_tiewan_debuff',player.countMark('lgs_tiewan_debuff'),false);
							else
								player.addMark('lgs_tiewan_debuff',1,false);
						},
						onremove:function(player){
							player.unmarkSkill('lgs_tiewan_debuff');
							delete player.storage.lgs_tiewan_debuff;
						},
						mod:{
							cardEnabled:function(card,player){
								if(player.isPhaseUsing()&&player.countMark('lgs_tiewan_debuff')&&get.type(card,'trick')!='equip') return false;
							},
							cardUsable:function(card,player){
								if(player.isPhaseUsing()&&player.countMark('lgs_tiewan_debuff')&&get.type(card,'trick')!='equip') return false;
							},
							aiOrder:function(player,card,num){
								if(get.itemtype(card)!='card') return;
								if(get.type(card,'trick')=='equip'&&get.subtype(card)=='equip1'&&card.name!='zhuge') return num+999;
								if(card.name=='sha'&&get.color(card,player)=='red'||card.name=='wanjian'||card.name=='juedou'&&get.color(card,player)=='black')return num+99;
								return num+player.getUseValue(card);
							},
						},
					},
					block:{
						mark:true,
						init:function(player){
							player.storage.lgs_tiewan_block=[];
						},
						intro:{
							markcount:()=>0,
							content:function(storage,player){
								var color=(storage.length==1?get.translation(storage[0]):'红色和黑色');
								return '本回合不能使用或打出'+color+'牌';
							},
						},
						charlotte:true,
						onremove:true,
						mod:{
							cardEnabled2:function(card,player){
								if(get.itemtype(card)=='card'&&player.getStorage('lgs_tiewan_block').contains(get.color(card))) return false;
							},
						},
						sub:true,
					},
				},
			},
			"lgs_tianle":{
				trigger:{target:'useCardToTarget'},
				usable:1,
				filter:function(event,player){
					return event.player!=player&&!event.excluded.contains(player);
				},
				check:function(event,player){
					if(get.attitude(player,event.player)>0)return get.effect(player,event.card,event.player,player)<1.5;
					return get.effect(player,event.card,event.player,player)<0;
				},
				content:function(){
					'step 0'
					player.draw('visible');
					'step 1'
					event.card=result[0];
					player.judge(function(card){
						var player=_status.event.player;
						if(get.color(card,player)==get.color(_status.event.getParent().card,player)) return 2;
						return 0;
					}).judge2=function(result){
						return result.bool?true:false;
					};
					'step 2'
					if(result.bool){
						trigger.excluded.add(player);
					}
				},
				ai:{
					effect:{
						target:function(card,player,target,current){
							if(typeof card=='string') return;
							if(card.lgs_tianle_copy) return;
							if(target.hasSkill('counttrigger')&&target.storage.counttrigger.lgs_tianle>=1) return [1,0];
							var cardx=get.copyBySkill(card,'lgs_tianle');
							if(player!=target&&get.effect(target,cardx,player,target)<0) return [1,1];
						},
					},
				},
			},
			"lgs_jieyou":{
				trigger:{global:'phaseUseBegin'},
				filter:function(event,player){
					return player!=event.player&&player.isAlive()&&event.player.isAlive()&&player.countCards('he')>=event.player.hp;
				},
				direct:true,
				content:function(){
					'step 0'
					player.chooseCard('he',trigger.player.hp).set('ai',function(card){
						var player=_status.event.player,target=_status.event.getTrigger().player;
						if(get.attitude(player,target)<=0)return -1;
						var shas=player.getCards('h','sha',function(card){
							return target.hasValueTarget(card);
						}),temp=[];
						if(!ui.selected.cards.filter(function(card){
							return card.name=='zhuge';
						})){
							for(var i=0;i<Math.min(shas.length,player.getCardUsable('sha'));i++)
								temp.push(shas[i]);
							shas=temp;
						}
						var cans=player.getCards('he',function(card){
							return card.name!='sha'&&target.hasValueTarget(card);
						});
						if(target.hp>=3&&(shas.length+cans.length)-target.hp<=1)return false;
						return shas.concat(cans).contains(card)?target.getUseValue(card):-1;
					}).set('prompt','是否发动【解忧】，将'+trigger.player.hp+'张牌交给'+get.translation(trigger.player)+'？');
					'step 1'
					if(result.bool){
						var target=trigger.player;
						player.logSkill('lgs_jieyou',target);
						target.storage.lgs_jieyou_given=result.cards;
						target.storage.lgs_jieyou_source=player;
						target.gain(result.cards,player,'give').gaintag.add('lgs_jieyou');
						target.addTempSkill('lgs_jieyou_use','phaseUseAfter');
					}
				},
				group:['lgs_jieyou_lose'],
				subSkill:{
					use:{
						init:function(player){
							player.storage.lgs_jieyou_used=[];
						},
						mark:true,
						intro:{
							name:'解忧',
							markcount:()=>0,
							mark:function(dialog,content,player){
								dialog.addText('使用全部的【解忧】牌后，回复一点体力');
								var source=player.storage.lgs_jieyou_source;
								if(player==game.me||player.isUnderControl()||source==game.me||source.isUnderControl()){
									dialog.addText('获得牌：');
									dialog.add(player.storage.lgs_jieyou_given);
									dialog.addText('已使用牌：');
									if(player.storage.lgs_jieyou_used.length)
										dialog.add(player.storage.lgs_jieyou_used);
								}
							},
						},
						trigger:{player:'useCardAfter'},
						forced:true,
						popup:false,
						silent:true,
						filter:function(event,player){
							return player.hasHistory('lose',function(evt){
								if(evt.getParent()!=event) return false;
								for(var i in evt.gaintag_map){
									if(evt.gaintag_map[i].contains('lgs_jieyou')) return true;
								}
								return false;
							});
						},
						content:function(){
							player.storage.lgs_jieyou_used.push(trigger.cards[0]);
							if(player.storage.lgs_jieyou_used.length==player.storage.lgs_jieyou_given.length){
								player.storage.lgs_jieyou_source.logSkill('lgs_jieyou',player);
								player.recover(1,player.storage.lgs_jieyou_source);
								player.removeSkill('lgs_jieyou_use');
							}
						},
						onremove:function(player){
							delete player.storage.lgs_jieyou_used;
							delete player.storage.lgs_jieyou_given;
							delete player.storage.lgs_jieyou_source;
						},
						mod:{
							aiOrder:function(player,card,num){
								if(get.itemtype(card)=='card'&&card.hasGaintag('lgs_jieyou'))return num+10;
							},
						},
						// ai:{
							// effect:{
								// player:function(card,player,target){
									// game.log('effect-player');
									// if(card){
										// game.log('card:'+card.name);
										// game.log('position:'+get.position(card))
									// }
									// if(get.position(card)=='h'&&card.hasGaintag('lgs_jieyou')){
										// game.log('in');
										// return [1,1.5];
									// }
								// },
							// },
						// },
					},
					lose:{
						trigger:{global:'phaseUseEnd'},
						filter:function(event,player){
							return event.player.hasSkill('lgs_jieyou_use');
						},
						forced:true,
						content:function(){
							trigger.player.removeGaintag('lgs_jieyou');
							player.loseHp();
						},
						sub:true,
					},
				},
			},
			"lgs_zhiyong":{
				enable:['chooseToUse','chooseToRespond'],
				filterCard:true,
				selectCard:-1,
				position:'h',
				filter:function(event,player){
					if(player.hasSkill('lgs_zhiyong_block')) return false;
					var hs=player.getCards('h');
					if(!hs.length) return false;
					for(var i=0;i<hs.length;i++){
						var mod2=game.checkMod(hs[i],player,'unchanged','cardEnabled2',player);
						if(!mod2) return false;
					}
					return true;
				},
				viewAs:{name:'sha'},
				ai:{
					pretao:true,
					damage:true,
					order:function(item,player){
						game.log('zhiyong-order');
						if(_status.event.name=='chooseToRespond'){
							game.log('zhiyong-in-chooseToRespond');
							if(player.countCards('h')==1&&player.countCards('h','sha')==1) return get.order({name:'sha'})+0.4;
							return get.order({name:'sha'})-0.4;
						}
						if(player.countCards('he','zhuge')||player.getCardUsable('sha')>1) return 0.1;
						return get.order({name:'sha'})+0.4;
					},
					effect:{
						player:function(card,player,target){
							if(_status.event.skill=='lgs_zhiyong'){
								// if(_status.event.name=='chooseToRespond'){
									// game.log('res');
									// if(player.countCards('h')==1) return 1;
									// if(player.countCards('h','tao')) return -1;
									// if(player.hp==1&&!player.countCards('h','sha')&&!player.countCards('h','jiu')&&!player.countCards('h','wuxie')) return 1;
									// if(player.countCards('h')>2) return -1;
									// return 1;
								// }
								if(player.hasSkillTag('directHit_ai',true,{
									target:target,
									card:card,
								},true)) return [1,1.5];
								if(player.countCards('h')>3&&target.countCards('h')>2) return 'zeroplayertarget';
								if(player.countCards('h','tao')+player.countCards('h','wuxie')>1) return 'zeroplayertarget';
								if(player.countCards('h')<=2) return;
								if(target.countCards('h')==0&&!target.hasSkillTag('respondShan')) return [1,player.countCards('h')+1];
								return [1,3-target.countCards('h')];
							}
						}
					}
				},
				group:['lgs_zhiyong_draw','lgs_zhiyong_gain'],
				subSkill:{
					draw:{
						trigger:{player:['useCardAfter','respondAfter']},
						filter:function(event,player){
							if(event.skill!='lgs_zhiyong')return false;
							return player.getHistory('sourceDamage',function(evt){
								return evt.card==event.card;
							}).length;
						},
						forced:true,
						content:function(){
							player.addTempSkill('lgs_zhiyong_block');
							player.draw(trigger.cards.length+1);
						},
						sub:true,
					},
					gain:{
						trigger:{player:['useCardAfter','respondAfter']},
						filter:function(event,player){
							if(event.skill!='lgs_zhiyong')return false;
							return player.getHistory('sourceDamage',function(evt){
								return evt.card==event.card;
							}).length==0;
						},
						forced:true,
						popup:false,
						silent:true,
						content:function(){
							'step 0'
							event.shans=[];
							game.countPlayer2(function(current){
								current.getHistory('useCard',function(evt){
									if(evt.card.name=='shan'&&evt.getParent(3)==trigger) event.shans.addArray(evt.cards.filterInD('od'));
								});
							});
							
							event.resp=[];
							if(trigger.respondTo){
								if(get.itemtype(trigger.respondTo[1])=='card') event.resp.push(trigger.respondTo[1]);
								else if(trigger.respondTo[1].cards) event.resp.addArray(trigger.respondTo[1].cards);
							}
							event.resp=event.resp.filterInD('od').filter(function(cardx){
								return !trigger.cards.contains(cardx);
							});
							
							var choice1='',choice2='';
							if(event.shans.length&&event.resp.length){
								choice1=get.translation(event.shans);
								choice2=get.translation(event.resp);
								player.chooseControl(choice1,choice2).set('prompt','智勇：请选择要获得的牌');
							}else if(event.shans.length){
								event.cards=event.shans;
								event.goto(2);
							}else if(event.resp.length>0){
								game.delayx();
								event.cards=event.resp;
								event.goto(2);
							}else{
								event.finish();
							}
							'step 1'
							if(result.index)event.cards=event.resp;
							else event.cards=event.shans;
							'step 2'
							player.logSkill('lgs_zhiyong');
							player.gain(event.cards,'gain2','log');
						},
						sub:true,
					},
					block:{charlotte:true},
				},
			},
			"lgs_linyi":{
				limited:true,
				skillAnimation:true,
				animateColor:"grey",
				trigger:{player:'phaseJieshuBegin'},
				filter:function(event,player){
					return player.maxHp>1;
				},
				check:function(event,player){
					var zhu=(player.isZhu?3:1.5);
					var effect=-zhu*player.hp-player.countCards('h','tao');
					game.countPlayer(function(current){
						if(get.attitude(player,current)>5)
							effect+=Math.max(0,3-current.hp)+0.4*Math.max(0,3-current.countCards('h'));
						else if(get.attitude(player,current)>0)
							effect+=0.5*Math.max(0,3-current.hp)+0.2*Math.max(0,3-current.countCards('h'));
					});
					game.log('linyi-ai:',effect);
					return effect>0;
				},
				content:function(){
					'step 0'
					event.X=player.maxHp-1;
					player.loseMaxHp(event.X);
					'step 1'
					player.chooseTarget('令1'+(event.X>1?'至'+event.X:'')+'名角色'+(event.X>1?'各':'')+'获得两点护甲',[1,event.X],true).set('ai',function(target){
						var player=_status.event.player
						if(get.attitude(player,target)<=0) return get.attitude(player,target)*target.hp;
						return 99-player.hp;
					});
					'step 2'
					event.targets=result.targets
					player.line(event.targets);
					player.addSkill('lgs_linyi_clear');
					'step 3'
					event.targets.shift().changeHujia(2);
					if(event.targets.length)
						event.redo();
					'step 4'
					player.awakenSkill('lgs_linyi');
				},
				ai:{
					expose:0.3,
				},
				subSkill:{
					clear:{
						charlotte:true,
						trigger:{player:'die'},
						filter:true,
						forceDie:true,
						direct:true,
						content:function(){
							'step 0'
							event.targets=game.filterPlayer();
							player.logSkill('lgs_linyi_clear');
							player.line(event.targets);
							player.$fullscreenpop('忠信死节','fire');
							game.delay(2);
							'step 1'
							player.$fullscreenpop('大义不惜','fire');
							game.delayx();
							'step 2'
							var target=event.targets.shift()
							target.changeHujia(-target.hujia);
							if(event.targets.length)
								event.redo();
						},
						ai:{
							threaten:2,
						},
					},
				},
			},
			"lgs_miaokou":{
				init:function(player){
					player.storage.lgs_miaokou_card=NaN;
					if(ui.discardPile.childNodes.length)
						player.storage.lgs_miaokou_card=ui.discardPile.childNodes[ui.discardPile.childNodes.length-1];
				},
				mark:true,
				marktext:'妙口',
				intro:{
					name:'妙口',
					markcount:()=>0,
					mark:function(dialog,content,player){
						if(!player.storage.lgs_miaokou_card) 
							dialog.addText('当前弃牌堆无牌');
						else{
							dialog.addText('弃牌堆顶的牌：');
							dialog.addSmall([player.storage.lgs_miaokou_card]);
						}
					},
				},
				trigger:{player:["useCard","respond"]},
				filter:function(event,player){
					var card=player.storage.lgs_miaokou_card;
					if(!card) return false;
					return event.card.suit&&event.card.suit==card.suit||event.card.number&&event.card.number==card.number;
				},
				frequent:true,
				content:function(){
					player.draw();
				},
				mod:{
					aiOrder:function(player,card,num){
						if(typeof card=='object'){
							var cd=player.storage.lgs_miaokou_card;
							if(cd&&(get.suit(cd)&&get.suit(cd)==get.suit(card)||cd.number&&cd.number==get.number(card))){
								return num+10;
							}
						}
					},
				},
				group:'lgs_miaokou_update',
				subSkill:{
					update:{
						charlotte:true,
						init:function(player){
							lib.onwash.push(lib.skill.lgs_miaokou_update.onWash);
						},
						trigger:{
							global:['loseAfter','cardsDiscardAfter'],
						}, // 'loseAsyncAfter',
						firstDo:true,
						forced:true,
						popup:false,
						silent:true,
						content:function(){
							if(ui.discardPile.childNodes.length)
								player.storage.lgs_miaokou_card=ui.discardPile.childNodes[ui.discardPile.childNodes.length-1];
							else
								player.storage.lgs_miaokou_card=NaN;
							var card=player.storage.lgs_miaokou_card;
							if(player.marks.lgs_miaokou&&player.marks.lgs_miaokou.childNodes.length)
								player.marks.lgs_miaokou.childNodes[0].innerHTML='妙口'+(card?(get.translation(card.suit)+get.strNumber(card.number)):'');
							// lib.translate.lgs_miaokou_bg='妙口'+(card?(get.translation(card.suit)+get.strNumber(card.number)):'');
							// // game.log(lib.skill.lgs_miaokou.marktext);
							// game.log(lib.translate.lgs_miaokou_bg);
							// game.broadcastAll(function(card){
								// lib.translate.lgs_miaokou_bg='妙口'+(card?(get.translation(card.suit)+get.strNumber(card.number)):'');
							// },card);
							// player.unmarkSkill('lgs_miaokou');
							// player.markSkill('lgs_miaokou');
						},
						onremove:function(player){
							lib.onwash.remove(lib.skill.lgs_miaokou_update.onWash);
						},
						onWash:function(){
							_status.event.player.storage.lgs_miaokou_card=NaN;
						},
						sub:true,
					},
				},
			},
			"lgs_qiezhu":{
				enable:'phaseUse',
				filter:function(event,player){
					if(player.countCards('he',function(card){
						return get.subtype(card)=='equip1';
					})) return true;
					if(player.countCards('h','sha')&&game.hasPlayer(function(current){
						return player.canUse({name:'jiedao',isCard:true},current,null,true);
					}))	return true;
					return false;
				},
				filterCard:function(card,player){
					return card.name=='sha'&&game.hasPlayer(function(current){
						return player.canUse({name:'jiedao',isCard:true},current,null,true);
					})||get.subtype(card)=='equip1';
				},
				position:'he',
				filterTarget:function(card,player,target){
					if(!ui.selected.targets.length){
						if(target==player) return false;
						if(card.name=='sha') return player.canUse({name:'jiedao',isCard:true},target,null,true);
						return true;
					}else
						return ui.selected.targets[0].inRange(target)&&ui.selected.targets[0].canUse('sha',target,false);
				},
				selectTarget:function(){
					if(ui.selected.cards.length&&ui.selected.cards[0].name=='sha') return [2,2];
					return [1,1];
				},
				// complexSelect:true,  // 不可通过再次点击技能按钮取消
				multitarget:true,
				// line:false,
				targetprompt:['被借刀','出杀目标'],
				// filterAddedTarget:function(card,player,target,preTarget){
					// return target!=preTarget&&preTarget.inRange(target)&&preTarget.canUse('sha',target,false);
				// },
				discard:false,
				lose:false,
				delay:false,
				content:function(){
					'step 0'
					event.target=event.targets[0];
					player.give(cards,targets[0],'visible');
					'step 1'
					if(get.subtype(cards[0])=='equip1'){
						var sha=get.discardPile(function(card){
							return card.name=='sha';
						});
						if(sha) target.gain(sha,'gain2');
					}else{
						player.useCard({name:'jiedao',isCard:true},target).set('addedTarget',event.targets[1]).set('addedTargets',[event.targets[1]]).set('line',false);
					}
					'step 2'
					game.updateRoundNumber();
				},
				check:function(card){
					var player=_status.currentPhase;
					if(get.subtype(card)=='equip1'){
						if(player.countCards('he',{subtype:'equip1'})>1){
							return 11-get.equipValue(card);
						}
						return 6-get.value(card);
					}
					return 11-get.value(card);
				},
				ai:{
					order:function(item,player){
						return get.order({name:'sha'})-0.1;
					},
					result:{
						player:function(player,target){
							if(!ui.selected.cards.length) return 0;
							var card=ui.selected.cards[0],shaTargets=[],effect=-100,mvTarget=player;
							if(card.name=='sha'){
								if(ui.selected.targets.length==0){
									if(get.attitude(player,target)>0){
										return 0;
									}else{
										return get.value(target.getEquip(1));
										// pass
									}
								}else{
									return 0;
								}
							}else{
								if(player.countCards('he',{subtype:'equip1'})>1) return -0.5;
								return -1.2;
							}
						},
						target:function(player,target){
							if(!ui.selected.cards.length) return 0;
							var card=ui.selected.cards[0],shaTargets=[],effect=-100,mvTarget=player;
							if(card.name=='sha'){
								if(ui.selected.targets.length==0){
									if(get.attitude(player,target)>0){
										shaTargets=game.filterPlayer(function(current){
											return target.canUse(card,current);
										});
										for(var tg of shaTargets)
											if(get.effect(target,card,tg,tg)>effect)
												effect=get.effect(target,card,tg,tg);
										return effect;
									}else{
										return get.value(card);
									}
								}else{
									return get.effect(ui.selected.targets[0],card,target,ui.selected.targets[0]);
								}
							}else{
								if(target.countCards('e',{subtype:'equip1'})) return 1;
								return 2;
							}
						},
					},
				},
			},
			"lgs_woxun":{
				dutySkill:true,
				marktext:'影',
				intro:{
					content:'expansion',
					markcount:'expansion',
				},
				trigger:{
					player:['phaseZhunbeiBegin','phaseJieshuEnd','damage','enterGame'],
					source:'damageSource',
				},
				direct:true,
				content:function(){
					var card=get.cards()[0];
					player.addToExpansion(card,player,'gain2').gaintag.add('lgs_woxun');
				},
				onremove:function(player){
					player.loseToDiscardpile(player.getExpansions('lgs_woxun'));
				},
				derivation:'lgs_dingchou',
				group:['lgs_woxun_exchange','lgs_woxun_achieve','lgs_woxun_fail'],
				subSkill:{
					exchange:{
						trigger:{player:['useCard','respond']},
						filter:function(event,player){
							return player.countCards('he')&&player.getExpansions('lgs_woxun').length
							&&player.getHistory('useCard').length+player.getHistory('respond').length==1;
						},
						direct:true,
						content:function(){
							'step 0'
							game.delay(0.5);
							player.chooseButton(2,['是否用一张牌交换一张“影”？','你的“影”',player.getExpansions('lgs_woxun'),'你的牌',player.getCards('he')]).set('ai',function(button){
								var player=_status.event.player;
								var yings=player.getExpansions('lgs_woxun'),he=player.getCards(he);
								// 统计当前“影”库的信息
								var info={heart:0,diamond:0,spade:0,club:0,basic:0,trick:0,equip:0},names=[];
								for(var ying of yings){
									info[get.suit(ying)]++;
									info[get.type(ying,'trick')]++;
									var hasName=false;
									for(var aName of names){
										if(aName.name==ying.name) {
											aName.num++;
											hasName=true;
										}
									}
									if(!hasName) names.push({name:ying.name,num:1});
								}
								// 遍历所有交换组合，计算交换价值
								var pairs=[],values=[],len=yings.length;
								for(var ying of yings){
									for(var card of he){
										var value=0
										// “影”牌库中花色/类型完备性
										//     破坏花色/类型完备性的交换价值更低
										if(info[ying.suit]==1&&info[card.suit]>0) value-=len+1;
										if(info[get.type(ying,'trick')]==1&&info[get.type(ying,'trick')]>0) value-=len;
										//     增加花色/类型完备性的交换价值更高
										if(info[ying.suit]>1&&info[card.suit]==0) value+=len-1;
										if(info[get.type(ying,'trick')]>1&&info[get.type(ying,'trick')]==0) value+=Math.max(len-2,0);
										// “影”库中的牌名信息
										var i=0,yingMax=false;
										if(len>4&&names.length>1){
											names.sort(function(a,b){return b.num-a.num;});
											while(i+1<names.length&&names[i].num==names[i+1].num) i++;
											// 觉醒成功概率大的牌名放入“影”库的价值更高
											for(var j=0;j<=i;j++){
												if(card.name==names[i].name&&ying.name!=names[i].name) value+=2;
												if(ying.name==names[i].name) yingMax=true;
											}
											// 导致并列第一的交换价值更低
											if(i+1<names.length&&names[i+1].num==names[i].num-1&&card.name==names[i+1].name&&!yingMax) value-=2;
										}
										// 牌本身的价值
										if(player==_status.currentPhase) value+=get.useful(ying)+0.5*get.value(ying)-get.useful(card)-0.5*get.value(card);
										else value+=get.value(ying)-get.value(card);
										//
										if(value>0){
											pairs.push([ying,card]);
											values.push(value);
										}
									}
								}
								if(!pairs.length) return -1;
								var mv=0,mvIndex=-1;
								for(var i=0;i<pairs.length;i++){
									if(values[i]>mv){
										mv=values[i];
										mvIndex=i;
									}
								}
								if(pairs[mvIndex].contains(button.link)) return 1;
								return -1;
							}).set('filterButton',function(button){
								if(!ui.selected.buttons.length)return true;
								if(get.position(ui.selected.buttons[0].link)=='x') return get.position(button.link)!='x';
								return get.position(button.link)=='x';
							});
							'step 1'
							if(result.bool){
								var cd=result.links[0],ying=result.links[1];
								if(get.position(result.links[0])=='x'){
									cd=result.links[1];
									ying=result.links[0];
								}
								player.addToExpansion(cd,'give',player).gaintag.add('lgs_woxun');
								player.gain(ying,'gain2');
							}
						},
					},
					achieve:{
						trigger:{player:'phaseUseBegin'},
						forced:true,
						skillAnimation:true,
						animationColor:'metal',
						filter:function(event,player){
							var ying=player.getExpansions('lgs_woxun');
							if(ying.length<8) return false;
							var suits=['club','spade','heart','diamond'],types=['basic','trick','equip'];
							for(var i=0;i<ying.length;i++){
								suits.remove(get.suit(ying[i]));
								types.remove(get.type(ying[i],'trick'));
							}
							if(suits.length) game.log('我寻缺少花色：',suits);
							if(suits.length) game.log('我寻缺少类型：',types);
							if(suits.length||types.length) return false;
							var ying=player.getExpansions('lgs_woxun'),names=[],nums=[];
							for(var card of ying){
								if(!names.contains(card.name)){
									
									names.push(card.name);
									var num=ying.filter(function(cardx){
										return cardx.name==card.name;
									}).length
									game.log(card.name,'数量',num);
									nums.push(num);
								}
							}
							game.log(nums);
							nums.sort(function(a,b){
								return a<b;
							});
							if(nums[0]==nums[1]) game.log('我寻并列最多：',nums[0],'张');
							else game.log('可觉醒');
							return nums[0]!=nums[1];
						},
						content:function(){
							var ying=player.getExpansions('lgs_woxun'),names=[],nums=[];
							for(var card of ying){
								if(!names.contains(card.name)){
									names.push(card.name);
									nums.push(ying.filter(function(cardx){
										return cardx.name==card.name;
									}).length);
								}
							}
							var maxV=nums[0],maxI=0;
							for(var i in nums){
								if(nums[i]>maxV){
									maxV=nums[i];
									maxI=i;
								}
							}
							player.storage.lgs_dingchou_name=names[maxI];
							var gains=player.getExpansions('lgs_woxun').filter(function(card){
								return card.name==player.storage.lgs_dingchou_name;
							})
							player.gain(gains,'gain2');
							player.loseToDiscardpile(player.getExpansions('lgs_woxun').removeArray(gains));
							game.log(player,'成功完成使命');
							player.awakenSkill('lgs_woxun');
							player.addSkillLog('lgs_dingchou');
						},
					},
					fail:{
						trigger:{player:'phaseUseBegin'},
						filter:function(event,player){
							var ying=player.getExpansions('lgs_woxun');
							if(ying.length<12) return false;
							var suits=['club','spade','heart','diamond'],types=['basic','trick','equip'];
							for(var i=0;i<ying.length;i++){
								suits.remove(get.suit(ying[i]));
								types.remove(get.type(ying[i],'trick'));
							}
							if(suits.length||types.length) return true;
							var ying=player.getExpansions('lgs_woxun'),names=[],nums=[];
							for(var card of ying){
								if(!names.contains(card.name)){
									names.push(card.name);
									nums.push(ying.filter(function(cardx){
										return cardx.name==card.name;
									}).length);
								}
							}
							nums.sort(function(a,b){
								return a<=b;
							});
							return nums[0]==nums[1];
						},
						forced:true,
						content:function(){
							var ying=player.getExpansions('lgs_woxun'),names=[],nums=[];
							for(var card of ying){
								if(!names.contains(card.name)){
									names.push(card.name);
									nums.push(ying.filter(function(cardx){
										return cardx.name==card.name;
									}).length);
								}
							}
							var maxV=nums[0],maxI=0;
							for(var i in nums){
								if(nums[i]>maxV){
									maxV=nums[i];
									maxI=i;
								}
							}
							game.log(player,'使命失败');
							player.awakenSkill('lgs_woxun');
							player.discard(player.getCards('h',names[maxI]));
						},
					},
				},
			},
			"lgs_dingchou":{
				mark:true,
				intro:{
					name:'定筹',
					markcount:()=>0,
					mark:function(dialog,content,player){
						dialog.addText('记录牌名：'+get.translation(player.storage.lgs_dingchou_name));
					},
				},
				trigger:{player:'phaseJieshuBegin'},
				forced:true,
				content:function(){
					var card=get.discardPile(function(cardx){
						return cardx.name==player.storage.lgs_dingchou_name;
					});
					if(card) player.gain(card,'gain2');
					else game.log('弃牌堆中无【'+get.translation(player.storage.lgs_dingchou_name)+'】，'+get.translation(player)+'无法获得此牌');
				},
				mod:{
					ignoredHandcard:function(card,player){
						if(card.name==player.storage.lgs_dingchou_name) return true;
					},
					cardDiscardable:function(card,player,name){
						if(name=='phaseDiscard'&&card.name==player.storage.lgs_dingchou_name) return false;
					},
				},
			},
			"lgs_zaoxing":{
				intro:{
					name:'早行',
					mark:function(dialog,content,player){
						if(player.hasSkill('lgs_zaoxing_tag2'))
							dialog.addText('跳过本轮的弃牌阶段');
						if(player.hasSkill('lgs_zaoxing_tag1'))
							dialog.addText('跳过下一个摸牌阶段');
					},
				},
				prompt:"你可以选择一项：<br>1.弃一张牌，然后失去一点体力并摸两张牌；<br>2.弃两张牌，然后令一名其他角色摸一张牌。",
				enable:"phaseUse",
				filter:function(event,player){
					return player.countCards('he');
				},
				filterCard:true,  // lib.filter.cardDiscardable,
				selectCard:[1,2],
				// complexCard:true,
				filterTarget:lib.filter.notMe,
				selectTarget:function(){
					if(ui.selected.cards.length==2) return [1,1];
					return [0,0];
				},
				complexSelect:true,
				position:'he',
				content:function(){
					'step 0'
					player.addTempSkill('lgs_zaoxing_tag2','roundStart');
					player.markSkill('lgs_zaoxing');
					if(cards.length==2){
						targets[0].draw();
						event.finish();
					}else{
						player.loseHp();
					}
					'step 1'
					player.draw(2);
				},
				check:function(card){
					var player=get.player();
					if(player.hasSkill('lgs_zaoxing_tag2')) return -1;
					var num=0,avai=player.countCards('he',function(cardx){return get.value(cardx)<7});
					if(avai>=2&&player.hasFriend()){
						if(player.countCards('h')-player.getHandcardLimit()>=2) num=2;
						else if(player.countCards('h')-player.getHandcardLimit()>=1) num=(player.hp>3?1:2);
					}else if(avai>=1&&player.countCards('h')>player.getHandcardLimit()){
						num=1;
					}
					if(ui.selected.cards.length>=num) return -1;
					return 7-get.value(card);
				},
				ai:{
					order:1,
					result:{
						player:function(player,target){
							if(ui.selected.cards.length==1) return player.hp-3;
							return 0;
						},
						target:1,
					},
				},
				group:"lgs_zaoxing_sk1",
				subSkill:{
					sk1:{
						mark:false,
						prompt:"是否发动【早行】，摸3张牌并跳过下一个摸牌阶段？",
						// round:1,
						trigger:{global:'phaseBegin'},
						filter:function(event,player){
							return !player.hasSkill('lgs_zaoxing_disable');
						},
						check:function(event,player){
							if(player.next.seat==1) return true;
							if(player.hasSkill('lgs_zaoxing_tag1')) return true;
							return event.player.seat>player.seat;
						},
						content:function(){
							// player.addTempSkill('lgs_zaoxing_tag1',{player:'phaseDrawSkipped'});
							player.addSkill("lgs_zaoxing_tag1");
							player.markSkill('lgs_zaoxing');
							player.addTempSkill('lgs_zaoxing_disable','roundStart');
							player.draw(3);
						},
					},
					tag1:{
						trigger:{player:"phaseDrawBefore"},
						direct:true,
						content:function(){
							player.logSkill('lgs_zaoxing');
							game.log(player,'跳过了','#y摸牌阶段');
							trigger.cancel();
							player.removeSkill("lgs_zaoxing_tag1");
						},
						onremove:function(player){
							if(!player.hasSkill('lgs_zaoxing')||!player.hasSkill('lgs_zaoxing_tag2'))
								player.unmarkSkill('lgs_zaoxing');
						},
					},
					tag2:{
						direct:true,
						trigger:{player:'phaseDiscardBefore'},
						content:function(){
							player.logSkill('lgs_zaoxing');
							game.log(player,'跳过了','#y弃牌阶段');
							trigger.cancel();
						},
						onremove:function(player){
							if(!player.hasSkill('lgs_zaoxing')||!player.hasSkill('lgs_zaoxing_tag1'))
								player.unmarkSkill('lgs_zaoxing');
						},
					},
					disable:{},
				},
			},
			"lgs_qianye":{
				// audio:'anyong',
				trigger:{
					target:"useCardToTargeted",
				},
				filter:function(event,player){
					if(player==event.player||event.targets.length!=1) return false;
					return true;
				},
				frequent:true,
				content:function(){
					trigger.getParent().set("qianye",true);
					player.draw(1);
				},
				group:["lgs_qianye_dis"],
				subSkill:{
					dis:{
						trigger:{global:"useCardAfter"},
						direct:true,
						filter:function(event,player){
							return event.qianye;
						},
						content:function(){
							player.logSkill('lgs_qianye');
							player.chooseToDiscard('【潜夜】：请弃置一张手牌','h',true);
						},
					},
				},
			},
			"lgs_jisun":{
				group:['lgs_jisun_viewas','lgs_jisun_move'],
				locked:true,
				unique:true,
			},
			lgs_jisun_viewas:{
				enable:'chooseToUse',
				locked:false,
				filterCard:function(card){
					return get.suit(card)=='spade';
				},
				viewAs:{name:'shandian'},
				hiddenCard:function(player,name){
					return name=='shandian';
				},
				viewAsFilter:function(player){
					if(!player.countCards('hs',{color:'black'})) return false;
				},
				position:'hes',
				prompt:'将一张♠牌当【闪电】使用',
				// check:function(){return 1},
				ai:{
					order:function(item,player){
						if(player.hasFriend()){
							if(game.hasPlayer(function(current){
								return get.attitude(player,current)<0;
							})) return 11;
							return 1;
						}
						return 1;
					},
					result:{
						player:function(player,target){
							if(player.hasSkill('lgs_hongqi')){
								return 1;
								// return (game.countPlayer(function(current){
									// return get.attitude(player,current)>0;
								// })-game.countPlayer(function(current){
									// return get.attitude(player,current)<0;
								// })<2)?1:get.effect(target,{name:'shandian'},player,player);
							}
							return get.effect(target,{name:'shandian'},player,player);
						},
					},
				},
			},
			lgs_jisun_move:{
				audio:'haoshi2',
				enable:'phaseUse',
				prompt:'出牌阶段，你可以将判定区里的【闪电】移动给其他角色',
				filter:function(event,player){
					return player.countCards('j','shandian');
				},
				filterTarget:function(card,player,target){
					return !target.countCards('j','shandian');
				},
				content:function(){
					var card=player.getCards('j','shandian')[0];
					player.$give(card,target,false);
					game.delay(0.5);
					target.addJudge({name:'shandian'},card);
				},
				ai:{
					order:11,
					result:{
						player:function(player,target){
							var current=target,effect=0.5,num=1,selfEffect=0.5,selfNum=1;
							while(num>0){
								effect-=get.sgnAttitude(player,current)*num;
								num-=0.25;
								current=current.next;
							}
							current=player;
							while(selfNum>0){
								selfEffect-=get.sgnAttitude(player,current)*selfNum;
								selfNum-=0.25;
								current=current.next;
							}
							if(selfEffect>=effect) return 0;
							return 999+effect;
						},
					},
				},
			},
			"lgs_hongqi":{
				locked:true,
				ai:{rejudge:true},
				group:['lgs_hongqi_one','lgs_hongqi_more'],
			},
			lgs_hongqi_one:{
				audio:'beini',
				trigger:{global:'damageEnd'},
				filter:function(event,player){
					return event.num==1&&event.player!=player&&!player.hasSkill('lgs_hongqi_one_disable')&&event.player.countCards('he');
				},
				direct:true,
				content:function(){
					'step 0'
					event.target=trigger.player;
					trigger.player.chooseCard('是否发动【宏器】，交给'+get.translation(player)+'一张牌？','he').set('ai',function(card){
						var current=_status.event.getTrigger().player
						if(get.attitude(current,_status.event.player)<0) return -1;
						var X=0;
						game.countPlayer(function(currentx){
							X+=currentx.countCards('j');
						});
						if(!X) return -1;
						if(current.countCards('h')>=X&&current.countCards('h')>=3) return -1;
						return 6-get.value(card)+(get.position(card)=='h'?1:0);
					});
					'step 1'
					var X=0
					if(result.bool){
						player.addTempSkill('lgs_hongqi_one_disable','roundStart');
						player.logSkill('lgs_hongqi_one',target);
						player.gain(result.cards,target,'give');
						game.filterPlayer(function(current){
							X+=current.countCards('j');
						});
						event.X=X;
						if(X==3)
							player.chooseBool('是否令'+get.translation(target)+'摸3张牌并将手牌弃置到3张？').set('ai',function(){
								var evt=_status.event.getParent(),player=evt.player,target=evt.target;
								if(get.attitude(player,target)>=0) return target.countCards('h')<=3;
								return target.countCards('h')>=5;
							});
						else
							player.chooseControlList(['令'+get.translation(target)+'摸3张牌并将手牌弃置到'+X+'张','令'+get.translation(target)+'摸'+X+'张牌并将手牌弃置到3张']).set('ai',function(){
								var evt=_status.event.getParent(),player=evt.player,target=evt.target,X=evt.X;
								var hs=target.countCards('h'),profit0=3-(hs+3-X),profit1=X-Math.max(hs+X-3,0);
								// game.log("X:"+X+"; hs:"+hs);
								if(get.attitude(player,target)>=0){
									// game.log('profit0:'+profit0+'; profit1:'+profit1);
									if(profit0<0&&profit1<0) return 2;
									if(profit0==profit1) return 3>X?0:1;
									return profit0>profit1?0:1;
								}else{
									if(hs==0) return 2;
									if(X==0) return 1;
									if(3>-profit0) profit0+=0.5;
									if(X>-profit1) profit1+=0.5;
									if(target.hasSkillTag('noh')){profit0++;profit1++;}
									if(profit0>=0&&profit1>=0) return 2;
									return profit0<profit1?0:1;
								}
							});
					}else{
						event.finish();
					}
					'step 2'
					event.draw=3;
					event.save=3;
					game.log(result.index);
					if(typeof result.index=='number'){
						if(result.index==0){
							event.save=event.X;
						}else if(result.index==1){
							event.draw=event.X;
						}else{
							event.finish();
						}
					}else if(!result.bool)
						event.finish();
					'step 3'
					target.draw(event.draw);
					'step 4'
					var num=Math.max(target.countCards('h')-event.save,0);
					if(num>0)
						target.chooseToDiscard(num,'宏器：请弃置'+num+'张手牌',true);
				},
				subSkill:{
					disable:{charlotte:true},
				},
			},
			lgs_hongqi_more:{
				audio:'beini',
				trigger:{global:'damageBegin4'},
				filter:function(event,player){
					return event.num>1&&!player.hasSkill('lgs_hongqi_more_disable');
				},
				prompt:function(){
					var evt=_status.event.getParent(2);
					return '###是否发动【宏器】？###令'+get.translation(evt.player)+'摸'+evt.num+'张牌，然后令此伤害减一';
				},
				check:function(event,player){
					return get.attitude(player,event.player)>0;
				},
				logTarget:'player',
				content:function(){
					'step 0'
					player.addTempSkill('lgs_hongqi_more_disable','roundStart');
					trigger.player.draw(trigger.num);
					'step 1'
					trigger.num=1;
				},
				subSkill:{
					disable:{charlotte:true},
				},
			},
			"lgs_hanxiao":{
				mod:{
					maxHandcard:function(player,num){
						return num+2*player.countCards('h',{suit:'diamond'});
					},
					aiOrder:function(player,card,num){
						if(get.itemtype(card)=='card'&&card.suit=='diamond'){
							if(player.hp<player.maxHp||player.countCards('h',{suit:'diamond'})>2) return num+0.1;
							return num-0.1;
						}
					},
				},
				trigger:{
					player:'loseAfter',
					global:['equipAfter','addJudgeAfter','gainAfter','loseAsyncAfter','addToExpansionAfter'],
				},
				filter:function(event,player){
					if(player.hp==player.maxHp||player.countCards('h',{suit:'diamond'})) return false;
					var evt=event.getl(player);
					return evt&&evt.hs&&evt.hs.filter(function(card){return card.suit=='diamond';}).length;
				},
				direct:true,
				content:function(){
					player.logSkill('lgs_hanxiao');
					player.recover();
				},
				ai:{
					effect:{
						player:function(card,player,target){
							if(get.suit(card,player)=='diamond'&&get.position(card)=='h'){
								var num=(get.recoverEffect(player,player,player)-(player.needsToDiscard()?1:0))/player.countCards('h',{suit:'diamond'});
								return [1,num];
							}
						},
					},
				},
			},
			"lgs_chenghuan":{
				init:function(player){
					if(!Array.isArray(player.storage.lgs_chenghuan))
						player.storage.lgs_chenghuan=[];
				},
				enable:'phaseUse',
				usable:1,
				filter:function(event,player){
					return player.countCards('he');
				},
				prompt:'请磕CP',
				filterCard:true,
				position:'he',
				filterTarget:function(card,player,target){
					if(ui.selected.targets.length) return target.differentSexFrom(ui.selected.targets[0]);
					return true;
				},
				selectTarget:2,
				multitarget:true,
				multiline:true,
				content:function(){
					'step 0'
					targets.sort(lib.sort.seat);
					player.storage.lgs_chenghuan=targets.concat();
					game.asyncDraw(targets);
					// if(player != targets[0]) targets.reverse();
					'step 1'
					targets[0].storage.lgs_chenghuan_targeted=targets[1];
					targets[0].addSkill('lgs_chenghuan_targeted');
					'step 2'
					targets[1].storage.lgs_chenghuan_targeted=targets[0];
					targets[1].addSkill('lgs_chenghuan_targeted');
				},
				onremove:function(player,skill){
					if(!Array.isArray(player.storage.lgs_chenghuan))
						return;
					for(var target of player.storage.lgs_chenghuan)
						target.removeSkill('lgs_chenghuan_targeted');
					delete player.storage.lgs_chenghuan;
				},
				check:function(card){
					var player=get.player()
					if(card.suit=='diamond'){
						if(player.hp<player.maxHp||player.countCards('h',{suit:'diamond'})>2) return 8-get.value(card);
						return 6-get.value(card);
					}
					return 7-get.value(card);
				},
				ai:{
					order:8,
					result:{
						target:function(player,target){
							if(ui.selected.targets.length==0){
								if(target.hasSex('male')) return -get.attitude(player,target); 
								return 1+0.25*(target.maxHp-target.hp)+0.3*target.countCards('h');
							}
							if(get.attitude(player,target)>0) return 1+0.3*(target.maxHp-target.hp)+0.25*target.countCards('h');
							return 1-0.3*(target.maxHp-target.hp)-0.25*target.countCards('h');
						},
					},
				},
				group:['lgs_chenghuan_ke','lgs_chenghuan_remove'],
				subSkill:{
					targeted:{
						charlotte:true,
						mark:true,
						intro:{
							mark:function(dialog,content,player){
								dialog.addText('成欢对象：'+get.translation(player.storage.lgs_chenghuan_targeted)+(player.storage.lgs_chenghuan_targeted.isAlive()?'':'（已阵亡）'));
							},
						},
						onremove:function(player){
							delete player.storage.lgs_chenghuan_targeted;
						},
					},
					ke:{
						trigger:{global:'useCardToTarget'},
						filter:function(event,player){
							if(event.getParent().triggeredTargets2.length>1) return false;
							if(get.type(event.card)!='basic'&&get.type(event.card)!='trick') return false;
							var target=0
							for(var current of event.targets){
								if(current.hasSkill('lgs_chenghuan_targeted')){
									if(typeof target!='number') return false;
									target=current;
								}
							}
							if(target==0) return false;
							var partner=target.storage.lgs_chenghuan_targeted;
							return partner.isAlive()&&lib.filter.targetEnabled2(event.card,event.player,partner);
						},
						check:function(event,player){
							var partner=game.filterPlayer(function(current){
								return event.targets.contains(current)&&current.hasSkill('lgs_chenghuan_targeted');
							})[0].storage.lgs_chenghuan_targeted;
							return get.effect(partner,event.card,event.player,player)>0;
						},
						prompt:function(event){
							var partner=game.filterPlayer(function(current){
								return event.targets.contains(current)&&current.hasSkill('lgs_chenghuan_targeted');
							})[0].storage.lgs_chenghuan_targeted;
							return '成欢：是否令'+get.translation(partner)+'也成为'+get.translation(event.card)+'的目标？';
						},
						autodelay:true,
						popup:false,
						content:function(){
							game.countPlayer(function(current){
								if(trigger.target.contains(current)&&current.hasSkill('lgs_chenghuan_targeted')&&!trigger.targets.contains(current.storage.lgs_chenghuan_targeted)){
									player.logSkill('lgs_chenghuan',current.storage.lgs_chenghuan_targeted);
									trigger.targets.push(current.storage.lgs_chenghuan_targeted);
									game.log(current.storage.lgs_chenghuan_targeted,'成为了',trigger.card,'的目标');
								}
							});
						},
						sub:true,
					},
					remove:{
						trigger:{player:['phaseUseBegin','die']},
						forceDie:true,
						forced:true,
						direct:true,
						content:function(){
							if(!Array.isArray(player.storage.lgs_chenghuan))
								return;
							for(var target of player.storage.lgs_chenghuan)
								target.removeSkill('lgs_chenghuan_targeted');
							player.storage.lgs_chenghuan=[];
						},
					},
				},
			},
			"lgs_ganggan":{
				trigger:{target:'useCardToTargeted'},
				filter:function(event,player){
					return event.player!=player&&get.type(event.card,'trick')=='trick';
				},
				direct:true,
				content:function(){
					'step 0'
					var target=trigger.player
					event.target=target;
					player.chooseToUse(function(card,player,event){
						if(get.name(card)!='sha') return false;
						return lib.filter.filterCard.apply(this,arguments);
					},'是否发动【刚敢】，对'+get.translation(target)+'使用一张杀?').set('targetRequired',true).set('complexSelect',true).set('filterTarget',function(card,player,target){
						if(target!=_status.event.sourcex&&!ui.selected.targets.contains(_status.event.sourcex)) return false;
						return lib.filter.targetEnabled.apply(this,arguments);
					}).set('sourcex',target).set('logSkill',['lgs_ganggan',target]);
					'step 1'
					if(result.bool&&target.getHistory('damage',function(evt){
						return evt.getParent().type=='card'&&evt.getParent(4)==event;
					}).length>0) {
						player.logSkill('lgs_ganggan');
						game.log(trigger.card,'对',player,'无效');
						trigger.excluded.add(player);
					}
				},
				mod:{
					aiValue:function(player,card,num){
						if(get.itemtype(card)=='card'&&card.name=='sha') return num+1;
					},
					aiUseful:function(){
						return lib.skill.lgs_yanhuan.mod.aiValue.apply(this,arguments);
					},
				},
				ai:{
					effect:{
						target:function(card,player,target){
							if(card&&get.type(card,'trick')=='trick'&&!player.countCards('h','shan')){
								if(target.countCards('h')>4) return [1,0.8,1,-1];
								if(target.countCards('h')>3) return [1,0.5,1,-0.7];
								if(target.countCards('h')>2) return [1,0.2,1,-0.5];
							}
						},
					},
				},
			},
			"lgs_xiyan":{
				enable:'chooseToUse',
				hiddenCard:function(player,name){
					if(_status.event.name!='chooseToUse') return false;
					if(name!='sha'&&get.type(name)!='trick') return false;
					if(!lib.card[name].filterTarget) return false;
					if(lib.card[name].selectTarget==-1&&game.countPlayer(function(current){
						return player.canUse({name:name,isCard:true},current);
					})>1) return false;
					return _status.event.filterCard({name:name,isCard:true,storage:{lgs_xiyan:player}},player,event);
				},
				filter:function(event,player){
					if(event.responded||player.hasSkill('lgs_xiyan_disable')) return false;
					if(event.filterCard({name:'sha',isCard:true,storage:{lgs_xiyan:player}},player,event)) return true;
					for(var i of lib.inpile){
						if(!lib.card[i].filterTarget) continue;
						if(lib.card[i].selectTarget==-1&&game.countPlayer(function(current){
							return player.canUse({name:i,isCard:true},current); // lib.card[i].filterTarget({name:i,isCard:true},player,current);
						})>1) continue;
						if(get.type(i)=='trick'&&event.filterCard({name:i,isCard:true,storage:{lgs_xiyan:player}},player,event)) return true;
					}
					return false;
				},
				chooseButton:{
					dialog:function(event,player){
						var list=[]
						if(event.filterCard({name:'sha',isCard:true,storage:{lgs_xiyan:player}},player,event)){
							list.push(['基本','','sha']);
							for(var i of lib.inpile_nature) list.push(['基本','','sha',i]);
						}
						for(var i of lib.inpile){
							if(!lib.card[i].filterTarget) continue;
							if(lib.card[i].selectTarget==-1&&game.countPlayer(function(current){
								return player.canUse({name:i,isCard:true},current); // lib.card[i].filterTarget({name:i,isCard:true},player,current);
							})>1) continue;
							if(get.type(i)=='trick'&&event.filterCard({name:i,isCard:true,storage:{lgs_xiyan:player}},player,event)) list.push(['锦囊','',i]);
						}
						return ui.create.dialog('戏言',[list,'vcard'],'hidden')
					},
					check:function(button){
						var player=_status.event.player,vcard=button.link
						return 0.1*player.getUseValue({name:vcard[2],nature:vcard[3],isCard:true})+(player.countCards('h',vcard[2])>0?5:(2+0.25*player.countCards('h')))*Math.random();
					},
					backup:function(links,player){
						return {
							viewAs:{
								name:links[0][2],
								nature:links[0][3],
								isCard:true,
								storage:{lgs_xiyan:player},
							},
							filterCard:()=>false,
							selectCard:-1,
							selectTarget:function(){
								if(lib.card[links[0][2]].selectTarget==-1) return -1;
								return [1,1];
							},
							log:false,
							precontent:function(){
								player.logSkill('lgs_xiyan');
								player.addTempSkill('lgs_xiyan_disable');
								game.log(player,'声明了【',event.result.card.name,'】');
								event.result.card={
									name:event.result.card.name,
									nature:event.result.card.nature,
									isCard:true,
									storage:{lgs_xiyan:player},
								};
							},
							ai:{
								result:{
									target:function(player,target){
										if(!target.countCards('he')) return 0;
									},
								},
							},
						};
					},
					prompt:function(links,player){
						return '令一名目标猜测你手牌中是否有【'+get.translation(links[0][2])+'】';
					},
				},
				mod:{
					targetEnabled:function(card,player,target){
						if(card.storage&&card.storage.lgs_xiyan&&card.storage.lgs_xiyan==target) return false;
					},
				},
				ai:{
					order:11,
					respondSha:true,
					result:{
						player:function(player){
							if(_status.event.dying) return get.attitude(player,_status.event.dying);
							return 1;
						},
					},
				},
				group:'lgs_xiyan_guess',
				subSkill:{
					disable:{},
					guess:{
						trigger:{player:'useCardBefore'},
						filter:function(event,player){
							return event.skill=='lgs_xiyan_backup';
						},
						direct:true,
						content:function(){
							'step 0'
							var target=trigger.targets[0];
							event.target=target;
							player.line(target);
							player.chat('我有'+get.translation(trigger.card.nature)+'【'+get.translation(trigger.card.name)+'】！');
							game.delayx();
							target.chooseBool('是否相信'+get.translation(player)+'手中有【'+get.translation(trigger.card)+'】？').set('ai',function(){
								var player=_status.event.getParent().player,target=_status.event.player
								if(get.attitude(target,player)>0) return true;
								if(!target.countCards('he')) return true;
								var random=Math.random();
								if(trigger.card.name=='sha') return Math.random()<=0.5+0.1*(player.countCards('h')-3);
								return Math.random()<=0.5+0.03*(player.countCards('h')-3);
							});
							'step 1'
							target.chat(result.bool?'有':'没有');
							if(!result.bool&&player.countCards('h',{name:trigger.card.name,nature:trigger.card.nature})&&target.countCards('he')){
								game.delay();
								event.goto(3);
							}
							if(result.bool&&!player.countCards('h',{name:trigger.card.name,nature:trigger.card.nature})){
								game.delay();
								event.goto(4);
							}
							else{
								event.getParent(4).goto(0);
								trigger.cancel();
							}
							'step 2'
							event.finish();
							'step 3'
							player.chat('猜错啦');
							player.gainPlayerCard('笨蛋'+get.translation(target)+'猜错了，请获得其一张牌',target,get.buttonValue,'he',true); // .set('logSkill',[event.name,trigger.source]);
							event.finish();
							'step 4'
							player.chat('猜错啦');
							player.popup(trigger.card.name,trigger.name=='useCard'?'metal':'wood');
							// player.line(target);
						},
					},
				},
			},
			"lgs_feiqiu":{
				// trigger:{player:"judgeEnd"},
				// content:function(){
					// if(trigger.result.bool) player.draw(2);
					// player.gain(trigger.result.card,'gain2');
					// // player.gain(trigger.player.judging[0],'gain2');
					// // delete player.judging;
					// trigger.result={};
					// trigger.finish=false;
					// trigger.goto(0);
				// },
				audio:'guicai2',
				trigger:{player:'judge'},
				filter:function(event,player){
					return !event.judge2({bool:event.judge(player.judging[0])>0});
				},
				forced:true,
				popup:false,
				content:function(){
					"step 0"
					player.logSkill('lgs_feiqiu');
					player.gain(trigger.player.judging[0],'gain2');
					var card=get.cards()[0];
					event.card=card;
					game.cardsGotoOrdering(card).relatedEvent=trigger;
					"step 1"
					player.$throw(card);
					if(trigger.player.judging[0].clone){
						trigger.player.judging[0].clone.classList.remove('thrownhighlight');
						game.broadcast(function(card){
							if(card.clone){
								card.clone.classList.remove('thrownhighlight');
							}
						},trigger.player.judging[0]);
						game.addVideo('deletenode',player,get.cardsInfo([trigger.player.judging[0].clone]));
					}
					trigger.player.judging[0]=card;
					game.log(trigger.player,'的判定牌改为',card);
					game.delay(2);
					"step 2"
					if(!trigger.judge2({bool:trigger.judge(player.judging[0])>0})) event.goto(0);
				},
				ai:{
					effect:{
						target:function(card,player,target){
							var armor=player.getEquip(2);
							if(armor&&armor.name=='bagua'&&get.tag(card,'respondShan')&&player&&!player.hasSkillTag('directHit_ai')) return [0,1];
						},
					},
				},
			},
			"lgs_yeyin":{
				trigger:{
					player:'damageBegin4',
					target:'useCardToTarget',
				},
				filter:function(event,player){
					if(event.name=='damage') return event.num;
					return get.color(event.card)=='black'&&player.countCards('h',{color:'red'})&&!event.excluded.contains(player);;
				},
				frequent:true,
				direct:true,
				content:function(){
					'step 0'
					// player.showHandcards(get.translation(player)+'发动了【夜隐】');
					if(player.countCards('h',{color:'red'})) event.goto(2);
					else player.chooseBool("是否发动【夜隐】，摸"+trigger.num+"张牌？").set('frequentSkill','lgs_yeyin');
					'step 1'
					if(result.bool){
						player.logSkill('lgs_yeyin');
						player.draw(trigger.num);
					}
					event.finish();
					'step 2'
					player.chooseCardTarget({
						filterCard:function(card){
							return get.color(card,player)=='red';
						},
						selectCard:1,
						position:'h',
						filterTarget:lib.filter.notMe,
						ai1:function(card){
							var player=get.player()
							if(card.name=='du') return 20;
							if(player.countCards('h','red')>2) return -1;
							return get.value(card)+(card.name=='tao'?2:0);//(_status.event.player.countCards('h')-_status.event.player.hp);
						},
						ai2:function(target){
							var att=get.attitude(_status.event.player,target);
							if(ui.selected.cards.length&&ui.selected.cards[0].name=='du'){
								if(target.hasSkillTag('nodu')) return 0;
								return 1-att;
							}
							return att-target.countCards('h')+9;
						},
					}).set('prompt','夜隐：将一张红色手牌交给其他角色');
					'step 3'
					if(result.bool){
						player.logSkill('lgs_yeyin');
						var target=result.targets[0];
						target.gain(result.cards,player,'give');
					}else{
						event.finish();
					}
					'step 4'
					player.discard(player.getCards('h',{color:'red'}));
					'step 5'
					player.judge(function(card){
						if(get.color(card,player)=='red') return 2;
						return 0;
					}).set('judge2',function(result){
						return result.bool;
					});
					'step 6'
					if(result.bool){
						if(trigger.name=='damage') trigger.num--;
						else trigger.excluded.add(player);
					}
				},
				ai:{
					effect:{
						player:function(card,player,target){
							if(card.name=='shan'&&player.countCards('h',{color:'red'})==1) return [0,0];
						},
					},
				},
			},
			"lgs_xingchi":{
				trigger:{global:'useCardToTargeted'},
				filter:function(event,player){
					return event.targets.length>1&&event.parent.triggeredTargets4.length==event.targets.length&&event.targets.contains(player);
				},
				forced:true,
				content:function(){
					var targets=trigger.parent.targets
					targets.remove(player);
					targets.push(player);
					// trigger.parent.sortTarget=function(animate,sort){
						// var event=_status.event;
						// var card=event.card,player=event.player,targets=event.targets;
						// var info=get.info(card,false);
						// if(num==0&&targets.length>1){
							// if(!info.multitarget){
								// if(!event.fixedSeat&&!sort){
									// targets.sortBySeat((_status.currentPhase||player));
									// var manyangyang=targets.filter(function(current){return current.hasSkill('lgs_xingchi')});
									// targets.removeArray(manyangyang);
									// targets.addArray(manyangyang);
								// }
								// if(animate)	for(var i=0;i<targets.length;i++){
									// targets[i].animate('target');
								// }
							// }
							// else if(animate){
								// for(var i=0;i<targets.length;i++){
									// targets[i].animate('target');
								// }
							// }
						// }
					// }
				},
			},
			"lgs_bushi":{
				// mark:true,
				intro:{
					content:function(storage){
						return '本轮已发动过'+storage+'次【补食】';
					},
				},
				init:function(player){
					player.storage.lgs_bushi=0;
					// player.storage.lgs_bushi_markcount=0;
				},
				trigger:{global:'useCardToPlayered'},
				filter:function(event,player){
					if(event.player==player||event.targets.length>1||event.targets[0]==player) return false;
					if(event.card.name!='sha'&&get.type(event.card)!='trick') return false;
					return player.storage.lgs_bushi<3;
				},
				prompt2:function(event,player){
					if(player.storage.lgs_bushi==0) return '你可以摸两张牌';
					if(player.storage.lgs_bushi==1) return '你可以摸一张牌，然后弃一张牌';
					var mubiao=''
					if(!event.targets.contains(player)) mubiao='并成为'+get.translation(event.card)+'的目标';
					if(player.storage.lgs_bushi==2) return '你可以摸一张牌'+mubiao;
				},
				frequent:function(event,player){
					return player.storage.lgs_bushi<=1;
				},
				check:function(event,player){
					return event.targets.contains(player)||get.effect(player,player,event.card,event.player,player)>0;
				},
				content:function(){
					'step 0'
					player.storage.lgs_bushi++;
					// player.storage.lgs_bushi_markcount++;
					player.draw();
					'step 1'
					switch(player.storage.lgs_bushi){
						case 1:
							player.draw();
							break;
						case 2:
							player.chooseToDiscard('补食：请弃置一张牌','he',true);
							break;
						case 3:
							if(!trigger.targets.contains(player))
								trigger.targets.push(player);
							break;
					}
				},
				onremove:function(player){
					delete player.storage.lgs_bushi;
					player.unmarkSkill('lgs_bushi');
				},
				ai:{
					threaten:1.3,
				},
				group:'lgs_bushi_update',
				subSkill:{
					update:{
						trigger:{global:'roundStart'},
						direct:true,
						content:function(){
							player.storage.lgs_bushi=0;
							// player.storage.lgs_bushi_markcount=0;
						},
						sub:true,
					}
				},
			},
			"lgs_cangmo":{
				marktext:'墨',
				intro:{
					markcount:'expansion',
					mark:function(dialog,content,player){
						if(player==game.me||player.isUnderControl()){
							if(player.getExpansions('lgs_cangmo').length)
								dialog.add(player.getExpansions('lgs_cangmo'));
						}else{
							dialog.addText('当前拥有'+player.getExpansions('lgs_cangmo').length+'张“墨”');
						}
					},
				},
				enable:'phaseUse',
				filter:function(event,player){
					return player.getExpansions('lgs_cangmo').length&&player.countCards('he');
				},
				chooseButton:{
					dialog:function(event,player){
						return ui.create.dialog('藏墨',[player.getExpansions('lgs_cangmo'),'card'],'hidden')
					},
					filter:function(button){
						var evt=_status.event.getParent(),player=_status.event.player
						return ['basic','trick'].contains(get.type(button.link,'trick'))&&evt.filterCard(button.link,player,evt);
					},
					check:function(button){
						return _status.event.player.getUseValue(button.link);
					},
					backup:function(links,player){
						return {
							filterCard:true,
							complexCard:true,
							viewAs:{
								name:links[0].name,
								nature:links[0].nature,
								cangmo:links[0],
							},
							position:'he',
							ai1:function(card){
								return 7-get.value(card);
							},
							popname:false,
							precontent:function(){
								player.logSkill('lgs_cangmo');
								player.loseToDiscardpile(event.result.card.cangmo);
								event.result.card={
									name:event.result.card.name,
									nature:event.result.card.nature,
									cards:event.result.cards,
								};
							},
							onuse:function(links,player){
								var next=game.createEvent('lgs_cangmo_recover',false,_status.event.getParent());
								next.player=player;
								next.setContent(function(){
									var card=get.cards()[0],cardx=ui.create.card();
									cardx.classList.add('infohidden');
									cardx.classList.add('infoflip');
									game.broadcastAll(function(player,cardx){
										if(player==game.me){
											player.$gain2(card);
										}else{
											player.$gain2(cardx);
										}
									},player,cardx);
									player.addToExpansion(card,'bySelf',player).gaintag.add('lgs_cangmo');
								});
							},
						}
					},
					prompt:function(links,player){
						return '将一张牌当一张'+get.translation(links[0].nature||'')+get.translation(links[0].name)+'使用';
					},
				},
				onremove:function(player,skill){
					var cards=player.getExpansions(skill);
					if(cards.length) player.loseToDiscardpile(cards);
				},
				ai:{
					order:function(item,player){
						var mos=player.getExpansions('lgs_cangmo').sort(function(a,b){
							return player.getUseValue(a)<player.getUseValue(b);
						});
						return get.order(mos[0])+0.5;
					},
					result:{
						player:function(player,target){
							var mo=player.getExpansions('lgs_cangmo').sort(function(a,b){
								return player.getUseValue(a)<player.getUseValue(b);
							})[0];
							if(!player.countCards('h',function(card){
								return get.value(card)<7&&player.getUseValue(card)<player.getUseValue(mo);
							})) return -1;
							// game.log(mo,player.getUseValue(mo));
							return player.getUseValue(mo);
						},
					},
				},
				group:['lgs_cangmo_start','lgs_cangmo_exchange','lgs_cangmo_defend'],
				subSkill:{
					start:{
						trigger:{
							global:'phaseBefore',
							player:'enterGame',
						},
						filter:function(event,player){
							return (event.name!='phase'||game.phaseNumber==0);
						},
						forced:true,
						locked:false,
						content:function(){
							'step 0'
							player.draw(2);
							'step 1'
							if(!player.countCards('h')) event.finish();
							else player.chooseCard('h',2,'将两张手牌置于武将牌上，称为“墨”',true).set('ai',function(card){
								var bonus=0
								if(card.name=='sha'){
									if(ui.selected.cards.length!=1||ui.selected.cards[0].name!='sha') bonus+=2;
									else bonus+=1;
								}
								return 6-get.value(card)+bonus;
							});
							'step 2'
							if(result.bool){
								player.addToExpansion(result.cards,player,'giveAuto','log').gaintag.add('lgs_cangmo');
							};
						},
					},
					exchange:{
						trigger:{player:['phaseZhunbeiBegin','phaseJieshuBegin']},
						filter:function(event,player){
							return player.getExpansions('lgs_cangmo').length;
						},
						direct:true,
						content:function(){
							'step 0'
							game.delay(0.5);
							player.chooseButton(['是否用牌堆顶的一张牌交换一张“墨”？','你的“墨”',player.getExpansions('lgs_cangmo')]).set('ai',function(button){
								var bonus=0,js=player.getCards('j'),card=button.link
								if(trigger.name=='phaseZhunbei'){
									if(js.length){
										var judge=get.judge(js[0]);
										if(judge&&judge(card)>=0) bonus+=20;
										else if(judge&&judge(card)<0) bonus-=20;
									}
									if(get.type(card)=='equip') bonus+=get.equipValue(card);
									if(!player.hasValueTarget(card)) bonus+=get.value(card);
									else if(player.getUseValue(card)<5) bonus--;
								}else{
									js=player.next.getCards('j');
									if(js.length){
										var judge=get.judge(js[0]);
										if(judge&&(judge(card)+0.01)*get.attitude(player,player.next)>0) bonus+=20;
										else if(judge&&(judge(card)+0.01)*get.attitude(player,player.next)<0) bonus-=20;
									}
									var shas=player.getExpansions('lgs_cangmo').filter(function(cardx){
										return cardx.name=='sha';
									});
									if(card.name=="sha") bonus-=3-shas.length;
									if(shas.length==0) bonus+=2;
								}
								if(card.name=='shan') bonus++;
								if(card.name=='tao'&&get.attitude(player,player.next)>0) bonus++;
								return 5-get.useful(card)+bonus;
							});
							'step 1'
							if(result.bool){
								player.logSkill('lgs_cangmo');
								var card=get.cards()[0],cardx=ui.create.card();
								cardx.classList.add('infohidden');
								cardx.classList.add('infoflip');
								game.broadcastAll(function(player,cardx){
									if(player==game.me){
										player.$gain2(card);
										player.$throw(result.links[0],500,'nobroadcast');
									}else{
										player.$gain2(cardx);
										player.$throw(cardx,500,'nobroadcast');
									}
								},player,cardx);
								player.addToExpansion(card,'bySelf').gaintag.add('lgs_cangmo');
								player.lose(result.links[0],ui.cardPile,'insert');
								game.log(player,'将一张“墨”置于了牌堆顶');
							}
						},
					},
					defend:{
						trigger:{target:'useCardToTargeted'},
						filter:function(event,player){
							if(event.player==player||event.card.name!='sha'&&get.type(event.card,'trick')!='trick') return false;
							for(var mo of player.getExpansions('lgs_cangmo'))
								if(mo.name==event.card.name) return true;
							return false;
						},
						direct:true,
						content:function(){
							'step 0'
							// game.delay(0.5);
							event.mos=player.getExpansions('lgs_cangmo').filter(function(card){
								return card.name==trigger.card.name;
							});
							if(event.mos.length>1){
								player.chooseButton(['藏墨：请移除“墨”中的一张【'+get.translation(trigger.card.name)+'】，令'+get.translation(trigger.card)+'对你无效',[player.getExpansions('lgs_cangmo'),'card']],true).set('ai',function(button){
									return 10-get.useful(button.link);
								});
							}else{
								event.mo=event.mos[0];
								event.goto(2);
							}
							'step 1'
							if(result.bool){
								event.mo=result.links[0];
							}else
								event.finish();
							'step 2'
							player.logSkill('lgs_cangmo');
							player.loseToDiscardpile(event.mo);
							trigger.excluded.add(player);
							game.log(trigger.card,'对',player,'无效');
						},
					},
				},
			},
			// lgs_cangmo_backup:{
				// sourceSkill:'lgs_cangmo',
				// prompt:'请选择牌的目标',
				// precontent:function(){
					// player.loseToDiscardpile(event.result.card.cangmo);
					// game.delay(0.5);
				// },
				// logSkill:'lgs_cangmo',
				// filterCard:true,
				// position:'he',
				// onuse:function(links,player){
					// var next=game.createEvent('lgs_cangmo_recover',false,_status.event.getParent());
					// next.player=player;
					// next.setContent(function(){
						// player.addToExpansion(get.cards()[0],'giveAuto',player).gaintag.add('lgs_cangmo');
					// });
				// },
			// },
			"lgs_youli":{
				trigger:{player:'phaseUseEnd'},
				filter:function(event,player){
					return player.hasSkill('lgs_cangmo')&&player.getExpansions('lgs_cangmo').length==0;
				},
				forced:true,
				popup:false,
				content:function(){
					'step 0'
					player.chooseTarget('游历：观看至多两名角色的手牌',[1,2],function(card,player,target){
						return target.countCards('h');
					}).set('ai',function(target){
						var player=get.player()
						if(player.hp<=2) return target.countCards('h')+(get.attitude(player,target)>0?0:1.5);
						return target.countCards('h')+(get.attitude(player,target)>0?0:2.5);
					});
					'step 1'
					if(result.bool){
						var targets=result.targets,title='游历：将'+get.translation(targets),info=[];
						player.logSkill('lgs_youli',targets);
						title+=(targets.length==2?'的各至多一张手牌（不能选择类型相同的牌）置于你的武将牌上，当作“墨”':'的一张手牌置于你的武将牌上，当作“墨”');
						var dialog=[title]
						for(var target of targets){
							dialog.push(get.translation(target)+'的手牌');
							dialog.push(target.getCards('h'));
						}
						player.chooseButton(dialog,[1,2]).set('filterButton',function(button){
							if(!ui.selected.buttons.length) return true;
							return get.owner(button.link)!=get.owner(ui.selected.buttons[0].link)&&get.type(button.link,'trick')!=get.type(ui.selected.buttons[0],'trick');
						}).set('ai',function(button){
							var player=_status.event.player,card=button.link,types1=[],types2=[],bonus=0
							if(targets.length>1){
								for(var h of targets[0].getCards('h'))
									if(!types1.contains(get.type(card,'trick')))
										types1.push(get.type(card,'trick'));
								for(var h of targets[1].getCards('h'))
									if(!types2.contains(get.type(card,'trick')))
										types2.push(get.type(card,'trick'));
								var type
								if(types1.length==1&&types2.length>1&&types2.contains(types1[0])) 
									type=types2.filter(function(current){return current!=types1[0]})[0];
								if(types1.length>1&&types2.length==1&&types1.contains(types2[0]))
									type=types1.filter(function(current){return current!=types2[0]})[0];
								if(get.type(card,'trick')==type) bonus+=5;
							}
							if(get.attitude(player,get.owner(card))>0) return 7-get.value(card)+bonus;
							return get.value(card)+get.useful(card)+bonus;
						});
					}else{
						player.logSkill('lgs_youli');
						player.loseHp();
						event.finish();
					}
					'step 2'
					if(result.bool){
						player.addToExpansion(result.links,'giveAuto',player).gaintag.add('lgs_cangmo');
						if(result.links.length>1) event.finish();
					}
					'step 3'
					player.loseHp();
				},
				ai:{
					combo:'lgs_cangmo',
				},
			},
			"lgs_shanxuan":{
				audio:'yingzi',
				init:function(player){
					player.storage.lgs_shanxuan=player.hp;
				},
				mark:true,
				intro:{
					name:'闪炫',
					mark:function(dialog,content,player){
						dialog.addText('体力值最低记录:'+player.storage.lgs_shanxuan);								
					},
				},
				trigger:{
					player:"phaseDrawBegin2",
				},
				frequent:true,
				filter:function(event,player){
					return !event.numFixed;
				},
				content:function(){
					trigger.num+=player.storage.lgs_shanxuan;
				},
				group:["lgs_shanxuan_gameStart","lgs_shanxuan_loseHp"],
				subSkill:{
					"gameStart":{
						charlotte:true,
						trigger:{
							global:"phaseBefore",
							player:"enterGame",
						},
						filter:function(event,player){
							return (event.name!='phase'||game.phaseNumber==0);
						},
						forced:true,
						popup:false,
						content:function(){
							player.storage.lgs_shanxuan = player.hp;
						}
					},
					"loseHp":{
						charlotte:true,
						trigger:{
							player:"changeHp",
						},
						filter:function(event,player){
							return player.hp < player.storage.lgs_shanxuan;
						},
						forced:true,
						popup:false,
						content:function(){
							player.storage.lgs_shanxuan = player.hp;
							player.syncStorage('lgs_shanxuan');
						}
					},
				},
			},
			"lgs_jieyi":{
				// audio:'danlao',
				trigger:{
					global:"useCard",
				},
				filter:function(event,player){
					return !player.hasSkill('lgs_jieyi_block')&&event.player!=player&&(event.card.name=='sha' || get.type(event.card,'trick')=='trick')&&player.countCards('he')>0;
				},
				direct:true,
				content:function(){
					'step 0'
					// ai
					var effect=0;
					if(trigger.card.name=='wuxie'){
						if(get.attitude(player,target)<-1) effect=-2;
						else effect=2;
					}
					else if(trigger.targets&&trigger.targets.length){
						for(var i=0;i<trigger.targets.length;i++){
							effect+=get.effect(trigger.targets[i],trigger.card,trigger.player,player);
						}
					}
					if(trigger.targets.contains(player)&&get.tag(trigger.card,'damage')) effect-=2;
					// end ai
					
					player.chooseToDiscard('是否发动【解意】，弃置一张牌令'+get.translation(trigger.card)+'无效？','he').set('ai',function(cardx){
						var trigger=_status.event.getTrigger(),effect=_status.event.effect;
						// if(trigger.targets.contains(player)&&effect<-6) return 6-get.value(cardx);
						if(effect<-10) return 10-get.value(cardx);
						if(effect<-7&&get.tag(trigger.card,'damage')) return 6-get.value(cardx);
						var player=_status.event.player,target=trigger.player
						if(get.attitude(player,target)>0&&effect<10&&trigger.targets.contains(target)) return 7-get.value(cardx);
						return 0;
					}).set('effect',effect);
					'step 1'
					if(result.bool){
						player.logSkill('lgs_jieyi', trigger.player);
						player.addTempSkill('lgs_jieyi_block');
						trigger.player.draw(2);
						trigger.cancel();
					}
					else{
						event.finish();
					}
					'step 2'
					if(trigger.targets.contains(trigger.player)){
						player.draw(2);
					}
				},
				subSkill:{
					block:{charlotte:true},
				},
			},
			lgs_shannian:{
				marktext:'仁库',
				intro:{
					name:'仁库',
					markcount:function(storage,player){
						return _status.renku.length;
					},
					mark:function(dialog,content,player){
						dialog.add(_status.renku);								
					},
				},
				locked:true,
				group:['lgs_shannian_discard','lgs_shannian_draw'],
				ai:{
					threaten:1.2,
				},
			},
			lgs_shannian_discard:{
				trigger:{global:'loseAfter'},
				filter:function(event,player){
					return event.type=='discard';
				},
				direct:true,
				content:function(){
					'step 0'
					player.logSkill('lgs_shannian');
					var cards=trigger.cards2
					game.log(player,'将',cards,'置于了仁库');
					game.cardsGotoSpecial(cards,'toRenku');
					'step 1'
					player.markSkill('lgs_shannian');
				},
			},
			lgs_shannian_draw:{
				init:function(player){
					player.storage.aiSkillList=['zhiheng','rezhiheng','rejieyue','zishu','syjiqiao','xinfu_jianji','lgs_beishan','lgs_shensuan','lgs_qiujin'];
				},
				trigger:{
					global:"gainAfter",
				},
				filter:function(event,player){
					return _status.renku.length&&event.getParent().name=='draw';
				},
				frequent:true,
				popup:false,
				content:function(){
					'step 0'
					event.X=trigger.cards.length;
					var next=player.chooseToMove('善念：将仁库的至多'+event.X+'张牌移动到牌堆顶');
					next.set('list',[
						['仁库',_status.renku],
						['牌堆顶'],
					]);
					next.set('filterMove',function(from,to,moved){
						if(moved[0].contains(from.link)){
							// game.log('shannian-filterMove-ai-to:'+to);
							if(typeof to=='number'){
								if(to==1){
									if(moved[1].length>=_status.event.getParent().X) return false;
								}
								return true;
							}else
								return false;
						}
						return true;
					});
					next.set('processAI',function(list){
						var cards=list[0][1],player=_status.event.player,trigger=_status.event.getTrigger();
						var ren=cards.concat();
						cards.sort(function(a,b){return get.value(a)<get.value(b)});
						var top=[],target=_status.currentPhase,next=trigger.player.next;
						var att1=get.attitude(player,target),att2=get.attitude(player,next);
						if(att1>=0&&att2>0||att1>0&&att2>=0){
							for(var i=0;i<_status.event.getParent().X&&cards.length&&get.value(cards[0])>6;i++){
								ren.remove(cards[0]);
								top.unshift(cards.shift());
							}
						}
						if(att1<=0&&att2<0||att1<0&&att2<=0){
							for(var i=0;i<_status.event.getParent().X&&cards.length&&get.value(cards[cards.length-1])<5;i++){
								ren.remove(cards[cards.length-1]);
								top.push(cards.pop());
							}
						}
						// for(var skill of player.storage.aiSkillList){}
						return [ren,top];
					});
					'step 1'
					var top=result.moved[1]
					if(top.length){
						_status.renku.removeArray(top);
						game.updateRenku();
						player.markSkill('lgs_shannian');
						top.reverse();
						for(var i=0;i<top.length;i++){
							ui.cardPile.insertBefore(top[i],ui.cardPile.firstChild);
						}
						player.logSkill('lgs_shannian');
						player.popup(get.cnNumber(top.length)+'上');
						game.log(player,'将仁库中的'+get.cnNumber(top.length)+'张牌置于牌堆顶');
						game.updateRoundNumber();
						game.delayx();
					}
				},
				onremove:function(player){
					delete player.storage.aiSkillList;
				},
			},
			lgs_oldjingyao:{
				limited:true,
				skillAnimation:'epic',
				animationColor:'wood',
				enable:'phaseUse',
				filter:function(event,player){
					return game.hasPlayer(function(current){return !current.isOut()&&current!=player&&current.next!=player&&current.previous!=player});
				},
				filterCard:true,
				selectCard:[1,Infinity],
				check:function(card,player){
					for(var cardx of ui.selected.cards)
						if(get.suit(cardx)==get.suit(card))
							return 0;
					return 8-get.value(card);
				},
				filterTarget:function(card,player,target){
					return !target.isOut()&&target!=player&&target.next!=player&&target.previous!=player
				},
				content:function(){
					'step 0'
					player.awakenSkill('lgs_jingyao');
					var suits=game.getSuit(target,'h'),bool=false,target=event.target
					for(var card of cards)
						if(suits.contains(get.suit(card))){bool=true;break;}
					if(bool){
						player.chooseTarget('请选择一名角色，与其交换位置',function(card,player,targetx){
							var target=_status.event.parent.target
							return targetx.next==target||targetx.previous==target;
						},function(targetx){
							var player=_status.event.player
							// var num=0,current=player.next;
							// while(true){
								// num-=get.sgn(get.attitude(player,current));
								// if(current==targetx) break;
								// current=current.next;
							// }
							// while(true){
								// if(current==player) break;
								// num+=get.sgn(get.attitude(player,current))*1.1;
								// current=current.next;
							// }
							// return num;
							var num=get.swapSeatEffect(targetx,player);
							game.log(num);
							return num;
						},true);
					}else
						event.finish();
					'step 1'
					player.storage.lgs_jingyao=target;
					player.addSkill('lgs_jingyao_draw');
					game.swapSeat(player,result.targets[0]);
				},
				ai:{
					order:2,
					result:{
						target:function(player,target){
							if(!target.countCards('h')) return 0;
							return 5;
						},
						player:function(player,target){
							game.log('jingyao-result');
							// if(get.attitude(player,target)<=0) return 0;
							if(!target.countCards('h')) return 0;
							var num=Math.max(get.swapSeatEffect(target.previous,player),get.swapSeatEffect(target.next,player))
							// if(get.attitude(player,target)<0) num-=4;
							game.log(num);
							return num;
						},
					},
				},
				subSkill:{
					draw:{
						charlotte:true,
						trigger:{global:'phaseDrawBegin2'},
						filter:function(event,player){
							return event.player==player.storage.lgs_jingyao&&!event.numFixed;
						},
						forced:true,
						locked:false,
						logTarget:'player',
						content:function(){
							trigger.num++;
						},
					},
				},
			},
			lgs_jingyao: {
				audio: 'xinfu_jianjie2',
				// audio: 'lixia2',
				limited: true,
				skillAnimation: true,
				animationColor: "green",
				enable: 'phaseUse',
				filterTarget (card, player, target) {
					return player!=target && player.countCards('he', function(cardx) {
						return lib.filter.cardDiscardable(cardx, player, 'lgs_jingyao');
					}) >= get.distance(player, target);
				},
				direct: true,
				line: false,
				delay: false,
				content: function() {
					'step 0'
					event.X = get.distance(player, target);
					player.chooseToDiscard('he',event.X).set('ai', function(card) {
						return 8-get.value(card);
					});
					'step 1'
					if (result.bool){
						player.logSkill('lgs_jingyao', target);
					}else
						event.finish();
					'step 2'
					game.swapSeat(player, target.previous);
					'step 3'
					target.addSkill('lgs_fangxu');
					target.addMark('lgs_fangxu', event.X);
					player.awakenSkill('lgs_jingyao');
				},
				ai:{
					order: 7,
					result: {
						target: 5,
						player: function(player, target) {
							// game.log('jingyao-result-', target);
							if (player.countCards('he', function(card) {
								return lib.filter.cardDiscardable(card, player, 'lgs_jingyao') && get.value(card) < 8;
							}) < get.distance(player, target)) return -10;
							var num = get.swapSeatEffect(target.previous, player)
							// game.log(num);
							return num;
						},
					},
				},
			},
			lgs_fangxu: {
				audio: "ext:理工杀:1",
				intro: {
					name: '芳许',
					name2: '许',
					content: '当前用有#个“许”标记',
				},
				marktext: '许',
				trigger: {
					player: 'phaseDrawBegin2',
				},
				filter (event, player) {
					return player.countMark('lgs_fangxu');
				},
				direct: true,
				content () {
					'step 0'
					player.chooseControl('多摸1张牌', '移除一个“许”并多摸2张牌', 'cancel2').set('ai', function(){
						return _status.event.player.countMark('lgs_fangxu') > 1 ? 1 : 0;
					});
					'step 1'
					if(result.index != 2){
						player.logSkill('lgs_fangxu');
						if(result.index == 0) 
							trigger.num++;
						else{
							player.removeMark('lgs_fangxu');
							trigger.num += 2;
						}
					}
				},
			},
			lgs_qishang:{
				init:function(player){
					player.addMark('lgs_qishang',4);
				},
				marktext:'绮',
				intro:{
					name:'绮尚',
					name2:'绮',
					content:'当前有#个“绮”标记',
				},
				enable:"phaseUse",
				filter:function(event,player){
					return !player.hasSkill('lgs_qishang_block');
				},
				content:function(){
					'step 0'
					player.draw(2);
					'step 1'
					if(game.countSuit(player,'h')<player.countMark('lgs_qishang')){
						player.removeMark('lgs_qishang');
						event.finish()
					}else{
						var cards=player.getCards('h').randomGets(player.countMark('lgs_qishang'));
						if(cards)
							player.discard(cards);
					}
					'step 2'
					if(player.countMark('lgs_qishang')<=2){
						player.storage.lgs_qishang=4;
						player.syncStorage('lgs_qishang');
						game.log(player,'将','#g【绮】','数量调整为四');
						player.addTempSkill('lgs_qishang_block');
					}
				},
				onremove:true,
				ai:{
					order:1,
					result:{
						player:function(player){
							var mark=player.countMark('lgs_qishang'),num=game.countSuit(player,'h')
							if(mark<=1||num+2<mark) return 2;
							if(num<=3&&mark==4) return 1.5;
							if(num<=1&&mark==3) return 1.5;
							var value=0
							var handcard=player.countCards('h',function(card){value+=get.value(card);})
							return 6-value/handcard;
						},
					},
				},
				// group:'lgs_qishang_addMark',
				subSkill:{
					// addMark:{
						// trigger:{
							// global:'phaseBefore',
							// player:'enterGame',
						// },
						// filter:function(event,player){
							// return (event.name!='phase'||game.phaseNumber==0);
						// },
						// forced:true,
						// locked:false,
						// content:function(){
							// player.addMark('lgs_qishang',4);
						// },
					// },
					block:{charlotte:true},
				},
			},
			lgs_qiaohui:{
				audio:'minsi1',
				trigger:{player:'gainAfter'},
				filter:function(event,player){
					var suits=[];
					for(var card of player.getCards('h')){
						if(suits.contains(card.suit))
							return false;
						suits.push(card.suit);
					}
					return true;
				},
				frequent:true,
				content:function(){
					player.draw();
				},
				ai:{
					noh:true,
				},
			},
			lgs_qingwei:{
				audio:'shanshen',
				trigger:{
					player:"damageEnd",
					source:"damageSource",
				},
				direct:true,
				filter:function(event,player){
					if(event.player==player)return event.source&&player.countCards('he');
					return event.player&&event.player!=player&&event.player.countGainableCards(player,'he')&&event.num>0;
				},
				content:function(){
					'step 0'
					if(player==trigger.player)
						player.chooseCard('是否发动【清卫】，交给'+get.translation(trigger.source)+'一张牌？','he').set('ai',function(card){
							var player=_status.event.player,target=_status.event.getTrigger().source
							if(get.attitude(player,target)>0) return 99-get.value(card);
							if(target.hasSkill('lgs_jingjie')) return 0;
							return 6-get.value(card);
						});
					else
						player.chooseBool('是否发动【清卫】，获得'+get.translation(trigger.player)+'一张牌？');
					'step 1'
					if(result.bool){
						player.logSkill('lgs_qingwei',(player==trigger.player?trigger.source:trigger.player));
						if(player==trigger.player)
							trigger.source.gain(result.cards,player,'giveAuto');
						else
							player.gainPlayerCard(true,trigger.player,'he');
					}else
						event.finish();
					'step 2'
					trigger.source.chooseControlList(['令'+get.translation(trigger.player)+'回复一点体力','获得技能【镜洁】'],true).set('ai',function(){
						var player=_status.event.player,victim=_status.event.getTrigger().player
						if(get.attitude(player,victim)>=0)return 0;
						return 1;
					});
					'step 3'
					if(result.control!='cancel2'){
						if(result.index)
							trigger.source.addSkill('lgs_jingjie');
						else
							trigger.player.recover(trigger.source);
					}
				},
				ai:{
					maixie_defend:true,
					effect:{
						target:function(card,player,target){
							if(get.tag(card,'damage')){
								if(player.hasSkillTag('jueqing',false,target)) return [1,-1];
								if(target.countCards('he')){
									if(get.attitude(target,player)>0&&(target.hp>1||target.hujia&&target.hp<target.maxHp)) return [0.1,0];
									// return [1,0,1,Math.max(0,1-player.countCards('he')/5)];
								}
							}
						},
					},
				},
				group:'lgs_qingwei_clear',
				subSkill:{
					clear:{
						charlotte:true,
						trigger:{player:['phaseEnd','die']},
						filter:true,
						forceDie:true,
						forced:true,
						popup:false,
						silent:true,
						content:function(){
							game.countPlayer(function(current){
								current.removeSkill('lgs_jingjie');
							});
						},
					},
				},
			},
			lgs_jingjie:{
				mark:true,
				locked:true,
				group:['lgs_jingjie_dis1','lgs_jingjie_dis2','lgs_jingjie_draw'],
				mod:{
					aiOrder:function(player,card,num){
						if(get.itemtype(card)=='card')
							return num+player.getUseValue(card)/10;
					},
				},
				ai:{
					pretao:true,
				},
			},
			lgs_jingjie_dis1:{
				trigger:{
					player:'loseAfter',
					global:['equipAfter','addJudgeAfter','gainAfter','loseAsyncAfter','addToExpansionAfter'],
				},
				filter:function(event,player){
					if(event.name=='gain'&&event.player==player) return false;
					var evt=event.getl(player),suits=[];
					for(var card of event.cards)
						if(!suits.contains(card.suit))
							suits.push(card.suit);
					return evt&&evt.cards2&&evt.cards2.length>0&&player.countCards('hej',function(card){return suits.contains(card.suit)});
				},
				forced:true,
				content:function(){
					var suits=[]
					for(var card of trigger.cards)
						if(!suits.contains(card.suit))
							suits.push(card.suit);
					var cards=[]
					for(var card of player.getCards('hej'))
						if(suits.contains(card.suit))
							cards.push(card);
					game.delayx();
					player.discard(cards);
				},
			},
			lgs_jingjie_dis2:{
				trigger:{player:'phaseUseEnd'},
				filter:function(event,player){
					var suits=[]
					for(var card of player.getCards('h'))
						if(!suits.contains(card.suit))
							suits.push(card.suit);
					return suits.length>=3;
				},
				forced:true,
				content:function(){
					player.discard(player.getCards('h'));
				},
			},
			lgs_jingjie_draw:{
				trigger:{player:'phaseJieshuBegin'},
				filter:function(event,player){
					return !player.countCards('h');
				},
				forced:true,
				content:function(){
					player.draw();
				},
			},
			lgs_qiaqun:{
				trigger:{
					global:'phaseBefore',
					player:'enterGame',
				},
				forced:true,
				filter:function(event,player){
					return (event.name!='phase'||game.phaseNumber==0)&&!lib.inpile.contains('qizhengxiangsheng');
				},
				content:function(){
					for(var suit of ['heart','heart','diamond','spade']){
						var card=game.createCard2('huanjuyitang',suit,10);
						ui.cardPile.insertBefore(card,ui.cardPile.childNodes[get.rand(0,ui.cardPile.childNodes.length)]);
					}
					game.broadcastAll(function(){lib.inpile.add('huanjuyitang')});
					game.updateRoundNumber();
				},
				global:'lgs_qiaqun2',
			},
			lgs_qiaqun2:{
				enable:'phaseUse',
				usable:1,
				filter:function(event,player){
					return game.hasPlayer(function(current){
						return current.hasSkill('qiaqun');
					});
				},
				prompt:'弃一张牌，获得一张欢聚一堂',
				selectCard:1,
				filterCard:true,
				position:'he',
				content:function(){
					var card=get.cardPile(function(card){
						return card.name=='huanjuyitang';
					});
					if(card) player.gain(card,'gain2');
				},
				check:function(card){
					return 6-get.value(card);
				},
				ai:{
					order:8,
					result:{
						player:function(player,target){
							var players=game.filterPlayer(),cardNum1=[],targetResult1=[],eff1=0,cardNum2=[],targetResult2=[],eff2=0;
							for(var i=0;i<players.length;i++){
								var current=players[i],num=players[i].countCards('h');
								if(player.hasSkill('lgs_langfang')&&get.attitude(player,current)>0) num++;
								if(current==player) num--;
								else if(current.hasSkill('lgs_langfang')) num++;
								cardNum1.push(num);cardNum2.push(num);
							}
							for(var i=0;i<players.length;i++){
								var current=players[i]
								targetResult1.push(cardNum1[i]/10);
								if(cardNum1[(i?0:players.length)+i-1]==cardNum1[(i<players.length-1?i+1:0)]){
									targetResult1[i]-=1;
									cardNum1[i]--;
								}
								if(current.countCards('e',function(card){
									return get.value(card)<6;
								})) cardNum1[i]++;
								var att=0;
								if(get.attitude(player,current)>0) att=1;
								else if(get.attitude(player,current)<0) att=-1;
								eff1+=att*targetResult1[i];
							}
							for(var i=0;i<players.length;i++){
								var current=players[i]
								targetResult2.push(0);	
								if(!current.countCards('he')) targetResult2[i]+=1;
								else targetResult2[i]+=cardNum2[i]/10-0.2;
								if(cardNum2[(i?0:players.length)+i-1]==cardNum2[(i<players.length-1?i+1:0)]){
									targetResult2[i]+=1;
									cardNum2[i]++;
								}
								if(current.countCards('e',function(card){
									return get.value(card)<6;
								})) cardNum2[i]++;
								var att=0;
								if(get.attitude(player,current)>0) att=1;
								else if(get.attitude(player,current)<0) att=-1;
								eff2+=att*targetResult2[i];
							}
							var res=Math.max(eff1,eff2)-1
							if(player.hasSkill('lgs_langfang')) res+=game.countPlayer(function(current){
								return get.attitude(player,current)>0;
							});
							for(var current of players)
								if(current.hasSkill('lgs_langfang')&&current!=player){
									var att=0
									if(get.attitude(player,current)>0) att=1;
									else if(get.attitude(player,current)<0) att=-1;
									res+=att;
								}
							return res;
						},
					},
				},
			},
			lgs_langfang:{
				locked:true,
				unique:true,
				group:['lgs_langfang_use','lgs_langfang_target'],
			},
			lgs_langfang_use:{
				trigger:{player:'useCard'},
				filter:function(event,player){
					return event.targets.length>1;
				},
				forced:true,
				content:function(){
					'step 0'
					player.chooseTarget('令至少一名目标摸一张牌',[1,Infinity],function(card,player,target){
						return _status.event.getTrigger().targets.contains(target);
					},true).set('ai',function(target){
						var player=_status.event.player
						if(get.attitude(player,target)>0) return 99-target.countCards('h');
						if(get.attitude(player,target)<0) return target.countCards('h')-99;
						return 0;
					});
					'step 1'
					player.line(result.targets);
					game.asyncDraw(result.targets);
				},
			},
			lgs_langfang_target:{
				trigger:{global:'useCardToTarget'},
				filter:function(event,player){
					return event.player!=player&&event.targets.length>1&&!event.getParent().lgs_langfang_triggered;
				},
				forced:true,
				content:function(){
					'step 1'
					trigger.getParent().set('lgs_langfang_triggered',true);
					player.draw();
					'step 2'
					if(!trigger.targets.contains(player)){
						trigger.targets.push(player);
						game.log(player,'成为了',trigger.card,'的目标');
					}
				},
			},
			lgs_chengmian:{
				trigger:{player:'phaseZhunbeiBegin'},
				filter:true,
				check:function(event,player){
					if(player.isTurnedOver()) return true;
					if(player.hasSkill('lgs_zhiji')){
						if(player.storage.lgs_zhiji_damage%2==1) return true;
						if(player.countCards('h',function(card){
							return get.name(card)!='sha'&&player.hasValueTarget(card);
						})>4) return false;
						return true;
					}
					return player.countCards('h',function(card){
						return !player.hasValueTarget(card)&&get.value(card)>=4;
					}>2);
				},
				content:function(){
					'step 0'
					player.draw(3);
					'step 1'
					player.turnOver();
				},
				group:'lgs_chengmian_skip',
				subSkill:{
					skip:{
						trigger:{player:['phaseUseBefore','phaseDiscardBefore']},
						filter:function(event,player){
							return player.isTurnedOver();
						},
						direct:true,
						content:function(){
							game.log(player,'跳过了','#y'+(trigger.name=='phaseUse'?'出牌阶段':'弃牌阶段'));
							trigger.cancel();
						},
					},
				},
			},
			lgs_zhiji:{
				init:function(player){
					player.storage.lgs_zhiji_miss=0;
					player.storage.lgs_zhiji_damage=0;
				},
				mark:true,
				intro:{
					mark:function(dialog,content,player){
						dialog.addText('偷袭被闪避次数：'+player.storage.lgs_zhiji_miss);
						dialog.addText('偷袭造成伤害次数：'+player.storage.lgs_zhiji_damage);
					},
				},
				trigger:{global:'phaseZhunbeiBefore'},
				filter:function(event,player){
					return event.player.isAlive()&&lib.filter.targetEnabled({name:'sha'},player,event.player)&&(player.hasSha()||_status.connectMode&&player.countCards('h')>0);
				},
				direct:true,
				content:function(){
					player.chooseToUse(function(card,player,event){
						if(get.name(card)!='sha') return false;
						return lib.filter.filterCard.apply(this,arguments);
					},'鸷击：是否对'+get.translation(trigger.player)+'使用一张杀？').set('logSkill','lgs_zhiji').set('complexSelect',true).set('filterTarget',function(card,player,target){
						if(target!=_status.event.sourcex&&!ui.selected.targets.contains(_status.event.sourcex)) return false;
						return lib.filter.targetEnabled.apply(this,arguments);
					}).set('sourcex',trigger.player).set('lgs_zhiji',true).set('targetRequired',true);
				},
				ai:{
					effect:{
						player:function(card,player,target){
							if(_status.event.lgs_zhiji&&player.storage.lgs_zhiji_damage%2==1){
								if(player.isTurnedOver()) return [0,1];
								return [0,-4];
							}
						},
					},
				},
				group:['lgs_zhiji_miss','lgs_zhiji_damage'],
				subSkill:{
					miss:{
						trigger:{player:'shaMiss'},
						filter:function(event,player){
							return event.getParent('chooseToUse').lgs_zhiji;
						},
						direct:true,
						content:function(){
							player.storage.lgs_zhiji_miss++;
							if(player.storage.lgs_zhiji_miss%2){
								player.logSkill('lgs_zhiji');
								// player.draw(2);
								var card=get.cardPile2(function(card){
									return card.name=='sha';
								});
								if(card) player.gain(card,'gain2');
								else game.log('牌堆中已没有【杀】');
							}
						},
					},
					damage:{
						trigger:{source:'damageSource'},
						filter:function(event,player){
							return event.getParent(3).lgs_zhiji;
						},
						direct:true,
						content:function(){
							player.storage.lgs_zhiji_damage++;
							if(player.storage.lgs_zhiji_damage%2==0){
								player.logSkill('lgs_zhiji');
								player.turnOver();
							}
						},
					},
				},
			},
			lgs_shuanglun:{
				enable:'phaseUse',
				usable:1,
				filter:function(event,player){
					if(player.countCards('h')==0) return false;
					return game.hasPlayer(function(current){
						return player.canCompare(current);
					});
				},
				filterTarget:function(card,player,target){
					return player.canCompare(target);
				},
				content:function(){
					'step 0'
					player.chooseToCompare(target);
					'step 1'
					if(!result.tie){
						if(result.bool){
							if(player.canUse({name:'juedou',isCard:true},target)) 
								player.useCard({name:'juedou',isCard:true},target);
						}
						else if(target.canUse({name:'juedou',isCard:true},player)){
							target.useCard({name:'juedou',isCard:true},player);
						}
					}
				},
				ai:{
					threaten:1.3,
					order:8.8,
					result:{
						player:function(player,target){
							game.log('shuanglun-result-player-in');
							if(player.hasSkill('lgs_yanta')&&game.countPlayer(function(current){
								return get.attitude(player,current)<0&&current.countCards('h');
							})>1){
								game.log('shuanglun-result-player:',player,target);
								if(player.hp<=1&&!player.countCards('h',function(card){
									return get.name(card)=='sha'||get.number(card)>10;
								})) return -2;
								return 0;
							}else{
								if(player.countCards('h',function(card){
									return get.number(card)>10;
								})) return get.effect(target,{name:'juedou',isCard:true},player,player)-1;
								return get.effect(player,{name:'juedou',isCard:true},target,player)+1;
							}
						},
						target:function(player,target){
							game.log('shuanglun-result-target-in');
							if(player.hasSkill('lgs_yanta')&&game.countPlayer(function(current){
								return get.attitude(player,current)<0&&current.countCards('h');
							})>1){
								game.log('shuanglun-result-target:',player,target);
								game.log(get.effect(target,{name:'juedou',isCard:true},player,target));
								var num=Math.min(get.effect(target,{name:'juedou',isCard:true},player,target)+(target.countCards('h')-1)*0.5,0);
								game.log(num);
								return num;
							}
							return 0;
						},
					},
				},
			},
			lgs_yanta:{
				trigger:{global:'chooseToCompareBegin'},
				filter:function(event,player){
					if(player==event.player) return true;
					if(Array.isArray(event.targets)) return event.targets.contains(player);
					return player==event.target;
				},
				// logTarget:function(event,player){
					// if(player!=event.player) return event.player;
					// return event.targets||event.target;
				// },
				direct:true,
				content:function(){
					'step 0'
					player.chooseTarget(get.prompt('lgs_yanta'),function(card,player,target){
						if(target==player||!target.countCards('h')) return false;
						var evt=_status.event.getTrigger()
						if(Array.isArray(evt.targets)) return !evt.targets.contains(target);
						return target!=evt.target;
					},function(target){
						if(!_status.event.go) return 0;
						var player=_status.event.player
						if(get.attitude(player,target)>0) return 0;
						return 999-target.countCards('h');
					}).set('go',player.hp>1||player.countCards('h',function(card){
						return get.name(card)=='sha'||get.number(card)>10;
					})>0);
					'step 1'
					if(result.bool){
						var target=result.targets[0]
						event.target=target;
						player.logSkill('lgs_yanta',target);
						// player.line(target);
						// game.log(player,'选择用',target,'的手牌进行拼点');
						player.choosePlayerCard(target,'h',true).set('prompt','请选择'+get.translation(target)+'的一张手牌');
					}else
						event.finish();
					'step 2'
					if(!trigger.fixedResult) trigger.fixedResult={};
					var card=result.cards[0]
					trigger.fixedResult[player.playerid]=card;
					trigger.set('lgs_yanta',true);
					trigger.set('lgs_yanta_loselist',[event.target,card]);
				},
				group:'lgs_yanta_addLose',
				subSkill:{
					addLose:{
						charlotte:true,
						trigger:{global:'loseAsyncBefore'},
						filter:function(event,player){
							return event.getParent().lgs_yanta;
						},
						firstDo:true,
						forced:true,
						popup:false,
						content:function(){
							trigger.lose_list.push(trigger.getParent().lgs_yanta_loselist);
						},
					},
				},
			},
			lgs_yingcun:{
				init:function(player){
					player.storage.lgs_yingcun_targets=[];
					player.storage.lgs_yingcun_record={};
				},
				mark:true,
				intro:{
					mark:function(dialog,content,player){
						for(var target of player.storage.lgs_yingcun_targets){
							var record=player.storage.lgs_yingcun_record[target.playerid]
							dialog.addText(get.translation(target)+' 体力上限：<span class="bluetext">'+record[0]+'</span>；体力值：<span class="bluetext">'+record[1]+'</span>；手牌数：<span class="bluetext">'+record[2]+'</span>');
						}
					},
				},
				trigger:{player:'die'},
				filter:function(event,player){
					return game.hasPlayer(function(current){
						return player.storage.lgs_yingcun_targets.contains(current);
					});
				},
				direct:true,
				skillAnimation:true,
				animationColor:'wood',
				forceDie:true,
				content:function(){
					'step 0'
					player.chooseTarget('影存：是否令任意名记录角色恢复原状态？',[1,Infinity],function(card,player,target){
						return player.storage.lgs_yingcun_targets.contains(target);
					},function(target){
						var record=player.storage.lgs_yingcun_record[target.playerid];
						var effect=(Math.min(record[0],record[1])-target.hp)*2+record[2]-target.countCards('h')
						return get.sgnAttitude(player,target)*effect;
					}).set('forceDie',true);
					'step 1'
					if(result.bool){
						player.logSkill('lgs_yingcun',result.targets);
						event.targets=result.targets;
						event.targets.sort(lib.sort.seat);
					}else event.finish();
					'step 2'
					if(event.targets.length){
						var target=event.targets.shift();
						var num=player.storage.lgs_yingcun_record[target.playerid][0];
						event.currentTarget=target;
						if(target.maxHp>num)
							target.loseMaxHp(target.maxHp-num);
						if(target.maxHp<num)
							target.gainMaxHp(num-target.maxHp);
					}else event.finish();
					'step 3'
					var target=event.currentTarget;
					var num=player.storage.lgs_yingcun_record[target.playerid][1];
					if(target.hp>num)
						target.loseHp(target.hp-num);
					if(target.hp<num)
						target.recover(num-target.hp);
					'step 4'
					var target=event.currentTarget;
					var num=player.storage.lgs_yingcun_record[target.playerid][2];
					if(target.countCards('h')>num)
						target.chooseToDiscard(target.countCards('h')-num,true);
					if(target.countCards('h')<num)
						target.draw(num-target.countCards('h'));
					event.goto(2);
				},
				group:'lgs_yingcun_record',
				subSkill:{
					record:{
						trigger:{player:'phaseZhunbeiBegin'},
						filter:function(event,player){
							return game.hasPlayer(function(current){
								return current!=player&&!player.storage.lgs_yingcun_targets.contains(current);
							});
						},
						direct:true,
						content:function(){
							'step 0'
							player.chooseTarget('影存：是否记录一名未记录角色？',function(card,player,target){
								return target!=player&&!player.storage.lgs_yingcun_targets.contains(target);
							},function(target){
								if(get.attitude(player,target)>0){
									var effect=target.hp*2+target.countCards('h')
									if(effect<=3) return 0;
									return effect;
								}else if(get.attitude(player,target)<0){
									var effect=target.hp*2+target.countCards('h')
									return 5-effect;
								}else
									return 0;
							});
							'step 1'
							if(result.bool){
								var target=result.targets[0]
								player.logSkill('lgs_yingcun_record',target);
								player.storage.lgs_yingcun_targets.push(target);
								player.storage.lgs_yingcun_record[target.playerid]=[target.maxHp,target.hp,target.countCards('h')];
								game.delay();
							}
							// else event.finish();
							// 'step 2'
							// game.animate.window(1);
							// game.animate.window(2);
						},
					},
				},
			},
			lgs_fangyan: {
				init: function(player) {
					player.chat = function(str) {
						if(get.is.banWords(str)) this.logSkill('lgs_fangyan');
						lib.element.player.say.call(this,str);
						game.broadcast(function(id,str){
							if(lib.playerOL[id]){
								lib.playerOL[id].say(str);
							}
							else if(game.connectPlayers){
								for(var i=0;i<game.connectPlayers.length;i++){
									if(game.connectPlayers[i].playerid==id){
										lib.element.player.say.call(game.connectPlayers[i],str);
										return;
									}
								}
							}
						},this.playerid,str); 
					};
				},
				onremove: function(player) {
					player.chat = function(str) {
						if(get.is.banWords(str)) return;
						lib.element.player.say.call(this,str);
						game.broadcast(function(id,str){
							if(lib.playerOL[id]){
								lib.playerOL[id].say(str);
							}
							else if(game.connectPlayers){
								for(var i=0;i<game.connectPlayers.length;i++){
									if(game.connectPlayers[i].playerid==id){
										lib.element.player.say.call(game.connectPlayers[i],str);
										return;
									}
								}
							}
						},this.playerid,str); 
					};
				},
				group: ['lgs_fangyan_cao'],
				subSkill: {
					cao: {
						trigger: {player:'damage'},
						filter: true,
						firstDo: true,
						direct: true,
						content: function() {
							player.chat('艹');
						},
					},
				},
			},  // get.is.banWords
			lgs_ezuo: {
				audio:'shefu',
				init: function(player) {
					player.storage.lgs_ezuo = [];
					player.storage.lgs_ezuo_usable = 2;
					player.storage.lgs_ezuo_zhong = 0;
				},
				// mark:true,
				marktext: '机关',
				intro: {
					name: '机关',
					mark: function(dialog, content, player) {
						if(player.isUnderControl) {
							for(var pair of player.storage.lgs_ezuo)
								dialog.addText(get.translation(pair[0]) + ' - ' + get.translation(pair[1]));
						} else
							dialog.addText('当前拥有<span class="bluetext">' + player.storage.lgs_ezuo.length + '</span>张“机关”');
						dialog.addText('触发“机关”次数：<span class="bluetext">' + player.storage.lgs_ezuo_zhong + '</span>');
					}
				},
				enable: 'phaseUse',
				filter: function(event, player) {
					return player.storage.lgs_ezuo_usable && player.countCards('h')
					&& (player.storage.lgs_ezuo.length || game.hasPlayer(function(current) {
						for(var pair of player.storage.lgs_ezuo)
							if(pair[1] == current)
								return false;
						return true;
					}));
				},
				direct: true,
				delay: false,
				content: function() {
					'step 0'
					// ai
					var setNew = false, getTargetTrick = function(target) {
						for(var pair of player.storage.lgs_ezuo)
							if(pair[1] == target)
								return pair[0];
						return null;
					}
					var mvTarget, mv = 0, trick
					game.countPlayer(function(current) {  // 在敌人中寻找适合设杀的目标
						if(get.attitude(player, current) >= 0) return;
						var temptrick = getTargetTrick(current)
						if(temptrick && temptrick.name == 'sha') return;
						var effect = Math.max(current.getUseValue({name: 'sha'}), 0.1)
						if(!mvTarget || effect > mv) {
							mv = effect; mvTarget = current; trick = temptrick;
						}
					});
					// game.log('ezuo-ai-mv ', mv);
					// game.log('ezuo-ai-mvTarget ', mvTarget);
					var hs = player.getCards('h'), ss
					ss = hs.filter(function(current) {return current.name == 'sha'});
					// game.log('ezuo-ai-ss ', ss);
					if(ss.length && mv > 0) {  // 可设杀
						ss.sort(function(a, b) {return get.value(a) > get.value(b)});
						event.aicard = ss[0];
						if(!trick) {  // 设置新机关
							setNew = true;
							event.aitarget = mvTarget;
						} else  // 替换原机关
							event.toReplace = trick;
					} else {  
						// 富余手牌设置或替换
						// 寻找最小价值牌
						var targets, temp
						if(hs.length <= player.getHandcardLimit()) {
							event.stop = true;
						} else {
							hs = hs.sort(function(a, b) {return get.value(a) < get.value(b)}).slice(player.getHandcardLimit());
							game.log('ezuo-ai-hs ', hs);
							// event.aicard = hs[0];
							for(var card of hs) {
								if(get.type(hs[0]) == 'equip' || ['taoyuan', 'wanjian'].contains(hs[0].name)) {
									// 设置新机关；直接设此牌；优先从自己人中选
									setNew = true;
									event.aicard = card;
									targets = game.filterPlayer(function(current) {
										return get.attitude(player, current) >= 0 && !getTargetTrick(current);
									});
									if(!targets.length)
										targets = game.filterPlayer(function(current) {
											return get.attitude(player, current) < 0 && !getTargetTrick(current);
										});
									event.aitarget = targets[0];
									break;
								} else {
									// 从非友人中选；优先设置新机关
									targets = game.filterPlayer(function(current) {return get.attitude(player, current) <= 0});
									temp = targets.filter(function(current) {return !getTargetTrick(current)});
									if(temp.length) {
										setNew = true;
										event.aicard = card;
										event.aitarget = temp[0];
										break;
									} else {
										var tricks=[]
										for(var target of targets)
											tricks.push(getTargetTrick(target));
										tricks.sort(function(a, b) {return get.value(a) < get.value(b)});
										if(tricks[0].name == 'sha'){
											event.stop = true;
											break;
										} else if(get.value(card) > get.value(tricks[0])) {
											event.aicard = card;
											event.toReplace = tricks[0];
											break;
										}
									}
								}
							}
						}
					}
					if(!event.aicard)
						event.stop = true;
					// game.log('ezuo-ai-setNew ', setNew);
					// game.log('ezuo-aicard ', event.aicard);
					// game.log('ezuo-aitarget ', event.aitarget);
					// game.log('ezuo-ai-toReplace ', event.toReplace);
					// game.log('ezuo-ai-stop ', event.stop);
					
					// end ai
					
					var list = []
					if(game.hasPlayer(function(current) {
						for(var pair of player.storage.lgs_ezuo)
							if(pair[1] == current)
								return false;
						return true;
					})) list.push('布置新机关');
					if(player.storage.lgs_ezuo.length)
						list.push('替换原机关');
					if(list.length == 2)
						player.chooseControl(list).set('ai', function() {
							return (_status.event.setNew ? 0 : 1);
						}).set('setNew', setNew);
					else if(list.length)
						event.goto(list[0] == '布置新机关' ? 2 : 5);
					else event.finish();
					'step 1'
					if(result.index == 1) event.goto(5);
					'step 2'
					// game.log('ezuo-chooseCardTarget');
					player.chooseCardTarget({
						prompt: '恶作：选择一张手牌作为机关，并选择目标',
						filterCard: true,
						position: 'h',
						filterTarget: function(card, player, target) {
							for(var pair of player.storage.lgs_ezuo)
								if(pair[1] == target)
									return false;
							return true;
						},
						animate:false,
						ai1: function(card) {
							if(_status.event.stop) return 0;
							if(card == _status.event.aicard) return 1;
							return 0;
						},
						ai2: function(target) {
							if(target == _status.event.aitarget) return 1;
							return 0;
						},
					}).set('aicard', event.aicard).set('aitarget', event.aitarget);
					'step 3'
					if(result.bool) {
						var card = result.cards[0];
						event.card = card; event.target = result.targets[0];
						player.logSkill('lgs_ezuo');
						player.storage.lgs_ezuo_usable--;
						player.addToExpansion(card, player, 'giveAuto').gaintag.add('lgs_ezuo');
					} else
						event.finish();
					'step 4'
					if(player.getExpansions('lgs_ezuo').contains(event.card)) {
						player.storage.lgs_ezuo.push([event.card, event.target]);
						player.syncStorage('lgs_ezuo');
						player.markSkill('lgs_ezuo');
					}
					event.finish();
					'step 5'
					var lst = ['恶作',
						'你的“机关”', player.getExpansions('lgs_ezuo'), 
						'你的手牌', player.getCards('h'),
					'hidden'];
					var dialog = ui.create.dialog.apply(this, lst);
					_status.dieClose.push(dialog);
					// dialog.videoId = lib.status.videoId++;
					if(player!=game.me || _status.auto)
						event.dialog.style.display = 'none';
					for(var i=0; i < dialog.buttons.length; i++)
						if(get.position(dialog.buttons[i].link) == 'x')
							for(var pair of player.storage.lgs_ezuo)
								if(pair[0] == dialog.buttons[i].link) {
									dialog.buttons[i].querySelector('.info').innerHTML = function(target) {
										if(target._tempTranslate) return target._tempTranslate;
										var name = target.name;
										if(lib.translate[name + '_ab']) return lib.translate[name + '_ab'];
										return get.translation(name);
									}(pair[1]);
									break;
								}
					// game.log('ezuo-chooseButton');
					player.chooseButton(2).set('filterButton', function(button) {
						if(!ui.selected.buttons.length) return true;
						if(get.position(ui.selected.buttons[0].link) == 'x') return get.position(button.link) != 'x';
						return get.position(button.link) == 'x';
					}).set('dialog', dialog).set('closeDialog', true).set('ai', function(button) {
						if(_status.event.stop) return 0;
						if(button.link == _status.event.toReplace || button.link == _status.event.aicard) return 1;
						return 0;
					}).set('toReplace', event.toReplace).set('aicard', event.aicard);
					'step 6'
					if(result.bool) {
						var push = result.links[0], gain = result.links[1];
						if(get.position(push) == 'x') {
							push = result.links[1];
							gain = result.links[0];
						}
						event.card = push; event.origin = gain;
						player.logSkill('lgs_ezuo');
						player.storage.lgs_ezuo_usable--;
						player.addToExpansion(push, 'giveAuto', player).gaintag.add('lgs_ezuo');
						player.gain(gain, 'giveAuto');
					} else
						event.finish();
					'step 7'
					if(player.getExpansions('lgs_ezuo').contains(event.card)) {
						for(var pair of player.storage.lgs_ezuo)
							if(pair[0] == event.origin)
								pair[0] = event.card;
						player.syncStorage('lgs_ezuo');
					}
				},
				ai:{
					order: function(item, player) {
						// 有效果可观（可设杀）目标时，先于杀发动
						if(player.countCards('h', 'sha') && game.hasPlayer(function(current) {
							if(get.attitude(player, current) >= 0) return false;
							for(var pair of player.storage.lgs_ezuo){
								if(pair[1] == current && pair[0].name == 'sha') return false;
							}
							return true;
						})){
							return get.order({name:'jiu'})+0.1;
						}
						// 无可观目标时，最后检查是否发动
						// game.log('ezuo-order-0.1');
						return 0.1;
					},
					result: {
						player: function(player, target) {
							// 有可设杀目标时，发动
							if(player.countCards('h', 'sha') && game.hasPlayer(function(current) {
								if(get.attitude(player, current) >= 0) return false;
								for(var pair of player.storage.lgs_ezuo)
									if(pair[1] == current && pair[0].name == 'sha')
										return false;
								return true;
							})) {
								return 1;
							}
							// 无可设杀目标时，最后检查是否发动
							else if(player.needsToDiscard()){
								// 检查多余牌中是否有牌的价值大于机关中的最小价值，或是否有可放心设置的牌
								var hs = player.getCards('h'), tricks=[]
								hs = hs.sort(function(a, b) {return get.value(a) < get.value(b)}).slice(player.getHandcardLimit());
								// game.log('ezuo-result-hs ', hs);
								for(var pair of player.storage.lgs_ezuo)
									if(get.attitude(player, pair[1]) < 0)
										tricks.push(pair[0]);
								tricks.sort(function(a, b) {return get.value(a) > get.value(b)});
								// game.log('ezuo-result-tricks ', tricks);
								var minValue=0
								if(tricks.length){
									if(tricks[0].name == 'sha') return 0;
									minValue = get.value(tricks[0])
								}
								for(var card of hs) {
									// game.log('ezuo-result-card ', card)
									if(get.type(card) == 'equip' || ['taoyuan', 'wanjian'].contains(card.name)) return 1;  // 有可放心设置的牌
									if(get.value(card) > minValue) return 1;
								}
							}
							return 0;
						},
					},
				},
				group: ['lgs_ezuo_reusable', 'lgs_ezuo_zhong'],
				subSkill: {
					reusable: {
						charlotte: true,
						trigger: {player: 'phaseUseAfter'},
						firstDo: true,
						forced: true,
						popup: false,
						content: function() {
							player.storage.lgs_ezuo_usable = 2;
						},
					},
					zhong: {
						trigger: {global:'useCard'},
						filter: function(event, player) {
							for(var pair of player.storage.lgs_ezuo)
								if(pair[1] == event.player && pair[0].name == event.card.name)
									return true;
							return false;
						},
						forced: true,
						locked: false,
						logTarget: 'player',
						content: function() {
							'step 0'
							game.delayx();
							player.storage.lgs_ezuo_zhong++;
							for(var i = 0; i < player.storage.lgs_ezuo.length; i++) {
								var pair = player.storage.lgs_ezuo[i]
								if(pair[1] == trigger.player && pair[0].name == trigger.card.name) {
									player.loseToDiscardpile(pair[0]);
									player.storage.lgs_ezuo.splice(i, 1);
									player.syncStorage('lgs_ezuo');
									break;
								}
							}
							'step 1'
							if(trigger.targets && trigger.targets.length && game.hasPlayer(function(current) {
								return !trigger.targets.contains(current) && lib.filter.targetEnabled2(trigger.card, trigger.player, current);
							}))
								player.chooseControl(['令牌无效', '转移目标']).set('ai',function() {
									if(trigger.cards.length) return 0;
									return 1;
								}).set('prompt', '恶作：如何处理' + get.translation(trigger.player) + '使用的' + get.translation(trigger.card) + '？');
							else
								event.goto(3);
							'step 2'
							if(result.index == 1)
								event.goto(4);
							'step 3'
							trigger.cancel();
							game.log(player, '令', trigger.card, '无效');
							if(trigger.cards.length)
								player.gain(trigger.cards, 'gain2');
							event.finish();
							'step 4'
							if(trigger.targets.length > 1){
								player.chooseTarget('恶作：请转移' + get.translation(trigger.card) + '的一个目标', 2, true, function (card, player, target) {
									var trigger = _status.event.getTrigger();
									if (ui.selected.targets.length) return !trigger.targets.contains(target) && lib.filter.targetEnabled2(trigger.card, trigger.player, target);
									return trigger.targets.contains(target);
								}, function (target) {
									// game.log('ezuo-chooseTarget-target:', target);
									var trigger = _status.event.getTrigger(),player=_status.event.player
									// game.log('selectedTarget:',ui.selected.targets.length);
									var effect;
									if (ui.selected.targets.length) effect = get.effect(target, trigger.card, trigger.player, player);
									else effect = -get.effect(target, trigger.card, trigger.player, player);
									return effect;
								}).set('targetprompt', ['取消目标','成为目标']);
							} else
								player.chooseTarget('恶作：请选择要将' + get.translation(trigger.card) + '转移给的目标', true, function(card, player, target){
									return !trigger.targets.contains(target) && lib.filter.targetEnabled2(trigger.card, trigger.player, target);
								}, function (target) {
									var trigger = _status.event.getTrigger();
									return get.effect(target, trigger.card, trigger.player, _status.event.player);
								});
							'step 5'
							if(trigger.targets.length == 1) {
								if(trigger.targets[0] == player)
									player.line(result.targets[0]);
								else
									player.line2([trigger.targets[0], result.targets[0]]);
								trigger.targets[0] = result.targets[0];
							} else {
								if(result.targets[0] == player)
									player.line(result.targets[1]);
								else
									player.line2(result.targets);
								trigger.targets.remove(result.targets[0]);
								trigger.targets.push(result.targets[1]);
							}
						},
					},
					// draw: {
						// trigger: {global: 'phaseAfter'},
						// filter: true,
						// direct: true,
						// content: function() {
							// 'step 0'
							// if(player.storage.lgs_ezuo_zhong > 1){
								// player.logSkill('lgs_ezuo');
								// player.draw(player.storage.lgs_ezuo_zhong);
							// }else
								// event.goto(2);
							// 'step 1'
							// player.storage.lgs_ezuo_draw += result.length;
							// 'step 2'
							// player.storage.lgs_ezuo_zhong = 0;
						// },
					// },
				},
			},
			lgs_tuqiang: {
				juexingji: true,
				skillAnimation: true,
				trigger: {player: 'phaseZhunbeiBegin'},
				filter: function(event, player) {
					return player.storage.lgs_ezuo_zhong >= game.countPlayer();
				},
				forced: true,
				unique: true,
				content: function() {
					'step 0'
					player.storage.lgs_ezuo.length = 0;
					player.gain(player.getExpansions('lgs_ezuo'), 'giveAuto');
					'step 1'
					player.removeSkill('lgs_ezuo');
					player.gainMaxHp();
					'step 2'
					player.recover(player.maxHp - player.hp);
					'step 3'
					player.addSkillLog('keji');
					player.awakenSkill('lgs_tuqiang');
				},
				ai:{
					combo: 'lgs_ezuo',
				},
			},
			lgs_xingxi:{
				trigger:{
					player:'phaseBegin',
				},
				direct:true,
				content:function () {
					'step 0'
					if(player.isDamaged())
						player.chooseControl('cancel2').set('choiceList',['失去1点体力，并于结束阶段回复1点体力','回复1点体力，并于结束阶段失去1点体力']).set('prompt',get.prompt('lgs_xingxi')).set('ai',function(){
							game.log('xingxi-ai-in');
							var player=_status.event.player;
							if(!player.hasSkill('lgs_bomie')) return 1;
							if(player.hp==1&&(!player.countCards('h','sha')||!player.hasValueTarget('sha'))) return 1;
							var effect1=0,effect=player.getUseValue('sha'),effect2=0;
							var hp1=player.hp-1,hp2=player.hp+1;
							for(var current of game.filterPlayer()){
								if(!player.canUse('sha',current)) continue;
								var effect1_=get.effect(current,{name:'shacopy',isCard:true},player,player),effect2_=effect_1;
								if(hp1>0){
									if(hp1<current.hp) effect1_+=Math.max(0,player.countCards('h','sha')-1);
									else if(hp1==current.hp) effect1_+=hp1;
									else if(hp1>current.hp&&get.attitude(player,current)<0) effect1_+=1;
									if(effect1_>effect1) effect1=effect1_;
								}
								if(hp2<current.hp) effect2_+=Math.max(0,player.countCards('h','sha')-1);
								else if(hp2==current.hp) effect2_+=hp2;
								else if(hp2>current.hp&&get.attitude(player,current)<0) effect2_+=1;
								if(effect2_>effect2) effect2=effect2_;
								game.log('current:',current,' effect1:',effect1,' effect1_:',effect1_,' effect2:',effect2,' effect2_:',effect2_);
							}
							effect2+=0.5;
							game.log('effect1:',effect1,' effect:',effect,' effect2:',effect2);
							if(effect1>effect2){
								if(effect1>effect) return 0;
								return 'cancel2';
							}else{
								if(effect2>=effect) return 1;
								return 'cancel2';
							}
						});
					else{
						player.chooseBool('是否发动【性喜】，失去1点体力，并于结束阶段回复1点体力？').set('ai',function(){
							game.log('xingxi-ai-in');
							var player=_status.event.player;
							if(!player.hasSkill('lgs_bomie')) return false;
							if(player.hp==1) return false;
							var effect1=0,effect=player.getUseValue('sha'),hp1=player.hp-1;
							for(var current of game.filterPlayer()){
								if(!player.canUse('sha',current)) continue;
								var effect1_=get.effect(current,{name:'shacopy',isCard:true},player,player);
								if(hp1<current.hp) effect1_+=Math.max(0,player.countCards('h','sha')-1);
								else if(hp1==current.hp) effect1_+=hp1;
								else if(hp1>current.hp&&get.attitude(player,current)<0) effect1_+=1;
								if(effect1_>effect1) effect1=effect1_;
								game.log('current:',current,' effect1:',effect1,' effect1_:',effect1_);
							}
							game.log('effect1:',effect1,' effect:',effect);
							return effect1>effect;
						});
						event.goto(2)
					}
					'step 1'
					if(result.control!='cancel2'){
						player.logSkill('lgs_xingxi');
						if(result.index==0) event.goto(3);
						else event.goto(4)
					}
					'step 2'
					if(result.bool)
						player.logSkill('lgs_xingxi');
					else
						event.finish();
					'step 3'
					player.loseHp();
					player.addTempSkill('lgs_xingxi_0');
					event.finish();
					'step 4'
					player.recover();
					player.addTempSkill('lgs_xingxi_1');
				},
				subSkill:{
					"0":{
						trigger:{
							player:"phaseJieshuBegin",
						},
						forced:true,
						charlotte:true,
						content:function(){
							player.recover(1);
						},
						sub:true,
					},
					"1":{
						trigger:{
							player:"phaseJieshuBegin",
						},
						forced:true,
						charlotte:true,
						content:function(){
							player.loseHp();
						},
						sub:true,
					},
				},
			},
			lgs_bomie:{
				trigger:{
					player:"useCardToPlayered",
				},
				usable:1,
				filter:function(event,player){
					return event.card.name=='sha';  // &&!event.getParent().directHit.contains(event.target);
				},
				check:function(event,player){
					if(player.hp>event.target.hp) return get.attitude(player,event.target)<0;
					return true;
				},
				logTarget:'target',
				content:function(){
					'step 0'
					player.storage.X = trigger.target.hp;
					if(player.storage.X > player.hp){//本回合你的手牌上限+X，与其他角色距离减X，可以多出X张杀
						player.addTempSkill('lgs_bomie_0');
					}
					else if(player.storage.X == player.hp){//你摸X张牌
						player.draw(player.storage.X)
					}
					else if(player.storage.X < player.hp){//其抵消此杀需要多出X张闪。
						var id=trigger.target.playerid;
						var map=trigger.getParent().customArgs;
						if(!map[id]) map[id]={};
						if(typeof map[id].shanRequired=='number'){
							map[id].shanRequired+=player.storage.X;
						}
						else{
							map[id].shanRequired=player.storage.X+1;
						}
					}                                                            
				},
				ai:{
					effect:{
						player:function(card,player,target){
							if(get.name(card)=='sha'){
								if(player.hp==target.hp) return [1,player.hp];
								if(player.hp>target.hp&&get.attitude(player,target)<0) return [1,1];
								if(player.hp<target.hp) return [1,Math.max(0,player.countCards('h','sha')-1)];
							}
						}
					}
				},
				subSkill:{
					"0":{
						mod:{
							targetInRange:function(card){
								if(card.name=='sha') return true;
							},
							cardUsable:function(card,player,num){
								if(card.name=='sha') return num+player.storage.X;
							},
						},	
					},
				},
			},
			lgs_zhenji:{
				trigger:{global:'useCardToTarget'},
				filter:function(event,player){
					if(event.parent.triggeredTargets2.length>1) return false;
					return !player.hasSkill('lgs_zhenji_block')&&event.targets.length>1;
				},
				direct:true,
				content:function(){
					'step 0'
					// ai
					var go=true,effects=[]
					for(var target of trigger.targets)
						if(!trigger.excluded.contains(target))
							effects.push([target,get.effect(target,get.copyBySkill(trigger.card,'lgs_zhenji'),trigger.player,player)]);
					if(effects.length==1)
						go=false;
					else{
						effects.sort(function(a,b){return a[1]<b[1]});
						var totalEffect=0
						for(var i=1;i<effects.length;i++)
							totalEffect+=effects[i][1];
						if(totalEffect>=effects[0][1])
							go=false;
					}
					game.logResult(effects);
					game.log(go,' ',totalEffect);
					// end ai
					player.chooseTarget('镇纪：你可以为'+get.translation(trigger.card)+'保留一个目标，并取消其他目标',function(card,player,target){
						var trigger=_status.event.getTrigger()
						return trigger.targets.contains(target);
					},function(target){
						if(target==_status.event.aitarget) return 1;
						return 0;
					}).set('aitarget',(go?effects[0][0]:null));
					'step 1'
					if(result.bool){
						player.logSkill('lgs_zhenji',result.targets);
						player.addTempSkill('lgs_zhenji_block');
						for(var target of trigger.targets)
							if(target!=result.targets[0])
								trigger.excluded.add(target);
					}
				},
				ai:{
					effect:{
						player:function(card,player,target){
							if(player.hasSkill('lgs_zhenji_block')) return;
							if(get.select(get.info(card).selectTarget)[0]>-1) return;
							if(card.lgs_zhenji_copy) return;
							var cardx=get.copyBySkill(card,'lgs_zhenji');
							if(get.effect(target,cardx,player,player)>=0) return;  // 仅将对自己不利的目标选择置0；
							var targets=game.filterPlayer(function(current){  // 获取所有合法目标
								return player.canUse(card,current);
							})
							if(targets.length<2) return;  // 目标数须>1
							for(var current of targets){
								if(get.effect(current,cardx,player,player)>=0)
									return [1,0,0,0];  // 若存在有利的目标，则当前的不利目标选择置0
							}
						},
						target:function(card,player,target){
							if(target.hasSkill('lgs_zhenji_block')) return;
							if(target==player) return;
							if(get.select(get.info(card).selectTarget)[0]>-1) return;
							var targets=game.filterPlayer(function(current){  // 获取所有合法目标
								return player.canUse(card,current);
							})
							if(targets.length<2) return;  // 目标数须>1
							if(card.lgs_zhenji_copy) return;
							var cardx=get.copyBySkill(card,'lgs_zhenji');
							for(var current of targets)
								if(get.effect(current,cardx,player,player)<=0)
									return [1,0,1,-99];  // 若存在对使用者不利的目标，则使用者不使用
						}
					}
				},
				subSkill:{
					block:{charlotte:true},
				},
			},
			lgs_xinxing:{
				init:function(player){
					player.storage.lgs_xinxing=[];
					player.storage.lgs_xinxing2=[];
				},
				mark:true,
				intro:{
					markcount:()=>0,
					mark:function(dialog,content,player){
						var list=[],list2=[]
						for(var name of lib.inpile){
							if(get.type(name)=='equip') continue;
							if(player.storage.lgs_xinxing.contains(name))
								list.push(get.translation(name));
							else
								list2.push(get.translation(name));
							if(name=='sha'){
								for(var nature of lib.inpile_nature){
									if(player.storage.lgs_xinxing2.contains(nature))
										list.push(get.translation({name:name,nature:nature}));
									else
										list2.push(get.translation({name:name,nature:nature}));
								}
							}
						}
						dialog.addText('已使用牌：');
						if(list.length){
							var str=''
							for(var i=0;i<list.length;i++){
								str+=get.translation(list[i]);
								if(i<list.length-1){
									str+='、';
								}
							}
							dialog.addText(str);
						}else
							dialog.addText('无');
						dialog.addText('未使用牌：');
						if(list2.length){
							var str=''
							for(var i=0;i<list2.length;i++){
								str+=get.translation(list2[i]);
								if(i<list2.length-1){
									str+='、';
								}
							}
							dialog.addText(str);
						}else
							dialog.addText('无');
					},
				},
				hiddenCard:function(player,name){
					if(lib.inpile.contains(name)&&!player.storage.lgs_xinxing.contains(name)) return true;
				},
				enable:'chooseToUse',
				filter:function(event,player){
					if(event.type=='wuxie') return false;  // 向现实妥协T_T
 					if(event.responded) return false;
					if(player.hasSkill('lgs_xinxing_block')||!player.countCards('hej')) return false;
					for(var i of lib.inpile){
						if(get.type(i)!='basic'&&get.type(i,'trick')!='trick') continue;
						if(player.storage.lgs_xinxing.contains(i)) continue;
						for(cardx of player.getCards('hej')){
							var card=get.autoViewAs({name:i,storage:{lgs_xinxing:true}},[cardx]);
							if(event.filterCard(card,player,event)&&(lib.card[i].notarget||game.hasPlayer(function(current){
								return event.filterTarget(card,player,current);
							})))
								return true;
						}
						if(i=='sha')
							for(var j of lib.inpile_nature){
								if(player.storage.lgs_xinxing2.contains(j)) continue;
								for(var cardx of player.getCards('hej')){
									var card=get.autoViewAs({name:i,nature:j,storage:{lgs_xinxing:true}},[cardx])
									if(event.filterCard(card,player,event)&&(lib.card[i].notarget||game.hasPlayer(function(current){
										return event.filterTarget(card,player,current);
									})))
										return true;
								}
							}
					}
					return false;
				},
				delay:false,
				direct:true,
				popname:true,
				content:function(){
					'step 0'
					game.log('lgs_xinxing-in');
					// var evt=event;
					// game.log('evt:'+evt.name);
					// var evt1=evt.getParent(1),evt2=evt.getParent(2),evt3=evt.getParent(3),evt4=evt.getParent(4),evt5=evt.getParent(5);
					// game.log('evt1.name:'+evt1.name);
					// game.log('evt2.name:'+evt2.name);
					// game.log('evt3.name:'+evt3.name);
					// game.log('evt4.name:'+evt4.name);
					// game.log('evt5.name:'+evt5.name);
					var evt=event.getParent(2);
					if(evt.parent.name=='jiedao')  // 借刀杀人的chooseToUse事件filterTarget用到_status.event，需更改
						evt.filterTarget=function(card,player,target){
							if(target!=evt.sourcex&&!ui.selected.targets.contains(evt.sourcex)) return false;
							return lib.filter.filterTarget.apply(this,arguments);
						}
					evt.goto(0);
					
					// 获取可转化牌方案列表
					var list=[];
					for(var i of lib.inpile){
						if(player.storage.lgs_xinxing.contains(i)) continue;
						if(get.type(i)!='basic'&&get.type(i,'trick')!='trick') continue;
						for(var cardx of player.getCards('hej')){
							var card=get.autoViewAs({name:i,storage:{lgs_xinxing:true}},[cardx]),enable=true;
							if(!evt.filterCard(card,player,evt)) enable=false;
							else if(!lib.card[i].notarget&&!game.hasPlayer(function(current){
								return evt.filterTarget(card,player,current);
							})) enable=false;
							if(enable)
								list.push(card);
						}
						if(i=='sha')
							for(var j of lib.inpile_nature){
								if(player.storage.lgs_xinxing2.contains(j)) continue;
								for(var cardx of player.getCards('hej')){
									var card=get.autoViewAs({name:i,nature:j,storage:{lgs_xinxing:true}},[cardx]),enable=true;
									if(evt.filterCard(card,player,evt)&&(lib.card[i].notarget||game.hasPlayer(function(current){
										return evt.filterTarget(card,player,current);
									})))
										list.push(card);
								}
							}
					}
					_status.event=event;
					game.log('list:',list);
					// 随机选取可用牌
					var cardx
					if(list.length)
						cardx=list.randomGet();
					if(!cardx){
						event.finish();
						return;
					}
					event.cardx=cardx;
					event.card=cardx.cards[0];
					game.log('cardx:');
					game.logResult(cardx);
					// 获取可用目标
					var info=get.info(cardx),range;
					if(!info.notarget){
						var select=get.copy(info.selectTarget);
						if(select==undefined){
							range=[1,1];
						}
						else if(typeof select=='number') range=[select,select];
						else if(get.itemtype(select)=='select') range=select;
						else if(typeof select=='function') range=select(cardx,player);
						game.checkMod(cardx,player,range,'selectTarget',player);
					}else{
						event.goto(2);
					}
					game.log(range);
					if(info.toself||range[0]<=-1&&range[0]==range[1]){
						event.targets=game.filterPlayer(function(current){
							return evt.filterTarget(cardx,player,current);
							// return player.canUse(cardx,current,true);
						});
						event.goto(2);
					}else{
						player.chooseCardTarget({
							prompt:'请选择'+get.translation(cardx)+'的目标',
							filterCard:function(card){
								return card==_status.event.getParent().card;
							},
							position:'he',
							selectCard:-1,
							filterTarget:function(card,player,target){
								return evt.filterTarget(cardx,player,target);
							},
							selectTarget:range.slice(0),
							ai2:function(target){
								var cardx=_status.event.parent.cardx,player=_status.event.player
								return get.effect(target,cardx,player,player);
							},
							forced:true,
						});
					}
					'step 1'
					if(result.bool&&result.targets.length){
						event.targets=result.targets.slice(0);
					}else
						event.finish();
					'step 2'
					var evt=event.getParent(2),cardx=event.cardx;
					// if(player.storage.lgs_xinxing_record){
						// evt=player.storage.lgs_xinxing_record;
						// game.log('evt=record:',evt.name);
					// }
					// game.log('xinxing-step2-cardx:');
					// game.logResult(cardx);
					if(evt.name=='_wuxie'){
						evt.wuxieresult=player;
						evt.wuxieresult2={
							bool:true,
							confirm:'ok',
							links:true,
							button:[],
							skill:'lgs_xinxing',
							card:{
								name:cardx.name,
								suit:card.suit,
								number:card.number,
								cards:[card],
								storage:{lgs_xinxing:true},
							},
							cards:[card],
						};
					}
					else{
						evt.result={
							bool:true,
							confirm:'ok',
							links:true,
							button:[],
							skill:'lgs_xinxing',
							card:{
								name:cardx.name,
								suit:card.suit,
								number:card.number,
								cards:[card],
								storage:{lgs_xinxing:true},
							},
							cards:[card],
						};
					}
					// game.log('xinxing-step2-result:');
					// event.logResult(evt.result);
					// evt.result.used=evt.result.card;
					if(cardx.nature){
						evt.result.card.nature=cardx.nature;
						player.storage.lgs_xinxing2.push(cardx.nature);
					}else
						player.storage.lgs_xinxing.push(cardx.name);
					if(event.targets&&event.targets.length)
						evt.result.targets=event.targets.slice(0);
					evt.set('logSkill','lgs_xinxing');
					evt.goto(4);
					
					var list=lib.inpile.filter(function(name){
						return get.type(name)!='equip';
					}),list2=lib.inpile_nature.slice(0);
					list.removeArray(player.storage.lgs_xinxing);
					list2.removeArray(player.storage.lgs_xinxing2);
					if(!list.length&&!list2.length){
						player.storage.lgs_xinxing=[];
						player.storage.lgs_xinxing2=[];
					}
					
					if(evt.parent.name=='jiedao')  // 将借刀杀人的chooseToUse事件filterTarget改回，防止错误
						evt.filterTarget=function(card,player,target){
							if(target!=_status.event.sourcex&&!ui.selected.targets.contains(_status.event.sourcex)) return false;
							return lib.filter.filterTarget.apply(this,arguments);
						}
				},
				mod:{
					cardUsable:function(card){
						if(card.storage&&card.storage.lgs_xinxing) return Infinity;
					},
				},
				group:['lgs_xinxing_draw','lgs_xinxing_record'],
				subSkill:{
					draw:{
						trigger:{player:'useCard'},
						filter:function(event,player){
							if(!event.card.storage||!event.card.storage.lgs_xinxing) return false;
							return player.getHistory('lose',function(evt){
								return evt.getParent()==event&&!evt.hs.length;
							}).length;
						},
						forced:true,
						popup:false,
						content:function(){
							player.draw();
							player.addTempSkill('lgs_xinxing_block');
						},
					},
					record:{
						charlotte:true,
						trigger:{player:'chooseToUseBegin'},
						filter:true,
						forced:true,
						popup:false,
						content:function(){
							player.storage.lgs_xinxing_record=trigger;
						},
					},
					block:{charlotte:true},
				},
				ai:{
					effect:{
						target:function(card,player,target,effect){
							if(get.tag(card,'respondShan')) return 0.7;
							if(get.tag(card,'respondSha')) return 0.7;
						}
					},
					order:1,
					respondSha:true,
					respondShan:true,
					skillTagFilter:function(player,tag,arg){
						if(tag=='respondShan') return !player.storage.lgs_xinxing.contains('shan');
						if(tag=='respondSha') return !player.storage.lgs_xinxing.contains('sha')||player.storage.lgs_xinxing2.length<2;
					},
					noautowuxie:true,
					result:{
						player:function(player){
							if(_status.event.dying) return get.attitude(player,_status.event.dying);
							return 1;
						}
					}
				}
			},
			lgs_linhan:{
				enable:'chooseToUse',
				viewAs:{
					name:'wuxie',
				},
				filterCard:true,
				viewAsFilter:function(player){
					// game.log(_status.event.name);
					return true;
				},
				group:'lgs_linhan_show',
				subSkill:{
					show:{
						trigger:{player:'useCardBefore'},
						filter:true,
						direct:true,
						content:function(){
							// evt=trigger.getParent('chooseToUse');
							// game.log(evt.name);
							// game.log(evt.result);
							// game.log(get.itemtype(result.targets[0]))
							var logResult=function(result,space){
								space=space||'';
								if(Array.isArray(result)){
									game.log(space+'_array');
									for(var item of result)
										logResult(item,space);
								}else if(get.is.object(result)){
									for(var key in result){
										game.log(space,key);
										logResult(result[key],space+'--');
									}
								}else
									game.log(space,result);
							}
							// logResult(evt.result);
						},
					},
				},
			},
			lgs_tuxi:{
				audio:"retuxi",
				trigger:{
					player:"phaseDrawBegin2",
				},
				direct:true,
				preHidden:true,
				filter:function(event,player){
					return event.num>0&&!event.numFixed&&game.hasPlayer(function(target){
						return target.countCards('h')>0&&player!=target;
					});
				},
				content:function (){
					"step 0"
					var num=get.copy(trigger.num);
					if(get.mode()=='guozhan'&&num>2) num=2;
					player.chooseTarget(get.prompt('lgs_tuxi'),'获得至多'+get.translation(num)+'名角色一张手牌并与其谋弈',[1,num],function(card,player,target){
						return target.countCards('h')>0&&player!=target;
					},function(target){
						var att=get.attitude(_status.event.player,target);
						if(target.hasSkill('tuntian')||target.hasSkill('retuntian')||target.hasSkill('oltuntian')) return att/10;
						return 1-att;
					}).setHiddenSkill('lgs_tuxi');
					"step 1"
					if(result.bool){
						result.targets.sortBySeat();
						event.targets=result.targets.slice(0);
						player.logSkill('lgs_tuxi',result.targets);
						trigger.num-=result.targets.length;
					}
					else{
						event.finish();
					}
					"step 2"
					var target=targets.shift()
					event.target=target;
					player.gainPlayerCard(target,'h',true);
					"step 3"
					var next=player.chooseControl('披甲陷阵','断桥奇袭').set('choiceList',[
						'【披甲陷阵】你有机会令'+get.translation(target)+'弃置1张牌',
						'【断桥奇袭】你有机会令'+get.translation(target)+'获得“惊”标记',
					]);
					next.set('prompt', '谋弈：请选择你的进攻策略');
					next.set('ai', function(){
						var player=_status.event.getParent().player,target=_status.event.getParent().target
						if(get.attitude(player,target)>2) return 1; 
						if (target.countCards('he')<=0) return 1;
						return [0,1].randomGet();
					});
					'step 4'
					event.res=result.index;
					var next=target.chooseControl('登高围敌','蹴马趋津').set('choiceList',[
						'【登高围敌】防止弃牌',
						'【蹴马趋津】防止获得“惊”标记'
					]);
					next.set('prompt', '谋弈：请选择你的防御策略');
					next.set('ai', function(){
						var player=_status.event.getParent().target,liao=_status.event.getParent().player
						if(get.attitude(player,liao)>2) return 0; 
						if(player.countCards('he')<=0) return 1;
						if(game.hasPlayer(function(current){
							return current.hasSkill('lgs_tuxi_jing');
						})) return [1,0,0,0,0].randomGet();
						return [1,0,1,0,1].randomGet();
					});
					"step 5"
					var str;
					player.popup(event.res?'断桥奇袭':'披甲陷阵');
					target.popup(result.index?'蹴马趋津':'登高围敌');
					game.log(player,'谋弈',event.res==result.index?'#y失败':'#g成功');
					if(event.res!=result.index){
						str=get.translation(player)+'谋弈成功';
					}
					else {
						str=get.translation(target)+'谋弈成功';
					}
					game.broadcastAll(function(str){
						var dialog = ui.create.dialog(str);
						dialog.classList.add('center');
						setTimeout(function(){
							dialog.close();
						},1000);
					},str);
					game.delay(2);
					if(event.res!=result.index){
						if(event.res==0) target.chooseToDiscard('he',true);
						if(event.res==1) target.addSkill('lgs_tuxi_jing');
					}else{
						target.addSkill('lgs_tuxi_skip');
						target.storage.lgs_tuxi_skip=player;
					}
					"step 6"
					if(targets.length)
						event.goto(2);
				},
				ai:{
					threaten:1.6,
					expose:0.2,
				},
				onremove:function(player){
					game.countPlayer(function(current){
						current.removeSkill('lgs_tuxi_jing');
					});
				},
				subSkill:{
					jing:{
						charlotte:true,
						mark:true,
						marktext:'惊',
						intro:{
							name:'突袭',
							markcount:()=>0,
							mark:function(dialog,content,player){
								return '当前拥有“惊”标记';
							},
						},
					},
					skip:{
						direct:true,
						trigger:{player:'phaseDiscardBefore'},
						content:function(){
							player.storage.lgs_tuxi_skip.logSkill('lgs_tuxi',player);
							game.log(player,'跳过了','#y弃牌阶段');
							trigger.cancel();
							player.removeSkill('lgs_tuxi_skip');
						},
					},
				},
			},
			lgs_huiwei:{
				audio:"mengjin",
				trigger:{global:'phaseBegin'},
				filter:function(event,player){
					return player!=event.player&&player.hasSkill('lgs_tuxi')&&event.player.hasSkill('lgs_tuxi_jing');
				},
				forced:true,
				logTarget:'player',
				content:function(){
					'step 0'
					var target=trigger.player;
					event.target=target;
					target.removeSkill('lgs_tuxi_jing');
					var next=target.chooseCard('he')
					next.set('prompt','交给'+get.translation(player)+'一张装备牌，否则你本回合手牌上限-1，其下回合获得【英姿】');
					next.set('filterCard',function(card){
						return get.type(card)=='equip';
					});
					next.set('ai',function(card){
						if(game.hasPlayer(function(current){
							return current.hasSkill('lgs_tuxi_jing');
						})||player.hasSkill('lgs_huiwei_yingzi')) return 0;
						if(get.attitude(target,player)>2&&target.getHandcardLimit()>1&&!player.hasSkill('lgs_huiwei_yingzi')) return 0;
						if(get.position(card)=='e') return 7-get.equipValue(card);
						return 6-get.value(card);
					});
					'step 1'
					if(result.bool){
						player.gain(result.cards,target,'give');
					}else{
						target.addTempSkill('lgs_huiwei_limit');
						player.addSkill('lgs_huiwei_yingzi');
					}
				},
				subSkill:{
					limit:{
						maxHandcard:function(player,num){
							return num-1;
						},
					},
					yingzi:{
						mark:true,
						marktext:'麾围',
						intro:{
							name:'麾围',
							content:'下回合获得技能【英姿】',
						},
						trigger:{player:'phaseBegin'},
						filter:true,
						forced:true,
						locked:false,
						content:function(){
							player.addTempSkill('lgs_yingzi');
							player.removeSkill('lgs_huiwei_yingzi');
						},
					},
				},
			},
			lgs_yingzi:{
				audio:'yingzi',
				trigger:{
					player:"phaseDrawBegin2",
				},
				firstDo:true,
				frequent:true,
				filter:function(event,player){
					return !event.numFixed;
				},
				content:function(){
					trigger.num++;
				},
				ai:{
					threaten:1.3,
				},
			},
			lgs_tuxix:{
				// init:function(player){
					// player.storage.lgs_tuxix=0;
				// },
				audio:"retuxi",
				trigger:{
					player:"phaseDrawBegin2",
				},
				direct:true,
				preHidden:true,
				filter:function(event,player){
					return event.num>0&&!event.numFixed&&game.hasPlayer(function(target){
						return target.countCards('h')>0&&player!=target;
					});
				},
				content:function (){
					"step 0"
					var num=get.copy(trigger.num);
					if(get.mode()=='guozhan'&&num>2) num=2;
					player.chooseTarget(get.prompt('lgs_tuxix'),'获得至多'+get.translation(num)+'名角色1张手牌并与其谋弈',[1,num],function(card,player,target){
						return target.countCards('h')>0&&player!=target;
					},function(target){
						var att=get.attitude(_status.event.player,target);
						if(target.hasSkill('tuntian')||target.hasSkill('retuntian')||target.hasSkill('oltuntian')) return att/10;
						return 1-att;
					}).setHiddenSkill('lgs_tuxix');
					"step 1"
					if(result.bool){
						result.targets.sortBySeat();
						event.targets=result.targets.slice(0);
						player.logSkill('lgs_tuxix',result.targets);
						trigger.num-=result.targets.length;
					}
					else{
						event.finish();
					}
					"step 2"
					var target=targets.shift()
					event.target=target;
					player.gainPlayerCard(target,'h',true);
					"step 3"
					var next=player.chooseControl('披甲陷阵','断桥奇袭').set('choiceList',[
						'【披甲陷阵】你有机会令你下一个摸牌阶段摸牌数+1',
						'【断桥奇袭】你有机会令'+get.translation(target)+'获得“惊”标记',
					]);
					next.set('prompt', '谋弈：请选择你的进攻策略');
					next.set('ai', function(){
						var player=_status.event.getParent().player,target=_status.event.getParent().target
						if(get.attitude(player,target)>1) return 0; 
						return [0,1].randomGet();
					});
					'step 4'
					event.res=result.index;
					var next=target.chooseControl('登高围敌','蹴马趋津').set('choiceList',[
						'【登高围敌】防止'+get.translation(player)+'下个摸牌阶段摸牌数+1',
						'【蹴马趋津】防止获得“惊”标记',
					]);
					next.set('prompt', '谋弈：请选择你的防御策略');
					next.set('ai', function(){
						var player=_status.event.getParent().target,liao=_status.event.getParent().player
						if(get.attitude(player,liao)>1) return 1; 
						if(player.countCards('he')<=0) return 0;
						var list=[0,1,0,1,0]
						// if(!player.countCards('he',function(card){
							// return get.type(card)=='equip'&&get.value(card,player)<6;
						// })) list.addArray([1,0]);
						return list.randomGet();
					});
					"step 5"
					var str;
					player.popup(event.res?'断桥奇袭':'披甲陷阵');
					target.popup(result.index?'蹴马趋津':'登高围敌');
					game.log(player,'谋弈',event.res==result.index?'#y失败':'#g成功');
					if(event.res!=result.index){
						str=get.translation(player)+'谋弈成功';
					}
					else {
						str=get.translation(target)+'谋弈成功';
					}
					game.broadcastAll(function(str){
						var dialog = ui.create.dialog(str);
						dialog.classList.add('center');
						setTimeout(function(){
							dialog.close();
						},1000);
					},str);
					game.delay(2);
					if(event.res!=result.index){
						if(event.res==0){
							player.addSkill('lgs_tuxix_draw');
							player.storage.lgs_tuxix_draw++;
						}
						if(event.res==1) target.addSkill('lgs_tuxix_jing');
					}else{
						target.addSkill('lgs_tuxi_skip');
						target.storage.lgs_tuxi_skip=player;
					}
					"step 6"
					if(targets.length)
						event.goto(2);
				},
				ai:{
					threaten:1.8,
					expose:0.2,
				},
				onremove:function(player){
					game.countPlayer(function(current){
						current.removeSkill('lgs_tuxix_jing');
					});
				},
				subSkill:{
					draw:{
						init:function(player){
							player.storage.lgs_tuxix_draw=0;
						},
						mark:true,
						intro:{
							// markcount:'storage',
							content:'下一个摸牌阶段多摸<span class="bluetext">#</span>张牌',
						},
						audio:'yingzi',
						trigger:{player:'phaseDrawBegin1'},
						direct:true,
						filter:function(event,player){
							return !event.numFixed;
						},
						content:function(){
							trigger.num+=player.storage.lgs_tuxix_draw;
							player.removeSkill('lgs_tuxix_draw');
						},
						ai:{
							threaten:1.3
						}
					},
					jing:{
						charlotte:true,
						mark:true,
						marktext:'惊',
						intro:{
							name:'突袭',
							markcount:()=>0,
							mark:function(dialog,content,player){
								return '当前拥有“惊”标记';
							},
						},
					},
				},
			},
			lgs_huiweix:{
				audio:"mengjin",
				trigger:{global:'phaseBegin'},
				filter:function(event,player){
					return player!=event.player&&player.hasSkill('lgs_tuxix')&&event.player.hasSkill('lgs_tuxix_jing');
				},
				forced:true,
				logTarget:'player',
				content:function(){
					'step 0'
					var target=trigger.player;
					event.target=target;
					target.removeSkill('lgs_tuxix_jing');
					var c1=target.countCards('he',function(card){return get.type(card)=='equip'})>0,c2=target.countCards('he')>1;
					if(c1&&c2){
						target.chooseControlList([
							'交给'+get.translation(player)+'1张装备牌',
							'弃置2张牌',
						],true).set('prompt','麾围：请选择一项').set('ai',function(){
							var player=_status.event.getParent().target,values=[],equipValues=[]
							if(get.attitude(player,_status.event.getParent().player)>1) return 0;
							for(var card of player.getCards('he')){
								var value=get.value(card,player)
								values.push(value);
								if(get.type(card)=='equip')
									equipValues.push(value);
							}
							values.sort(function(a,b){
								return a>b;
							});
							equipValues.sort(function(a,b){
								return a>b;
							});
							if(2*equipValues[0]<values[0]+values[1]) return 1;
							return 0;
						});
					}else if(c1){
						event.goto(2);
					}else if(c2){
						event.goto(4);
					}else
						event.finish();
					'step 1'
					if(result.index)
						event.goto(4);
					'step 2'
					var next=target.chooseCard('he',true)
					next.set('prompt','请交给'+get.translation(player)+'1张装备牌');
					next.set('filterCard',function(card){
						return get.type(card)=='equip';
					});
					next.set('ai',function(card){
						return 6-get.value(card);
					});
					'step 3'
					if(result.bool){
						player.gain(result.cards,target,'give');
					}
					event.finish();
					'step 4'
					target.chooseToDiscard('请弃置2张牌','he',2,true);
				},
			},
			lgs_jingshu:{
				init:function(player){
					player.storage.lgs_jingshu=[];
				},
				intro:{
					markcount:()=>0,
					content:'保留的装备牌：$',
				},
				trigger:{
					player:"discardBefore",
				},
				direct:true,
				filter:function(event,player){
					for(var card of event.cards){
						if(get.position(card)!='j'&&!card.hasGaintag('lgs_jingshu')&&!player.storage.lgs_jingshu.contains(card))
							return true;
					}
					return false;
				},
				content:function(){
					'step 0'
					var str='';
					for(var i=0;i<trigger.cards.length;i++){
						str+=get.translation(trigger.cards[i]);
						if(i<trigger.cards.length-1)
							str+='、';
					}
					player.chooseCard('he',[1,trigger.cards.length],function(card){
						return trigger.cards.contains(card)&&!card.hasGaintag('lgs_jingshu')&&!player.storage.lgs_jingshu.contains(card);
					}).set('prompt','静姝：即将弃置'+str+'，选择任意张牌保留');
					'step 1'
					if(result.bool){
						player.logSkill('lgs_jingshu');
						var e='',h=0
						for(var card of result.cards){
							trigger.cards.remove(card);
							if(get.position(card)=='h'){
								card.addGaintag('lgs_jingshu');
								h+=1;
							}
							if(get.position(card)=='e'){
								player.storage.lgs_jingshu.push(card);
								player.markSkill('lgs_jingshu');
								if(e) e+='、';
								e+=get.translation(card);
							}
						}
						game.log(player,'保留了'+e+(h&e?'和':'')+h+'张手牌');
					}
				},
				group:['lgs_jingshu_lose'],
				subSkill:{
					lose:{
						trigger:{
							player:"loseAfter",
						},
						filter:true,
						direct:true,
						content:function(){
							var damage=false
							if(trigger.type=='discard'){
								for(var i in trigger.gaintag_map)
									if(trigger.gaintag_map[i].contains('lgs_jingshu'))
										damage=true;
								for(var card of trigger.cards)
									if(player.storage.lgs_jingshu.contains(card))
										damage=true;
							}
							player.storage.lgs_jingshu.removeArray(trigger.cards);
							if(!player.storage.lgs_jingshu.length) player.unmarkSkill('lgs_jingshu');
							if(damage){
								player.logSkill('lgs_jingshu');
								player.damage('nosource');
							}
						},
					},
				},
			},
			lgs_duyi:{
				marktext:'毅',
				intro:{
					markcount:'expansion',
					mark:function(dialog,content,player){
						if(player==game.me||player.isUnderControl()){
							if(player.getExpansions('lgs_duyi').length)
								dialog.add(player.getExpansions('lgs_duyi'));
						}else{
							dialog.addText('当前拥有'+player.getExpansions('lgs_duyi').length+'张“毅”');
						}
					},
				},
				enable:'phaseUse',
				filter:function(event,player){
					return !player.hasSkill('lgs_duyi_block')&&(player.countCards('he')||player.getExpansions('lgs_duyi').length);
				},
				log:false,
				delay:false,
				content:function(){
					'step 0'
					if(!player.countCards('he')) event.goto(5);
					else if(!player.getExpansions('lgs_duyi').length) event.goto(2);
					else {
						event.two=true;
						player.chooseControl('放置“毅”','获得“毅”','cancel');
					}
					'step 1'
					if(result.control=='cancel') event.finish();
					else if(result.control=='获得“毅”') event.goto(5);
					'step 2'
					player.chooseCard('he').set('prompt','将一张牌置于武将牌上当作“毅”');
		            'step 3'
					if(result.bool){
						player.logSkill('lgs_duyi');
						player.addTempSkill('lgs_duyi_block','phaseUseEnd');
						game.delay(0.2);
						player.addToExpansion(result.cards,player,'giveAuto','log').gaintag.add('lgs_duyi');
					}else if(event.two)
						event.goto(0);
					else
						event.finish();
					'step 4'
					player.draw();
					event.goto(7);
					'step 5'
					player.chooseCardButton('选择获得任意张“毅”',[1,player.getExpansions('lgs_duyi').length],player.getExpansions('lgs_duyi'));
					'step 6'
					if(result.bool){
						player.addTempSkill('lgs_duyi_block','phaseUseEnd');
						game.delay(0.2);
						player.gain(result.links,'give',player);
					}else if(event.two)
						event.goto(0);
					else
						event.finish();
					'step 7'
					if(player.getExpansions('lgs_duyi').length==player.hp)
						player.recover();
				},
				ai:{
					maixie:true,
					maixie_hp:true
				},
				group:'lgs_duyi_damage',
				subSkill:{
					damage:{
						trigger:{
							player:'damageEnd',
						},
						filter:function(event,player){
							return player.countCards('he')||player.getExpansions('lgs_duyi').length;
						},
						frequent:true,
						popup:false,
						content:function(){
							'step 0'
							if(!player.countCards('he')) event.goto(5);
							else if(!player.getExpansions('lgs_duyi').length) event.goto(2);
							else {
								event.two=true;
								player.chooseControl('放置“毅”','获得“毅”','cancel');
							}
							'step 1'
							if(result.control=='cancel') event.finish();
							else if(result.control=='获得“毅”') event.goto(5);
							'step 2'
							player.chooseCard('he').set('prompt','静姝：将一张牌置于武将牌上当作“毅”');;
							'step 3'
							if(result.bool){
								player.logSkill('lgs_duyi');
								game.delay(0.2);
								player.addToExpansion(result.cards,player,'giveAuto','log').gaintag.add('lgs_duyi');
							}else if(event.two)
								event.goto(0);
							else
								event.finish();
							'step 4'
							player.draw();
							event.goto(7);
							'step 5'
							player.chooseCardButton('选择获得任意张“毅”',[1,player.getExpansions('lgs_duyi').length],player.getExpansions('lgs_duyi'));
							'step 6'
							if(result.bool){
								player.logSkill('lgs_duyi');
								game.delay(0.2);
								player.gain(result.links,'give',player);
							}else if(event.two)
								event.goto(0);
							else
								event.finish();
							'step 7'
							if(player.getExpansions('lgs_duyi').length==player.hp)
								player.recover();
						},
					},
					block:{charlotte:true},
				},
			},
			lgs_xiaokan:{
				enable:'phaseUse',
				filter:function(event,player){
					return !player.hasSkill('lgs_xiaokan_block')&&game.hasPlayer(function(current){
						return current.countCards('he');
					});
				},
				filterTarget:function(card,player,target){
					return target.countCards('he');
				},
				content:function(){
					'step 0'
					player.discardPlayerCard(target,'he');
					'step 1'
					var next=target.chooseControlList(['受到'+get.translation(player)+'的一点伤害，视为对其使用一张杀','摸'+player.countCards('h')+'张牌并翻面'],true);
					next.set('ai',function(){
						var player=_status.event.getParent().target,jing=_status.event.getParent().player;
						var num=Math.min(4,player.countCards('h'))
						if(player.isTurnedOver()) return 1;
						if(get.attitude(player,jing)>2) return 1;
						if(num>=4) return 1;
						if(player.hp<=1) return 1;
						if(num>=3){
							if(player.hp>2) return [1,0,0,0].randomGet();
							return [1,1,0].randomGet();
						}
						if(num>=2){
							if(player.hp>2) return [1,0,0].randomGet();
							return [1,1,0].randomGet();
						}
						if(num>=1){
							if(player.hp>2) return [1,0,0].randomGet();
							if(jing.hp>2) return [1,1,0].randomGet();
							return [1,0].randomGet();
						}
						return 0;
					});
					'step 2'
					if(result.index==1)
						event.goto(4);
					else
						target.damage(player);
					'step 3'
					if(target.isIn()&&target.canUse('sha',player,false))
						target.useCard({name:'sha',isCard:true},player,false,'noai');
					event.finish();
					'step 4'
					player.addTempSkill('lgs_xiaokan_block');
					target.draw(Math.min(4,target.countCards('h')));
					'step 5'
					target.turnOver();
				},
				ai:{
					threaten:2.5,
					order:7.2,
					result:{
						player:function(player,target){
							if(target.hp>1&&player.hp==1&&!player.countCards('h','shan')&&!player.countCards('h','shandian')) return -10;
							return -0.5;
						},
						target:function(player,target){
							if(target.countCards('h')>4) return 1;
							return Math.max(-1,-5+0.75*player.countCards('h'))+Math.max(0,-3+player.hp);
						},
					},
				},
				subSkill:{
					block:{charlotte:true},
				},
			},
			lgs_caisi:{
				enable:["chooseToUse","chooseToRespond"],
				prompt:"将闪和闪电、火杀和火攻、桃和桃园结义、无懈可击和无中生有相互转化",
				viewAs:function(cards,player){
					var name=false;
					var nature=null;
					//根据选择的卡牌的花色 判断要转化出的卡牌是闪还是火杀还是无懈还是桃
					switch(get.name(cards[0],player)){
						case 'shan':name='shandian';break;
						case 'shandian':name='shan';break;
						case 'sha':name='huogong';break;
						case 'huogong':name='sha';nature='fire';break;
						case 'tao':name='taoyuan';break;
						case 'taoyuan':name='tao';break;
						case 'wuxie':name='wuzhong';break;
						case 'wuzhong':name='wuxie';break;
					}
					//返回判断结果
					if(name) return {name:name,nature:nature};
					return null;
				},
				check:function(card){
					var player=_status.event.player;
					if(_status.event.type=='phase'){
						var max=0;
						var name2;
						var list=['shandian','sha','huogong','tao','taoyuan','wuxie','wuzhong'];
						var map={shandian:'shan',sha:'huogong',huogong:'sha',tao:'taoyuan',taoyuan:'tao'}
						for(var i=0;i<list.length;i++){  // 求max-ordered的有实用价值的cardname
							var name=list[i];  // 视为的牌名
							if(player.countCards('hes',function(card){
								if(get.value(card)>=7) return false;
								if(name=='huogong'&&get.nature(card,player)!='fire') return false;
								return get.name(card,player)==map[name];
							})>0&&player.getUseValue({name:name,nature:name=='sha'?'fire':null})>0){
								var temp=get.order({name:name,nature:name=='sha'?'fire':null});
								if(temp>max){
									max=temp;
									name2=map[name];
								}
							}
						}
						if(name2==get.name(card,player)) return 7-get.value(card);
						return 0;
					}
					return 1;
				},
				position:"hes",
				filterCard:function(card,player,event){
					event=event||_status.event;
					//获取当前时机的卡牌选择限制
					var filter=event._backup.filterCard;
					var name=get.name(card,player),nature=get.nature(card,player);
					if(name=='shan'&&filter({name:'shandian',cards:[card]},player,event)) return true;
					if(name=='shandian'&&filter({name:'shan',cards:[card]},player,event)) return true;
					if(name=='sha'&&nature=='fire'&&filter({name:'huogong',cards:[card]},player,event)) return true;
					if(name=='huogong'&&filter({name:'sha',nature:'fire',cards:[card]},player,event)) return true;
					if(name=='tao'&&filter({name:'taoyuan',cards:[card]},player,event)) return true;
					if(name=='taoyuan'&&filter({name:'tao',cards:[card]},player,event)) return true;
					if(name=='wuxie'&&filter({name:'wuzhong',cards:[card]},player,event)) return true;
					if(name=='wuzhong'&&filter({name:'wuxie',cards:[card]},player,event)) return true;
					return false;
				},
				filter:function(event,player){
					//获取当前时机的卡牌选择限制
					var filter=event.filterCard;
					if(filter({name:'shan'},player,event)&&player.countCards('hes','shandian')) return true;
					if(filter({name:'shandian'},player,event)&&player.countCards('hes','shan')) return true;
					if(filter({name:'sha',nature:'fire'},player,event)&&player.countCards('hes','huogong')) return true;
					if(filter({name:'huogong'},player,event)&&player.countCards('hes',{name:'sha',nature:'fire'})) return true;
					if(filter({name:'tao'},player,event)&&player.countCards('hes','taoyuan')) return true;
					if(filter({name:'taoyuan'},player,event)&&player.countCards('hes','tao')) return true;
					if(filter({name:'wuxie'},player,event)&&player.countCards('hes','wuzhong')) return true;
					if(filter({name:'wuzhong'},player,event)&&player.countCards('hes','wuxie')) return true;
					return false;
				},
				ai:{
					respondSha:true,
					respondShan:true,
					skillTagFilter:function(player,tag){
						if(tag=='respondSha'&&!player.countCards('hs','huogong')) return false;
						if(tag=='respondShan'&&!player.countCards('hs','shandian')) return false;
						if(tag=='save'&&!player.countCards('hs','taoyuan')) return false;
					},
					order:function(item,player){
						if(player&&_status.event.type=='phase'){
							var max=0;
							var list=['sha','tao'];
							var map={sha:'diamond',tao:'heart'}
							for(var i=0;i<list.length;i++){
								var name=list[i];
								if(player.countCards('hes',function(card){
									return (name!='sha'||get.value(card)<5)&&get.suit(card,player)==map[name];
								})>0&&player.getUseValue({name:name,nature:name=='sha'?'fire':null})>0){
									var temp=get.order({name:name,nature:name=='sha'?'fire':null});
									if(temp>max) max=temp;
								}
							}
							max/=1.1;
							return max;
						}
						return 2;
					},
				},
				hiddenCard:function(player,name){
					if(name=='wuxie'&&_status.connectMode&&player.countCards('hs')>0) return true;
					if(name=='wuxie') return player.countCards('hes','wuzhong')>0;
					if(name=='tao') return player.countCards('hes','taoyuan')>0;
				},
			},
			lgs_chijiang:{
				audio:'reyajiao',
				trigger:{player:'useCardToPlayered'},
				filter:function(event,player){
					if(event.getParent().triggeredTargets3.length>1) return false;
					for(var target of event.targets)
						if(target!=player&&!target.hasSkill('lgs_chijiang_jiang'))
							return true;
					return false;
				},
				forced:true,
				logTarget:function(event,player){
					var list=[]
					for(var target of event.targets)
						if(target!=player&&!target.hasSkill('lgs_chijiang_jiang'))
							list.push(target);
					return list;
				},
				content:function(){
					for(var target of trigger.targets)
						if(target!=player)
							target.addSkill('lgs_chijiang_jiang');
				},
				mod:{
					globalFrom:function(from,to){
						// if(game.hasPlayer(function(current){
						// 	return current.hasSkill('lgs_chijiang_jiang')&&get.distance(current,to)<=1;
						// })) return -Infinity;
						if(to.hasSkill('lgs_chijiang_jiang')||to.previous.hasSkill('lgs_chijiang_jiang')||to.next.hasSkill('lgs_chijiang_jiang'))
							return -Infinity;
					},
				},
				group:'lgs_chijiang_guixin',
				subSkill:{
					jiang:{
						charlotte:true,
						mark:true,
						marktext:'疆',
						intro:{
							name:'驰疆',
							markcount:()=>0,
							content:'当前拥有“疆”标记',
						},
					},
					guixin:{
						audio:'guixin',
						trigger:{player:'phaseJieshuBegin'},
						filter:function(event,player){
							return !game.hasPlayer(function(current){
								return get.distance(player,current)>1;
							});
						},
						forced:true,
						content:function(){
							"step 0"
							player.chooseControl('baonue_hp','baonue_maxHp',function(event,player){
								if(player.hp==player.maxHp) return 'baonue_hp';
								if(player.hp<player.maxHp-1||player.hp<=2) return 'baonue_maxHp';
								return 'baonue_hp';
							}).set('prompt','驰疆：失去1点体力或减1点体力上限');
							"step 1"
							if(result.control=='baonue_hp')
								player.loseHp();
							else
								player.loseMaxHp(true);
							"step 2"
							var targets=game.filterPlayer();
							targets.remove(player);
							targets.sort(lib.sort.seat);
							event.targets=targets;
							event.count=trigger.num;
							event.num=0;
							player.line(targets,'green');
							"step 3"
							if(num<event.targets.length){
								if(!get.is.altered('guixin')){
									if(event.targets[num].countGainableCards(player,'hej')){
										player.gainPlayerCard(event.targets[num],true,'hej');
									}
								}
								else{
									var hej=event.targets[num].getCards('hej')
									if(hej.length){
										var card=hej.randomGet();
										player.gain(card,event.targets[num]);
										if(get.position(card)=='h'){
											event.targets[num].$giveAuto(card,player);
										}
										else{
											event.targets[num].$give(card,player);
										}
									}
								}
								event.num++;
								event.redo();
							}
							"step 4"
							var num=game.countPlayer(function(current){
								return current.hasSkill('lgs_chijiang_jiang');
							})
							if(num)
								player.chooseToDiscard('he',num,true);
							"step 5"
							game.countPlayer(function(current){
								current.removeSkill('lgs_chijiang_jiang');
							});
						},
					},
				},
			},
			lgs_oldhuiyou:{
				audio:'haoshi2',
				trigger:{global:'damageEnd'},
				filter:function(event,player){
					return event.player.isAlive()&&player.countCards('h')>event.player.countCards('h');
				},
				logTarget:'player',
				content:function(){
					'step 0'
					trigger.player.gain(player.getCards('h'),player,'giveAuto');
					'step 1'
					if(!player.hujia)
						trigger.player.chooseBool('是否令'+get.translation(trigger.player)+'获得一点护甲？').set('ai',function(){
							return get.attitude(trigger.player,player)>=0;
						});
					else
						event.finish();
					'step 2'
					if(result.bool){
						trigger.player.line(player);
						player.changeHujia(1);
					}
				},
			},
			lgs_huiyou: {
				enable: 'phaseUse',
				filterCard: true,
				selectCard: [1, Infinity],
				check(card) {
					var player = _status.event.player
					// 计算可会友队友最大手牌数num
					var nums = [], cardsNum = player.countCards()
					game.countPlayer(function(current) {
						var num1 = current.countCards('h')
						if (get.attitude(player, current) > 0 && cardsNum - num1 > 1) nums.push(num1);
					})
					if (!nums.length) return 0;
					var num = Math.max(...nums)
					// 计算最大可弃置牌数num2
					var num2 = cardsNum - 1 - num
					// 若选牌数已达到num2或目标手牌较多则停止选择
					var temp = Math.min(num2, Math.max(3 - num, 1))
					if (ui.selected.cards.length >= temp) return -1;
					// 优先弃置重复花色
					if (player.countCards('h', function(cardx) {
						return get.suit(cardx) == get.suit(card) && !ui.selected.cards.contains(cardx);
					}) > 1) return 10 - get.value(card);
					return 8 - get.value(card);
				},
				content() {
					'step 0'
					var targets = game.filterPlayer(function(current) {
						return current != player && current.countCards('h') < player.countCards('h');
					})
					if (targets.length > 0)
						player.chooseTarget(true, function(card, player, target) {
							return _status.event.targets.contains(target);
						}, function(target) {
							return get.sgnAttitude(_status.event.player, target) * target.countCards('h');
						}).set('targets', targets);
					else
						event.finish();
					'step 1'
					event.target = result.targets[0];
					player.line(event.target);
					event.target.draw(cards.length);
					'step 2'
					var suits = game.getSuit(player, 'h');
					target.draw(game.getSuit(target, 'h').filter(function(suit) {return suits.contains(suit)}).length);
				},
				ai: {
					order: 13,
					result: {
						player:1,
					},
				},
			},
			lgs_yinwei:{
				audio:'repojun',
				trigger:{player:'useCardToPlayered'},
				filter:function(event,player){
					if(event.card.name!='sha') return false;
					if(player.hp>event.target.hp) return true;
					if(player.countCards('h')>event.target.countCards('h')) return true;
					var list1=player.getSkills(null,false,false).filter(function(skill){
						return !lib.skill[skill].charlotte&&lib.translate[skill+'_info'];
					});
					var list2=event.player.getSkills(null,false,false).filter(function(skill){
						return !lib.skill[skill].charlotte&&lib.translate[skill+'_info'];
					});
					if(list1.length>list2.length) return true;
					return false;
				},
				check:function(event,player){
					return get.attitude(player,event.target)<0;
				},
				content:function(){
					'step 0'
					var target=trigger.target
					if(player.countCards('h')>target.countCards('h'))
						target.addTempSkill('lgs_yinwei_xiongluan');
					if(player.hp>target.hp)
						trigger.getParent().baseDamage++;
					var list1=player.getSkills(null,false,false).filter(function(skill){
						return !lib.skill[skill].charlotte&&lib.translate[skill+'_info'];
					});
					var list2=target.getSkills(null,false,false).filter(function(skill){
						return !lib.skill[skill].charlotte&&lib.translate[skill+'_info'];
					});
					if(list1.length>list2.length)
						target.addTempSkill('fengyin');
				},
				ai:{
					threaten:1.7,
					presha:true,
					pretao:true,
				},
			},
			lgs_yinwei_xiongluan:{
				charlotte:true,
				mark:true,
				intro:{
					content:'本回合不能使用手牌',
				},
				mod:{
					"cardEnabled2":function(card,player){
						if(get.position(card)=='h') return false;
					},
				},
				ai:{
					effect:{
						target:function(card,player,target){
							if(get.tag(card,'damage')) return [1,-9];
						},
					},
				},
			},
			lgs_oldshenhuai:{
				audio:"ext:理工杀:2",
				init:function(player){
					player.storage.lgs_shenhuai=[];
				},
				trigger:{global:'dying'},
				filter:function(event,player){
					return event.player.hp<=0&&player.storage.lgs_shenhuai.length<4&&!player.storage.lgs_shenhuai.contains(event.player);
				},
				forced:true,
				logTarget:'player',
				content:function(){
					'step 0'
					player.storage.lgs_shenhuai.push(trigger.player);
					trigger.player.recover();
					'step 1'
					switch(player.storage.lgs_shenhuai.length){
						case 1:
							player.addSkillLog('lgs_yaowu');
							break;
						case 2:
							player.addSkillLog('lgs_yangwei');
							break;
						case 3:
							player.chooseToDiscard('he',2,true);
							break;
						case 4:
							player.loseMaxHp();
							break;
					}
				},
				ai:{
					threaten:1.3,
				},
			},
			lgs_shenhuai: {
				audio:"ext:理工杀:2",
				init:function(player){
					player.storage.lgs_shenhuai=[];
				},
				trigger:{global:'dying'},
				filter:function(event,player){
					return event.player.hp<=0 && !player.storage.lgs_shenhuai.contains(event.player);
				},
				direct: true,
				content: function() {
					'step 0'
					var choice = ['失去1点体力', 'cancel2']
					if (player.countCards('he', function(card){
						return lib.filter.cardDiscardable(card, player, 'lgs_shenhuai');
					}) >= 2) choice.unshift('弃2张牌');
					player.chooseControl(choice).set('prompt', get.prompt2('lgs_shenhuai')).set('ai', function(evt, player) {
						var target = evt.getTrigger().player
						game.log(player, target);
						if (get.attitude(player, target) <= 0) return 'cancel2';
						if (_status.event.controls.contains('弃2张牌') && player.countCards('he', function(card) {
							return get.value(card) < 6;
						}) >= 2) return '弃2张牌';
						if (player.hp > 1) return '失去1点体力';
						return 'cancel2';
					});
					'step 1' // 选择结果判断逻辑
					if (result.control == '弃2张牌') {
						player.chooseToDiscard('he', 2).logSkill = ['lgs_shenhuai', trigger.player];
					} else if (result.control == '失去1点体力') {
						event.goto(3);
					} else
						event.finish();
					'step 2' // 弃牌结果判断逻辑
					event.goto(result.bool ? 4 : 0);
					'step 3'
					player.logSkill('lgs_shenhuai', trigger.player);
					player.loseHp();
					'step 4'
					player.storage.lgs_shenhuai.push(trigger.player);
					trigger.player.recover();
					'step 5'
					player.addTempSkill('lgs_yaowu', {player: 'phaseEnd'});
					player.addTempSkill('lgs_yangwei', {player: 'phaseEnd'});
				},
			},
			lgs_yaowu:{
				audio:'new_reyaowu',
				trigger:{
					player:"damageBegin3",
				},
				filter:function(event){
					return event.card&&event.card.name=='sha'&&(get.color(event.card)!='red'||event.source&&event.source.isAlive());
				},
				forced:true,
				check:function(event){
					if(event.card&&(event.card.name=='sha')){
						return get.color(event.card)=='black';
					}
				},
				content:function(){
					if(get.color(trigger.card)!='red') player.draw();
					else trigger.source.chooseDrawRecover(true);
				},
				ai:{
					effect:{
						target:function(card,player,target,current){
							if(card.name=='sha'&&(get.color(card)=='red')&&get.attitude(player,target)<=0){
								return [1,0.8,1,0];
							}
							if(card.name=='sha'&&(get.color(card)=='black')){
								return [1,0.4];
							}
						},
					},
				},
			},
			lgs_yangwei:{
                audio:"ext:理工杀:1",
				derivation:'lgs_luyeyang',
                enable:"phaseUse",
                usable:1,
                filter:function(event,player){
                    return !player.hasSkill('lgs_yangwei_sha')&&!player.hasSkill('lgs_yangwei2')&&!player.hasSkill('lgs_yangwei3')&&!player.hasSkill('lgs_yangwei4');
                },
                content:function(){
                    player.draw(2);
                    player.addTempSkill('lgs_yangwei_sha', 'phaseUseEnd');
                    player.addSkill('lgs_yangwei2');
                },
                ai:{
                    order:10,
                    result:{
                        player:1,
                    },
                },
            },
            lgs_yangwei2:{
				charlotte:true,
                trigger:{
					player:"phaseAfter",
                },
                direct:true,
                content:function(){
                    player.removeSkill('lgs_yangwei2');
                    player.addSkill('lgs_yangwei3');
                },
            },
            lgs_yangwei3:{
				charlotte:true,
                trigger:{
                    player:"phaseBefore",
                },
                direct:true,
                content:function(){
                    player.removeSkill('lgs_yangwei3');
                    player.addTempSkill('lgs_yangwei4');
                },
            },
			lgs_yangwei4:{charlotte:true},
            lgs_yangwei_sha:{
				charlotte:true,
                mark:true,
                marktext:"威",
                intro:{
                    name:"威",
                    content:"出【杀】次数+1，无距离限制，无视防具",
                },
                mod:{
                    cardUsable:function(card,player,num){
                        if(card.name=='sha') return num+1;
                    },
                    attackFrom:function(){
                        return -Infinity;
                    },
                },
                trigger:{
                    player:"useCardToPlayered",
                },
                filter:function (event, player) {
                    return event.card.name=='sha'&&get.color(event.card)=='black';
                },
                direct:true,
                content:function(){
                    for (var i of trigger.targets) {
                        i.addTempSkill('qinggang2');
                        i.storage.qinggang2.add(trigger.card);
                    }
                },
                ai:{
                    "unequip_ai":true,
                },
            },
			lgs_qjinyi:{
				audio: 'zhiren',
				trigger:{player:'equipAfter'},
				filter:()=>true,  // filter不写成函数则不可用usable参数
				usable:1,
				check:function(event,player){
					if(player==_status.currentPhase) return !player.countCards('h',function(card){
						return get.type(card)=='equip'&&!player.countCards('e',function(cardx){
							return get.subtype(cardx)==get.subtype(card);
						})&&player.hasValueTarget(card);
					});  // 若手牌中还有未装备子类型的装备，则不发动
					return true;
				},
				content:function(){
					var num=player.countCards('e')
					player.draw(num);
				},
				mod:{
					aiValue:function(player,card,num){
						if(get.type(card)=='equip') return num+2;
					},
					aiUseful:function(){
						return lib.skill.lgs_yanhuan.mod.aiValue.apply(this,arguments);
					},
				},
				ai:{
					// reverseEquip:true,
					effect:{
						target:function(card,player,target){
							if(target.hasSkill('counttrigger')&&target.storage.counttrigger.lgs_qjinyi>=1) return [1,0];
							if(!player.getStat('skill').lgs_qjinyi&&get.type(card)=='equip'){
								if(player.countCards('e',function(cardx){
									return get.subtype(cardx)==get.subtype(card);
								})) return [1,player.countCards('e')];
								return [1,player.countCards('e')+1];
							}
						},
					},
				},
				// subSkill:{
				// },
			},
			lgs_shuangzhi:{
				trigger:{target:'useCardToTargeted'},
				filter:function(event,player){
					return event.player!=player&&get.type(event.card,'trick')=='trick'&&!get.tag(event.card,'damage');
				},
				usable:1,
				logTarget:'player',
				content:function(){
					'step 0'
					trigger.player.damage(player);
				},
				ai:{
					effect:{
						target:function(card,player,target){
							if(get.type(card,'trick')=='trick'&&!get.tag(card,'damage')){
								var damageEffect=get.damageEffect(player,target,player);
								if(damageEffect<0){
									var info=get.info('lgs_shuangzhi')
									if(typeof info.usable=='number')
										if(!target.hasSkill('counttrigger')
												||target.storage.counttrigger&&target.storage.counttrigger['lgs_shuangzhi']<info.usable){
											return [1,0,1,damageEffect];  // 四个数分别是对牌的目标正效果调整的倍数和加数，和对使用者正效果调整的倍数和加数
									}
								}
							}
						},
					},
				},
			},
			lgs_kaizhu:{
				init:function(player){
					player.storage.lgs_kaizhu = [];
				},
				intro:{
					markcount:function(storage,player){
						var num=0
						for(var i=1;i<6;i++)
							if(player.isDisabled(i))
								num++;
						if(player.storage._disableJudge) num++;
						return num;
					},
					mark:function(dialog,content,player){
						var num=0
						for(var i=1;i<6;i++)
							if(player.isDisabled(i))
								num++;
						if(player.storage._disableJudge) num++;
						dialog.addText('其他角色与'+get.translation(player)+'计算距离+<span class="bluetext">'+num+'</span>');
						dialog.addText('场上因慨助移动的牌：');
						var list=[]
						for(var card of player.storage.lgs_kaizhu)
							if(card)
								list.push(card);
						dialog.add(list);
					},
				},
				enable:"phaseUse",
				filter:function(event,player){
					return player.countCards('ej',function(card){
						return game.hasPlayer(function(current){
							return current.isEmpty(get.subtype(card));
						});
					});
				},
				delay:false,
				log:false,
				content:function(){
					'step 0'
					var cards_equip = player.get('e');
					var cards_judge = player.get('j');
					var choice = ['慨助：选择要移动的牌'];
					if(cards_equip.length>0) choice.push('装备区',cards_equip);
					if(cards_judge.length>0) choice.push('判定区',cards_judge);
					player.chooseButton(choice);
					'step 1'//选择牌
					if(!result.bool){
						event.finish();
						return;
					}
					event.card_move = result.links[0];
					player.chooseTarget(function(card,player,target){//选择目标
						if(!event.card_move) return false;
						if(get.position(event.card_move)=='e'&&!target.isEmpty(get.subtype(event.card_move))) return false;
						return true;
					});
					'step 2'
					if(!result.bool){
						event.finish();
						return;
					}
					var target=result.targets[0]
					event.target=target;
					player.logSkill('lgs_kaizhu',target);
					player.$give(event.card_move,target,false);
					if(get.position(event.card_move) == 'e'){
						var mark = 0;
						for(var i=1;i<=5;++i){
							if(event.card_move == player.get('e',i.toString())){
								mark = i;
							}
						}
						target.equip(event.card_move);
						player.disableEquip(mark);
					}
					else{//移动判定
						player.$give(event.card_move,target,false);
						game.delay(0.5);
						target.addJudge(event.card_move);
						player.disableJudge();
					}
					var i;
					for(i=1;i<=5;++i){
						if(get.subtype(event.card_move) == 'equip' + i){
							player.storage.lgs_kaizhu[i] = event.card_move;
							break;
						}
					}
					if(i>5){
						player.storage.lgs_kaizhu[0] = event.card_move;
					}
					target.recover();
				},
				mod:{
					globalTo:function(from,to,distance){
						var num=0
						for(var i=1;i<6;i++)
							if(to.isDisabled(i))
								num++;
						if(to.storage._disableJudge) num++;
						return distance+num;
					},
				},
				group:['lgs_kaizhu_judgeLose','lgs_kaizhu_mark'],
				subSkill:{
					judgeLose:{
						trigger:{
							global:'loseEnd',
						},
						filter:function(event,player){
							var flag = false;
							for(var i=0;i<event.cards.length;i++){
								if(event.cards[i].original=='e'||event.cards[i].original=='j'){
									if(player.storage.lgs_kaizhu.contains(event.cards[i])){
										flag = true;
										break;
									}
								}
							}
							return player!=event.player&&flag;
						},
						frequent:true,
						content:function(){
							var index = 0;
							for(var i=0;i<trigger.cards.length;i++){
								if(trigger.cards[i].original=='e'||trigger.cards[i].original=='j'){
									for(var j=0;j<=5;++j){
										if(player.storage.lgs_kaizhu[j] == trigger.cards[i]){
											player.storage.lgs_kaizhu[j] = '';
											if(j==0){
												player.enableJudge();
											}
											else{
												player.enableEquip(j);
											}
										}
									}
								}
							}
						},
						sub:true
					},
					mark:{
						charlotte:true,
						trigger:{
							player:['disableEquipEnd','disableJudgeEnd','enableEquipEnd','enableJudgeEnd'],
						},
						firstDo:true,
						filter:true,
						direct:true,
						content:function(){
							if(['disableEquip','disableJudge'].contains(trigger.name))
								player.markSkill('lgs_kaizhu');
							else{
								for(var i=1;i<6;i++)
									if(player.isDisabled(i))
										return;
								if(player.storage._disableJudge) return;
								// if(player.storage.lgs_kaizhu.length) return;
								player.unmarkSkill('lgs_kaizhu');
							}
						},
					},
				},
			},
			lgs_jiangxin:{
				trigger:{
					player:"damageEnd",
				},
				filter:true,
				direct:true,
				content:function(){
					'step 0'
					if(player.countCards('he')<=2)
						player.chooseBool('是否发动匠心？');
					else
						event.choose=true;
					'step 1'
					if(result&&result.bool)
						player.chooseToDiscard('请弃置两张牌','he',2,true);
					else if(event.choose)
						player.chooseToDiscard('是否发动匠心，弃置两张牌？','he',2);
					else
						event.finish();
					'step 2'
					event.Jcards = [];
					if(result.bool){
						// player.logSkill('lgs_jiangxin');
						event.Jcards.addArray(result.cards);
						player.draw('visible');//展示
					}else
						event.finish();
					'step 3'
					event.Jcards.addArray(result);
					var suits={heart:0,diamond:0,spade:0,club:0},max=1
					for(var card of event.Jcards)
						suits[get.suit(card)]++;
					for(var key in suits)
						if(suits[key]>max)
							max=suits[key];
					if(max>=2)
						player.draw(2);
					if(max>=3)
						event.goto(0);
				},
			},
			lgs_mengxu:{
				trigger:{
					player:['phaseZhunbeiBefore','phaseJudgeBefore','phaseDrawBefore','phaseUseBefore','phaseDiscardBefore','phaseJieshuBefore'],
				},
				filter:function(event,player){
					return player.countCards('h')<4;
				},
				forced:true,
				content:function(){
					'step 0'
					player.draw();
					'step 1'
					trigger.cancel();
					var str=''
					switch(trigger.name){
						case 'phaseZhunbei': 
							str="准备阶段";
							break;
						case 'phaseJudge':
							str="判定阶段";
							break;
						case 'phaseDraw': 
							str="摸牌阶段";
							break;
						case 'phaseUse':
							str="出牌阶段";
							break;
						case 'phaseDiscard':
							str="弃牌阶段";
							break;
						case 'phaseJieshu':
							str="结束阶段";
							break;
					}
					game.log(player,'跳过了','#y'+str);
				},
			},
			lgs_yiying:{
				trigger:{global:'useCardAfter'},
				filter:function(event,player){
					return get.color(event.card,event.player)=='red'&&event.targets.contains(event.player)
							&&event.player.hp>player.hp&&!player.hasSkill('lgs_yiying_block')
							&&(target.countCards('he')||player.canUse('sha',event.player,false));
				},
				direct:true,
				content:function(){
					'step 0'
					var target=trigger.player
					event.target=target;
					var control1=target.countCards('he')>0,control2=player.canUse('sha',target,false)
					if(control1&&control2){
						player.chooseControl('选项一','选项二','背水！','cancel2').set('choiceList',[
							'弃置'+get.translation(target)+'1张牌',
							'视为对'+get.translation(target)+'使用1张【杀】',
							'背水！弃置2张手牌并依次执行上述所有选项',
						]).set('ai',function(){
							var player=_status.event.player,target=_status.event.parent.target
							if(get.attitude(player,target)>=0) return 3;
							if(player.countCards('he',function(card){return get.value(card)<7})>2) return 2;
							if(get.effect(target,{name:'sha',isCard:true},player,player)>2) return 1;
							return 0;
						}).set('prompt','义膺：你可以对'+get.translation(target)+'实施惩罚');
					}else if(control1||control2){
						player.chooseBool('是否发动【义膺】，'+(control1?('弃置'+get.translation(target)+'1张牌？'):('视为对'+get.translation(target)+'使用1张【杀】?'))).set('ai',function(){
							var player=_status.event.player,target=_status.event.parent.target
							if(_status.event.discard) return get.attitude(player,target)<0;
						}).set('discard',control1===true);
						event.discard=(control1===true);
						event.goto(2);
					}else
						event.finish()
					'step 1'
					if(result.control!='cancel2'){
						event.index=result.index;
						player.addTempSkill('lgs_yiying_block');
						player.logSkill('lgs_yiying',target);
						// game.log(player,'选择了','#g【义膺】','的','#y'+result.control);
						if(result.index==2) player.chooseToDiscard('背水：请弃置2张手牌',2,true);
						event.goto(3);
					}else
						event.finish();
					'step 2'
					if(result.bool){
						event.index=(event.discard?0:1);
						player.addTempSkill('lgs_yiying_block');
						player.logSkill('lgs_yiying',target);
					}else
						event.finish();
					'step 3'
					if(event.index%2==0&&target.countDiscardableCards(player,'he')) player.discardPlayerCard(target,true);
					'step 4'
					if(event.index>0&&player.canUse('sha',target,false)) player.useCard({name:'sha',isCard:true},target);
				},
				subSkill:{
					block:{charlotte:true},
				},
			},
			lgs_biluo:{
				audio: 'mozhi',
				trigger:{
					player:'loseAfter',
					global:'cardsDiscardAfter',
				},
				filter:function(event,player){
					if(event.name=='lose'){
						if(event.position!=ui.discardPile)
							return false;
					}else{
						var evt=event.getParent().relatedEvent;
						if(!evt||evt.name=='useCard') return false;
						if(evt.player!=player) return false;
					}
					for(var card of event.cards){
						if(['basic','trick'].contains(get.type(card))&&player.hasUseTarget({name:card.name,nature:card.nature,isCard:true},false,true))
							return true;
					}
					return false;
				},
				direct:true,
				popname: true,
				content:function(){
					'step 0'
					var cards=trigger.cards.filter(function(card){
						return ['basic','trick'].contains(get.type(card))&&player.hasUseTarget({name:card.name,nature:card.nature,isCard:true},false,true);
					});
					event.cards=cards;
					if(!cards.length){
						event.finish();
					}else if(cards.length>1){
						event.goto(2);
					}
					'step 1'
					game.delay();
					var card=event.cards[0]
					player.chooseUseTarget('###是否发动【笔落】？###视为使用一张'+(card.nature?get.translation(card.nature):'')+'【'+get.translation(card.name)+'】',{
						name:card.name,
						nature:card.nature,
						isCard:true,
						lgs_biluo:true,
					},false,'nodistance').logSkill='lgs_biluo';
					event.finish();
					'step 2'
					player.chooseButton(['笔落：选择视为使用的牌',event.cards]).set('ai',function(button){
						if(player.getUseValue(button.link,false)<0&&button.link.name!='jiu') return 0;
						return get.order(button.link);
					});
					'step 3'
					if(result.bool){
						game.log(result.links[0]);
						var card=result.links[0]
						event.card=card;
						var cardx={name:card.name,nature:card.nature,isCard:true,lgs_biluo:true}
						player.chooseUseTarget('视为使用一张'+(card.nature?get.translation(card.nature):'')+'【'+get.translation(card.name)+'】',
								cardx,false,'nodistance').set('ai',function(target){
							return Math.max(0.1,get.effect(target,cardx,player,player));
						}).set('logSkill','lgs_biluo');
					}else
						event.finish();
					'step 4'
					// if(result.bool)
						event.cards.remove(event.card);
					if(event.cards.length)
						event.goto(2);
				},
				mod:{
					aiValue:function(player,card,num){
						if(_status.event.name!='chooseToDiscard') return;
						if(player.getUseValue(card,false)>0) return Math.min(1,num);
					},
					aiUseful:function(){
						return lib.skill.lgs_biluo.mod.aiValue.apply(this,arguments);
					},
				},
				ai:{
					effect:{
						player:function(card,player,target){
							if(card.name=='tiesuo'&&card.suit) return 'zeroplayertarget';
							if(card.name=='jiu'&&card.lgs_biluo) return [1,0.1];
						},
					},
				},
			},
			lgs_oldqinhe:{
				locked:true,
				group:['lgs_qinhe_give','lgs_qinhe_gain'],
			},
			lgs_qinhe_give:{
				trigger:{source:'damageSource'},
				filter:function(event,player){
					if(get.itemtype(event.cards)!='cards') return false;
					for(var card of event.cards)
						if(get.position(card,true)=='o')
							return true;
					return false;
				},
				prompt:function(event,player){
					return '是否发动【亲和】，将'+get.translation(event.card)+'交给'+get.translation(event.player)+'？';
				},
				check:function(event,player){
					return get.attitude(player,event.player)>0;
				},
				content:function(){
					trigger.player.gain(trigger.cards.filter(function(card){
						return get.position(card,true)=='o';
					}),'gain2');
				},
			},
			lgs_qinhe_gain:{
				trigger:{
					global:['respond'],
				},
				filter:function(event,player){
					if(event.player==player) return false;
					if(event.name=='lose') return event.type=='discard';
					if(get.itemtype(event.cards)!='cards') return false;
					for(var card of event.cards)
						if(['o','d'].contains(get.position(card,true)))
							return true;
					return player.countCards('he');
				},
				direct:true,
				content:function(){
					'step 0'
					// if(trigger.name=='respond')
						// event.cards=trigger.cards.filter(function(card){
							// return get.position(card,true)=='o';
						// });
					// else{
						// var evt=trigger.getl(trigger.player);
						// event.cards=trigger.getl(trigger.player).cards2.filter(function(card){
							// return get.position(card,true)=='d';
						// });
					// }
					event.cards=trigger.cards.filter(function(card){
						return get.position(card,true)=='o';
					});
					player.chooseToDiscard('是否发动【亲和】，弃置1张牌，获得'+get.translation(event.cards)+'？','he').set('ai',function(card){
						var value=0
						for(var cardx of _status.event.parent.cards)
							value+=get.value(cardx);
						if(_status.event.player.hasSkill('lgs_biluo')) return Math.max(value,7)-get.value(card);
						return value-get.value(card);
					}).set('logSkill','lgs_qinhe');
					'step 1'
					if(result.bool)
						player.gain(event.cards,'gain2','log');
				},
			},
			lgs_qinhe: {
				audio: 'hongyi',
				init(player) {
					player.storage.lgs_qinhe_usable = 2;
				},
				enable: 'phaseUse',
				filter(event, player) {
					return player.storage.lgs_qinhe_usable;
				},
				filterTarget(card, player, target) {
					return !target.hasSkill('lgs_qinhe_he');
				},
				content() {
					player.addTempSkill('lgs_qinhe_reusable', 'phaseUseEnd');
					player.storage.lgs_qinhe_usable--;
					target.addSkill('lgs_qinhe_he');
					target.storage.lgs_qinhe_he_source = player;
				},
				ai: {
					order: 1,
					result: {
						target(player, target) {
							if (player == target) {
								if (!player.hasSkill('lgs_biluo')) return 5;
								return (player.needsToDiscard() && player.hasCard(function(card) {
									return get.tag(card, 'damage') && player.hasValueTarget(card);
								}, 'h') ? 0 : 5);
							} else {
								var effect = -2, current = player.next
								if (get.attitude(player, target) > 0) {
									while (current != target) {
										if (get.attitude(player, current) < 0) effect += 1;
										current = current.next;
									}
									return effect + (3 - target.countCards('h'));
								} else if (get.attitude(player, target) < 0) {
									effect = 2;
									while (current != target) {
										if (get.attitude(player, current) > 0) effect -= 1;
										current = current.next;
									}
									return effect + target.countCards('h');
								}
							}
							return 0;
						},
					},
				},
				group: ['lgs_qinhe_he1', 'lgs_qinhe_he2'],
				subSkill: {
					he: {
						charlotte: true,
						mark: true,
						marktext: '和',
						intro: {
							name: '亲和',
							name2: '和',
							content: '当前拥有“和”标记',
						},
					},
					he1: {
						trigger: {global: 'damageEnd'},
						filter(event, player) {
							return event.player.isAlive() && event.player.hasSkill('lgs_qinhe_he') && event.player.storage.lgs_qinhe_he_source == player;
						},
						forced: true,
						locked: false,
						logTarget: 'player',
						content() {
							'step 0'
							trigger.player.draw(2);
							'step 1'
							player.chooseBool('亲和：是否移除'+get.translation(trigger.player)+'的“和”标记？').set('ai', function() {
								var player = _status.event.player, target = _status.event.getTrigger().player
								var effect = -2, current = _status.currentPhase.next
								if (get.attitude(player, target) > 0) {
									while (current != target) {
										if (get.attitude(player, current) < 0) effect += 1;
										current = current.next;
									}
									return effect + (3 - target.countCards('h')) > 0;
								} else if (get.attitude(player, target) < 0) {
									effect = 2;
									while (current != target) {
										if (get.attitude(player, current) > 0) effect -= 1;
										current = current.next;
									}
									return effect + target.countCards('h') > 0;
								}
								return true;
							});
							'step 2'
							if (result.bool)
								trigger.player.removeSkill('lgs_qinhe_he');
						},
					},
					he2: {
						trigger: {global: 'damageSource'},
						filter(event, player) {
							return event.source.isAlive() && event.source.hasSkill('lgs_qinhe_he') && event.source.storage.lgs_qinhe_he_source == player;
						},
						forced: true,
						locked: false,
						logTarget: 'source',
						content() {
							trigger.source.removeSkill('lgs_qinhe_he');
							if(trigger.source.hasCard(function(card){
								return lib.filter.cardDiscardable(card, trigger.source, 'lgs_qinhe');
							}, 'he'))
								trigger.source.chooseToDiscard(true, 2, 'he');
						}
					},
					reusable: {
						charlotte: true,
						onremove(player) {
							player.storage.lgs_qinhe_usable = 2;
						},
					},
				},
			},
			lgs_shiyuan:{
				init:function(player){
					player.storage.lgs_shiyuan={};
					game.countPlayer(function(current){
						player.storage.lgs_shiyuan[current.playerid]=0;
					});
				},
				trigger:{global:'useCard'},
				filter:function(event,player){
					return event.card.name=='sha';
				},
				prompt2:function(event,player){
					return lib.translate['lgs_shiyuan_info']+'（已对'+get.translation(event.player)+'发动<span class="bluetext">'+player.storage.lgs_shiyuan[event.player.playerid]+'</span>次）';
					// var str=''
					// switch(player.storage.lgs_shiyuan[event.player.playerid]){
						// case 0:
							// str='与你各摸一张牌';
							// break;
						// case 1:
							// str='视为对你使用一张杀';
							// break;
						// case 2:
							// str='你失去技能【释怨】';
							// break;
					// }
					// return '###是否发动【释怨】？###令杀无效，'+get.translation(player)+'收回此杀，'+str;
				},
				content:function(){
					'step 0'
					trigger.cancel();
					'step 1'
					trigger.player.gain(trigger.cards.filterInD('od'),'gain2');
					'step 2'
					switch(player.storage.lgs_shiyuan[trigger.player.playerid]++){
						case 0:
							game.asyncDraw([player,trigger.player]);
							break;
						case 1:
							if(trigger.player.canUse({name:'sha',isCard:true},player,false))
								trigger.player.useCard({name:'sha',isCard:true},player);
							break;
						case 2:
							player.removeSkill('lgs_shiyuan');
					}
					'step 3'
					game.delayx();
				},
			},
			lgs_qianyin:{
				init:function(player){
					player.storage.lgs_qianyin=[
						'lgs_gangrou','lgs_yanhuan','lgs_beishan','lgs_xingchi','lgs_bushi','lgs_boshi','lgs_youtu','lgs_yian',
						'lgs_yingsuo','lgs_tiewan','lgs_qishi','lgs_yange','lgs_polu','lgs_juesha','lgs_xinyou','lgs_qingshen',
						'lgs_gangqu','lgs_liepo','lgs_zaoxing','lgs_qianye','lgs_tianle','lgs_jieyou','lgs_fangyan','lgs_ezuo',
						'lgs_zhiyong','lgs_linyi','lgs_daimeng','lgs_shensuan','lgs_jinyi','lgs_qiujin','lgs_ganggan','lgs_xiyan',
						'lgs_hanxiao','lgs_chenghuan','lgs_shanxuan','lgs_jieyi','lgs_guanglan','lgs_hairong','lgs_xingxi','lgs_bomie',
						'lgs_fengyu','lgs_jianxing','lgs_jisun','lgs_hongqi','lgs_yonglan','lgs_yinzhi','lgs_yinwei','lgs_shenhuai',
						'lgs_kubi','lgs_chengmian','lgs_zhiji','lgs_miaokou','lgs_feiqiu','lgs_yeyin','lgs_mengxu','lgs_yiying',
						'lgs_qiezhu','lgs_shannian','lgs_jingyao','lgs_qiaohui','lgs_qingwei','lgs_langfang','lgs_qishang','lgs_shuanglun',
						'lgs_yanta','lgs_yingcun','lgs_chijiang','lgs_huiyou','lgs_zhenji','lgs_xinxing','lgs_biluo','lgs_qinhe',
						'lgs_xiaokan','lgs_caisi','lgs_kaizhu','lgs_jiangxin','lgs_jinyi','lgs_shuangzhi','lgs_jingshu','lgs_duyi',
						'lgs_jifei','lgs_minghao','lgs_zhiqian','lgs_wendao','lgs_fengsao','lgs_weizun','lgs_liangcong','lgs_gufang',
						'lgs_yasi','lgs_linuo','lgs_chaojie','lgs_jueyi','lgs_qinmian','lgs_yunshi','lgs_jiaoxin','lgs_keyan',
						'lgs_renjian','lgs_zhanyue','lgs_huixie','lgs_jieshen','lgs_fenqu','lgs_shouye','lgs_ciai','lgs_zongyu',
						'lgs_nixi',//'lgs_','lgs_','lgs_','lgs_','lgs_','lgs_','lgs_',
					];
					if(game.mode=='identity')
						player.storage.lgs_qianyin.push('lgs_huishi');
				},
				trigger:{
					player:['damageEnd','recoverAfter'],
					source:'damageSource',
				},
				filter:true,
				forced:true,
				content:function(){
					'step 0'
					if(player.storage.lgs_qianyin2){
						player.removeSkill(player.storage.lgs_qianyin2);
						game.log(player,'失去了技能','#g'+lib.translate[player.storage.lgs_qianyin2]);
					}
					if(!player.storage.lgs_qianyin.length)
						return;
					player.storage.lgs_qianyin2=player.storage.lgs_qianyin.randomRemove();
					player.addSkillLog(player.storage.lgs_qianyin2);
				},
			},
			lgs_jifei:{
				trigger:{global:"useCardToPlayered"},
				filter:function(event,player){
					return event.targets.length==1&&event.targets[0]!=player&&event.targets[0]!=event.player&&player.canCompare(event.player);
				},
				check:function(event,player){
					return get.attitude(player,event.player)<0&&player.countCards('h',function(card){
						return get.number(card,player)>10;
					});
				},
				logTarget:'player',
				content:function(){
					'step 0'
					event.target=trigger.player;
					player.chooseToCompare(event.target);
					'step 1'
					if(!result.tie){
						if(result.bool){
							player.draw('visible');
						}
						else if(target.canUse({name:'juedou',isCard:true},player)){
							target.draw('visible');
						}
					}
				},
				ai:{
					expose:0.2,
				},
			},
			lgs_minghao:{
				init:function(player){
					player.storage.lgs_minghao={};
				},
				trigger:{global:'phaseJieshuBegin'},
				filter:function(event,player){
					return event.player!=player&&!player.hasSkill('lgs_minghao_block')&&event.player.countCards('h');
				},
				direct:true,
				content:function(){
					'step 0'
					if(event.lgs_minghao==undefined)
						event.lgs_minghao=[];
					var list=[],target=trigger.player;
					event.target=target;
					for(var i of lib.inpile){
						if(event.lgs_minghao.contains(i)) continue;
						if(get.type(i)=='basic') list.push(['基本','',i]);
						if(get.type(i,'trick')=='trick') list.push(['锦囊','',i]);
						if(get.type(i)=='equip') list.push(['装备','',i]);
					}
					player.chooseButton(['明毫：猜测'+get.translation(target)+'拥有的手牌',[list,'vcard']]).set('ai',function(button){
						// game.log('minghao-ai');
						// game.log(player.storage.lgs_minghao[target.playerid]);
						if(get.attitude(player,target)>=0) return 0;
						var cards=[]
						if(Array.isArray(player.storage.lgs_minghao[target.playerid]))
							cards=player.storage.lgs_minghao[target.playerid];
						for(var card of cards)
							if(button.link[2]==card.name){
								if(get.type(button.link[2],'trick')=='trick') return 14;
								if(['tao','jiu'].contains(card.name)) return 13;
								if(get.type(button.link[2])=='equip') return 12;
								if(card.name=='shan') return 11;
								return 10;
							}
						if(event.lgs_minghao.length||target.countCards('h')>2||target.next.seat==1){
							switch(button.link[2]){
								case 'shan':
									return 6;
								case 'sha':
									return 5;
								case 'tao':
									return Math.min(4,target.hp-0.5+Math.random());
								case 'wuxie':
									return 3;
								case 'jiu':
									return 2;
								default:
									return 0.5+Math.random();
							}
						}else
							return 0;
					});
					'step 1'
					game.log('minghao-step1');
					if(result.bool){
						player.logSkill('lgs_minghao',target);
						var name=result.links[0][2];
						player.chat(get.translation(name));
						game.log(player,'猜测',target,'手牌中有','#y'+get.translation(name));
						if(target.countCards('h',name)){
							game.log(player,'猜测正确');
							event.lgs_minghao.push(name);
							switch(name){
								case 'sha':
									game.log(player.canUse('sha',target,false));
									if(player.canUse('sha',target,false))
										player.useCard({name:'sha',isCard:true},target);
									break;
								case 'shan':
									if(target.countDiscardableCards('he'))
										player.discardPlayerCard(target,true);
									break;
								case 'tao':
								case 'jiu':
									if(target.countGainableCards('he'))
										player.gainPlayerCard(target,true);
									break;
								default:
									if(get.type(name,'trick')=='trick'){
										target.discard(target.getCards('he',name));
										if(!player.isLinked())
											player.link();
									}else if(get.type(name,'equip'))
										target.damage(player);
							}
						}else{
							game.log(player,'猜测错误');
							if(!event.lgs_minghao.length)
								player.addTempSkill('lgs_minghao_block','roundStart');
							event.finish();
						}
					}else
						event.finish();
					'step 2'
					if(target.countCards('h'))
						event.goto(0);
				},
				ai:{
					threaten:1.4,
				},
				group:['lgs_minghao_aistorage','lgs_minghao_aiclear'],
				subSkill:{
					block:{charlotte:true},
					aistorage:{
						trigger:{global:'gainEnd'},
						firstDo:true,
						popup:false,
						filter:function(event,player){
							// game.log('minghao_gain');
							// game.log(event.visible);
							// game.log(event.animate);
							return event.player!=player&&['give','gain','gain2'].contains(event.animate);
						},
						forced:true,
						content:function(){
							if(!Array.isArray(player.storage.lgs_minghao[trigger.player.playerid]))
								player.storage.lgs_minghao[trigger.player.playerid]=[];
							player.storage.lgs_minghao[trigger.player.playerid].addArray(trigger.cards);
						},
					},
					aiclear:{
						trigger:{global:['loseEnd','loseAsyncEnd']},
						firstDo:true,
						popup:false,
						filter:function(event,player){
							// game.log('minghao_lose');
							// game.log(event.visible);
							var evt1=event.getParent();
							// game.log(evt1.name,' ',evt1.animate);
							if(event.name=='loseAsync'){
								var evtx=event.parent
								if(!evtx||!evtx.name||evtx.name!='chooseToCompare') return false;
							}else if(!event.visible) return false;
							var evt=event.getl(event.player);
							return evt&&evt.hs&&evt.hs.length>0;
						},
						forced:true,
						content:function(){
							if(!Array.isArray(player.storage.lgs_minghao[trigger.player.playerid]))
								player.storage.lgs_minghao[trigger.player.playerid]=[];
							else{
								var evt=trigger.getl(trigger.player);
								player.storage.lgs_minghao[trigger.player.playerid].removeArray(evt.hs);
							}
						},
					},
				},
			},
			lgs_zhiqian:{
				locked:true,
				group:['lgs_zhiqian_draw','lgs_zhiqian_discard'],
			},
			lgs_zhiqian_draw:{
				trigger:{player:'phaseDrawBegin1'},
				forced:true,
				filter:function(event,player){
					if(game.hasPlayer(function(current){
						return current.countCards('h')<player.countCards('h');
					})) return false;
					return !event.numFixed;
				},
				content:function(){
					trigger.changeToZero();
					var num=0;
					game.countPlayer(function(current){
						if(current.countCards('h')>num)
							num=current.countCards('h');
					});
					if(num){
						player.draw(num);
					}
				},
			},
			lgs_zhiqian_discard:{
				trigger:{player:'chooseToDiscardBefore'},
				forced:true,
				filter:function(event,player){
					if(event.getParent().name!='phaseDiscard') return false;
					if(game.hasPlayer(function(current){
						return current.countCards('h')>player.countCards('h');
					})) return false;
					return true;
				},
				content:function(){
					var num=player.countCards('h');
					game.countPlayer(function(current){
						if(current.countCards('h')<num)
							num=current.countCards('h');
					});
					if(!num)
						trigger.cancel();
					else
						trigger.selectCard=[num,num];
				},
			},
			lgs_wendao:{
				enable:"chooseToUse",
				filter:function(event,player){
					return event.type!='wuxie'&&event.type!='dying'&&!event.lgs_wendao_block;
				},
				selectCard:[1,2],
				filterCard:true,
				position:'he',
				content:function(){
					'step 0'
					var evt=event.getParent(2);
					evt.lgs_wendao_block=true;
					evt.goto(0);
					player.draw((event.cards.length==1?2:1),'visible');
					'step 1'
					var evt=event.getParent(2);
					evt.lgs_wendao1=[];evt.lgs_wendao2=[];
					for(var card of event.cards)
						evt.lgs_wendao1.add(get.suit(card,player));
					for(var card of result)
						evt.lgs_wendao2.add(get.type(card,'trick',player));
					var suits='',types='';
					for(var i=0;i<evt.lgs_wendao1.length;i++){
						if(i)
							suits+='、';
						suits+=get.translation(evt.lgs_wendao1[i]);
					}
					for(var i=0;i<evt.lgs_wendao2.length;i++){
						if(i)
							types+='、';
						types+=get.translation(evt.lgs_wendao2[i])+'牌';
					}
					// evt.skillDialog=ui.create.dialog('已发动【问道】<br>使用'+suits+'牌无距离与次数限制<br>不能使用'+types);
					evt.openskilldialog='请选择要使用的牌<br>（已发动【问道】<br>使用'+suits+'牌无距离与次数限制<br>不能使用'+types+')';
				},
				mod:{
					cardUsable:function(card,player){
						var evt=_status.event;
						if(evt.lgs_wendao1&&evt.lgs_wendao1.contains(get.suit(card,player))) return Infinity;
					},
					targetInRange:function(card,player){
						var evt=_status.event;
						if(evt.lgs_wendao1&&evt.lgs_wendao1.contains(get.suit(card,player))) return true;
					},
					cardEnabled:function(card,player){
						var evt=_status.event;
						if(evt.lgs_wendao2&&evt.lgs_wendao2.contains(get.type(card,'trick',player))) return false;
					},
					// playerEnabled:function(card,player,target){
						// var evt=_status.event;
						// if(get.info(card).notarget) return false;
						// if(evt.lgs_wendao2&&evt.lgs_wendao2.contains(get.type(card,'trick',player)&&target!=player)) return false;
					// },
				},
			},
			lgs_fengsao:{
				mark:true,
				intro:{
					name:'风骚',
					// markcount:(storage,player)=>{return player.storage.lgs_fengsao+1},
					mark:function(dialog,content,player){
						dialog.addText('使用记录：');
						var history=game.getAllGlobalHistory('useCard',evt=>{
							return evt.player!=player&&get.type(evt.card)!='equip';
						}).reverse();
						if(!history.length){
							dialog.addText('无');
						}else{
							if(history.length>3) history.length=3;
							var cards=''
							for(var evt of history){
								if(cards.length)
									cards+='、';
								cards+=get.translation(evt.card);
							}
							dialog.addText(cards);
						}
					},
				},
				init:function(player){
					player.storage.lgs_fengsao=0;
				},
				enable:'chooseToUse',
				// usable:3,
				filter:function(event,player){
					if(player.storage.lgs_fengsao>=3) return false;
					var history=game.getAllGlobalHistory('useCard',evt=>{
						return evt.player!=player&&get.type(evt.card)!='equip';
					}).reverse();
					if(history.length<=player.storage.lgs_fengsao) return false;
					var card=history[player.storage.lgs_fengsao].card
					return event.filterCard({name:card.name,nature:card.nature,lgs_fengsao:true},player,event)&&player.countCards('he');
				},
				filterCard:true,
				position:'hes',
				prompt:function(event){
					var history=game.getAllGlobalHistory('useCard',evt=>{
						return evt.player!=event.player&&get.type(evt.card)!='equip';
					});
					var card=history[history.length-event.player.storage.lgs_fengsao-1].card
					return '将一张牌当'+get.translation({name:card.name,nature:card.nature})+'使用';
				},
				viewAs:function(cards,player){
					var history=game.getAllGlobalHistory('useCard',evt=>{
						return evt.player!=player&&get.type(evt.card)!='equip';
					});
					var card=history[history.length-player.storage.lgs_fengsao-1].card;
					return {name:card.name,nature:card.nature,lgs_fengsao:true};
				},
				precontent:function(){
					player.storage.lgs_fengsao++;
					player.addTempSkill('lgs_fengsao_clear');
				},
				mod:{
					cardUsable:function(card){
						if(card&&card.lgs_fengsao) return Infinity;
					},
					targetInRange:function(card){
						if(card&&card.lgs_fengsao) return true;
					},
				},
				ai:{
					order:function(item,player){
						var history=game.getAllGlobalHistory('useCard',evt=>{
							return evt.player!=player&&get.type(evt.card)!='equip';
						});
						var card=history[history.length-player.storage.lgs_fengsao-1].card;
						if(card.name=='sha'&&(player.storage.lgs_fengsao==0||!player.hasValueTarget(history[history.length-player.storage.lgs_fengsao-1].card)))
							return get.order({name:'sha'})-0.1;
						return 8.5;
					},
				},
				subSkill:{
					clear:{
						onremove:function(player){
							player.storage.lgs_fengsao=0;
						},
					},
				},
			},
			lgs_weizun:{
				limited:true,
				skillAnimation:'epic',
				animationColor:'fire',
				enable:'phaseUse',
				filterTarget:function(card,player,target){
					return target!=player;
				},
				unique:true,
				line:'fire',
				content:function(){
					'step 0'
					event.targets=game.filterPlayer(function(current){return current!=player});
					// game.log('weizun',event.targets);
					'step 1'
					event.current=event.targets.shift();
					event.current.chooseToUse().set('targetRequired',true).set('complexSelect',true).set('targetRequired',true).set('filterTarget',function(card,player,target){
						if(target!=_status.event.sourcex&&!ui.selected.targets.contains(_status.event.sourcex)) return false;
						return lib.filter.filterTarget.apply(this,arguments);
					}).set('sourcex',target);
					'step 2'
					if(result.bool){
						player.addSkill('lgs_weizun_shaMod');
						player.storage.lgs_weizun++;
						if(targets.length)
							event.goto(1);
					}else if(player.canUse('sha',event.current,false))
						player.chooseBool('是否视为对'+get.translation(event.current)+'使用杀？');
					'step 3'
					if(result.bool)
						player.useCard({name:'sha',isCard:true},event.current);
					if(targets.length)
						event.goto(1);
					'step 4'
					player.awakenSkill('lgs_weizun');
				},
				ai:{
					order:1,
					result:{
						player:function(player,target){
							// if(player.hasUnknown()) return 0;
							var effect=0
							effect+=Math.max(0,get.effect(target,{name:'sha',isCard:true},player,player));
							game.countPlayer(function(current){
								if(current==player||current==target) return;
								if(get.attitude(player,current)>0){
									if(current.hasSha()&&current.canUse({name:'sha'},target)&&get.effect(target,{name:'sha'},current,player)>0) effect+=1.1;
								}else if(get.effect(current,{name:'sha',isCard:true},player,player)>0)
									effect+=0.8;
							});
							if(effect<2+game.countPlayer()) return 0;
							return effect;
						},
					},
				},
				subSkill:{
					shaMod:{
						init:function(player){
							player.storage.lgs_weizun=0;
						},
						mod:{
							cardUsable:function(card,player,num){
								if(card.name=='sha') return num+player.storage.lgs_weizun;
							},
						},
					},
				},
			},
			lgs_liangcong:{
				trigger:{
					source:'damageSource',
					player:'damageEnd',
				},
				filter:function(event,player){
					return !event.lgs_liangcong;
				},
				direct:true,
				content:function(){
					'step 0'
					trigger.lgs_liangcong=true;
					var source=trigger.source,victim=trigger.player
					
					// prompt and ai
					var str1='弃置',str2='弃置',strsource='',strvictim=get.translation(victim)
					var check1=0,check2=0,check
					if(source) strsource=get.translation(source);
					if(source==player) strsource='你';
					if(victim==player) strvictim='你';
					if(source&&source.getEquip(1)){
						event.control1=true;
						str1+=strsource+'的'+get.translation(source.getEquip(1));
						check1-=get.sgnAttitude(player,source)*get.equipValue(source.getEquip(1));
						if(source==player&&player.hasSkill('lgs_gufang')&&player.isMaxEquip(true)) check1+=3;
					}
					if(victim.getEquip(2)){
						event.control1=true;
						str1+=(str1.length==2?'':'和')+(str1.length>2&&strsource==strvictim?'':strvictim+'的')+get.translation(victim.getEquip(2));
						check1-=get.sgnAttitude(player,victim)*get.equipValue(victim.getEquip(2));
						if(victim==player&&source!=player&&player.hasSkill('lgs_gufang')&&player.isMaxEquip(true)) check1+=3;
					}
					if(source&&source.getEquip(4)){
						event.control2=true;
						str2+=strsource+'的'+get.translation(source.getEquip(4));
						check2-=get.sgnAttitude(player,source)*get.equipValue(source.getEquip(4));
						if(source==player&&player.hasSkill('lgs_gufang')&&player.isMaxEquip(true)) check2+=3;
					}
					if(victim.getEquip(3)){
						event.control2=true;
						str2+=(str2.length==2?'':'和')+(str2.length>2&&strsource==strvictim?'':strvictim+'的')+get.translation(victim.getEquip(3));
						check2-=get.sgnAttitude(player,victim)*get.equipValue(victim.getEquip(3));
						if(victim==player&&source!=player&&player.hasSkill('lgs_gufang')&&player.isMaxEquip(true)) check2+=3;
					}
					if(check1<0&&check2<0)
						check=2;
					else{
						if(check1>check2) check=0;
						else check=1
					}
					// end prompt and ai
					
					if(event.control1&&event.control2)
						player.chooseControlList([str1,str2]).set('prompt','是否发动【良从】?').set('ai',function(){
							return _status.event.check;
						}).set('check',check);
					else{
						event.goto(2);
						if(event.control1)
							player.chooseBool('###是否发动【良从】?###你可以'+str1).set('ai',function(){
								return _status.event.check;
							}).set('check',(check1>0?true:false));
						else if(event.control2)
							player.chooseBool('###是否发动【良从】?###你可以'+str2).set('ai',function(){
								return _status.event.check;
							}).set('check',(check2>0?true:false));
						else
							event.finish();
					}
					'step 1'
					if(result.control=='cancel2')
						event.finish();
					else
						event.goto(3);
					'step 2'
					if(!result.bool)
						event.finish();
					'step 3'
					player.logSkill('lgs_liangcong');
					var targets=[],source=trigger.source,victim=trigger.player,subtype1,subtype2
					if(result.index!=undefined){
						if(result.index==0){subtype1=1;subtype2=2;}
						else {subtype1=4;subtype2=3;}
					}else if(event.control1){subtype1=1;subtype2=2;}
					else {subtype1=4;subtype2=3;}
					if(source&&source.getEquip(subtype1)){
						targets.push(source)
						source.discard(source.getEquip(subtype1));
					}if(victim.getEquip(subtype2)){
						targets.push(victim);
						victim.discard(victim.getEquip(subtype2));
					}
					player.line(targets);
				},
			},
			lgs_gufang:{
				trigger:{player:'phaseJieshuBegin'},
				filter:function(event,player){
					return player.canMoveCard(null,true)||player.isMaxEquip(true);
				},
				forced:true,
				locked:false,
				frequent:true,
				content:function(){
					'step 0'
					if(!player.isMaxEquip(true))
						player.moveCard('是否发动【孤芳】，移动场上的一张装备牌？').nojudge=true;
					'step 1'
					if(player.isMaxEquip(true))
						player.chooseBool('是否发动【孤芳】，摸1张牌？').set('frequentSkill','lgs_gufang');
					else
						event.finish();
					'step 2'
					if(result.bool)
						player.draw();
				},
			},
			lgs_yasi:{
				enable:'phaseUse',
				usable:1,
				filter:function(event,player){
					return player.countCards('h',function(card){
						return get.color(card,player)=='red';
					});
				},
				filterCard:function(card,player){
					return get.color(card)=='red';
				},
				position:'he',
				check:function(card){
					return 9-get.value(card)
				},
				filterTarget:true,
				content:function(){
					'step 0'
					target.judge(function(card){
						if(get.number(card)>=7) return 4;
						return 0;
					}).judge2=function(result){
						return result.bool?true:false;
					};
					'step 1'
					if(result.bool){
						target.draw(2);
						target.recover();
					}
				},
				ai:{
					order:11,
					result:{
						target:function(player,target){
							// game.log('yasi-result-target',target);
							var result=get.recoverEffect(target,player)+2,list1=[
								'paoxiao','repaoxiao','shuangxiong','reshuangxiong','xinxhzhiyan','chengzhao','duwu',
								'liechi','jianzheng','kaikang',
								'lgs_shensuan','lgs_jinyi','lgs_fengsao','lgs_jiehuo',
							],list2=[
								'zhiheng','rezhiheng','shenzhu','lgs_gangrou','lgs_yinwei','lgs_shouye',
							];
							// game.log('result:',result);
							for(var skill of list1)
								if(target.hasSkill(skill))
									result+=1;
							for(var skill of list2)
								if(target.hasSkill(skill))
									result+=2;
							return result;
						},
					},
				},
			},
			lgs_linuo:{
				trigger:{global:'judge'},
				filter:function(event,player){
					return !player.hasSkill('lgs_linuo_block');
				},
				check:function(event,player){
					var attitude=get.attitude(player,event.player)
					if(attitude==0) return false;
					game.log(event.judge(event.player.judging[0]));
					if(attitude>0) return event.judge(event.player.judging[0])<=0;
					return event.judge(event.player.judging[0])>0;
				},
				content:function(){
					'step 0'
					player.addTempSkill('lgs_linuo_block');
					var card=get.cards()[0]
					event.card=card;
					player.showCards(card,get.translation(player)+'发动了【立诺】');
					'step 1'
					var number=card.number
					var next=player.chooseControl('点数+'+number,'点数-'+number,'花色改为'+get.translation(card.suit),'cancel2');
					next.set('prompt',get.translation(trigger.player)+'的'+(trigger.judgestr||'')+'判定为'
							+get.translation(trigger.player.judging[0])+'，'+'你可以对判定牌执行一项更改');
					next.set('ai',function(){
						var trigger=_status.event.getTrigger(),player=_status.event.player,judging=_status.event.judging,card=_status.event.parent.card;
						var attitude=get.attitude(player,trigger.player);
						if(attitude==0) return 0;
						// 待添加：与王逸轩配合
						var card1=judging.copy(),card2=judging.copy(),card3=judging.copy()
						card1.number=Math.min(card1.number+card.number,13);
						card2.number=Math.max(card2.number-card.number,1);
						card3.suit=card.suit;
						var result=[
							trigger.judge(card1)-trigger.judge(judging),
							trigger.judge(card2)-trigger.judge(judging),
							trigger.judge(card3)-trigger.judge(judging)
						],index
						if(attitude>0){
							index=result.indexOf(Math.max(...result));
							if(result[index]<=0) index=0;
						}else{
							index=result.indexOf(Math.min(...result));
							if(result[index]>=0) index=0;
						}
						return index;
					}).set('judging',trigger.player.judging[0]);
					'step 2'
					game.broadcastAll(function(card,judge,evt,player,result){
						switch(result.index){
							case 0:
								judge.number=Math.min(judge.number+card.number,13);
								break;
							case 1:
								judge.number=Math.max(judge.number-card.number,1);
								break;
							case 2:
								judge.suit=card.suit;
								break;
						}
						if(result.control!='cancel2'){
							judge.init([judge.suit,judge.number,judge.name,judge.nature]);
							ui.arena.removeChild(evt.node);
							// game.addVideo('deletenode',player,get.cardsInfo([judge.clone]));
							evt.node=player.$throwordered(judge.copy(),true);
						}
					},card,trigger.player.judging[0],trigger,player,result);
					switch(result.index){
						case 0:case 1:
							game.log(trigger.player,'的判定牌点数改为'+get.strNumber(trigger.player.judging[0].number));break;
						case 2:
							game.log(trigger.player,'的判定牌花色改为'+get.translation(trigger.player.judging[0].suit));break;
					}
					game.cardsDiscard(card);
				},
				ai:{rejudge:true},
				subSkill:{
					block:{charlotte:true},
				},
			},
			lgs_huishi:{
				onremove:function(player){
					game.countPlayer(function(current){
						current.removeSkill('lgs_huishi_mark');
					});
				},
				trigger:{global:'phaseJieshuBegin'},
				filter:function(event,player){
					return !player.hasSkill('lgs_huishi_block')&&event.player!=player&&!event.player.storage.lgs_huishi&&event.player.isAlive();
				},
				direct:true,
				content:function(){
					'step 0'
					event.target=trigger.player;
					player.chooseButton(['慧识：你可以猜测'+get.translation(event.target)+'的身份',[[['','','huishi_zhu'],['','','huishi_zhong'],['','','huishi_fan'],['','','huishi_nei']],'vcard']]).set('ai',function(button){
						var card=button.link,player=_status.event.player,target=_status.event.getTrigger().player
						if(target.identity=='zhu') return (card[2]=='huishi_zhu')?1:0;
						if(get.attitude(player,target)==0) return 0;
						if(player.identity=='nei') return (card[2].slice(7)==target.identity)?1:0;
						var pair1={'zhu':'fan','zhong':'fan','fan':'zhong'},pair2={'zhu':'zhong','zhong':'nei','fan':'fan'},probably
						if(get.attitude(player,target)>0)
							probably=pair2[player.identity];
						else
							probably=pair1[player.identity];
						var num=game.countPlayer2(function(current){
							return current.forceShown&&current.identity==probably;
						})
						// game.log('probably ',probably);
						// game.log('huishi_ai-num ',num);
						if(probably=='zhong'&&num>=2) probably='nei';
						if(probably=='fan'&&num>=4) probably='nei';
						if(probably=='nei'&&num>=1) probably='zhong';
						return (card[2].slice(7)==probably)?1:0;
					});
					'step 1'
					if(result.bool){
						player.logSkill('lgs_huishi',target);
						target.storage.lgs_huishi=true;
						var str='猜测错误'
						if(result.links[0][2].slice(7)==target.identity){
							str='猜测正确';
							if(player==game.me)
								target.setIdentity();
							game.log(target,'获得了','#y“识”标记');
							target.addSkill('lgs_huishi_mark');
							event.finish();
						}else{
							player.addTempSkill('lgs_huishi_block',{player:'phaseBegin'});
							player.chooseBool('猜错了！是否对'+get.translation(target)+'造成一点伤害？');
						}
						
						game.broadcastAll(function(str,player,target){
							var dialog = ui.create.dialog(get.translation(player)+'对'+get.translation(target)+'的身份'+str);
							dialog.classList.add('center');
							setTimeout(function(){
								dialog.close();
							},1000);
						},str,player,target);
					}else
						event.finish();
					'step 2'
					if(result.bool){
						player.line(target);
						target.damage(player);
					}
				},
				subSkill:{
					mark:{
						mark:true,
						marktext:'识',
						intro:{
							name:'慧识',
							markcount:()=>0,
							content:'拥有“识”标记',
						},
					},
					block:{charlotte:true},
				},
			},
			lgs_jiechong:{
				unique:true,
				juexingji:true,
				skillAnimation:true,
				animationColor:'grey',
				derivation:'lgs_wangxian',
				trigger:{player:'phaseZhunbeiBegin'},
				filter:function(event,player){
					return !game.hasPlayer(function(current){
						if(current==player) return false;
						return !current.storage.lgs_huishi;
					});
				},
				forced:true,
				content:function(){
					'step 0'
					player.loseMaxHp();
					player.addSkillLog('lgs_wangxian');
					var targets=game.filterPlayer(function(current){return current.hasSkill('lgs_huishi_mark')})
					event.targets=targets;
					targets.sort(lib.sort.seat);
					if(targets.length)
						player.line(targets);
					else
						event.finish();
					'step 1'
					var target=targets.shift();
					event.target=target;
					target.chooseControlList([
						'移除“识”标记，然后受到'+get.translation(player)+'造成的2点伤害',
						'亮出身份牌，然后'+get.translation(player)+'可以视为对你使用一张【杀】',
					],true).set('ai',function(){
						if(get.attitude(target,player)>0) return 1;
						if(get.damageEffect(target,player,target)>=0) return 0;
						return 1;
					});
					'step 2'
					if(result.index){
						// target.showCards(game.createCard('huishi_'+target.identity,'',''));
						game.broadcastAll(function(player,target){
							target.setIdentity();
							target.forceShown=true;
							var card=game.createCard('huishi_'+target.identity,'','');
							// card.classList.add('selected');
							target.$throw(card,1000,'nobroadcast');
						},player,target);
						var table={zhu:'#r',zhong:'#y',fan:'#g',nei:'#b'}
						game.log(target,'展示了身份牌，身份为',table[target.identity]+get.translation('huishi_'+target.identity));
						game.delayx();
						if(player.canUse('sha',target,false))
							player.chooseBool('是否视为对'+get.translation(target)+'使用一张【杀】？').set('ai',function(){
								return get.effect(target,{name:'sha',isCard:true},player,player)>0;
							});
						else
							event.goto(4);
					}else{
						target.removeSkill('lgs_huishi_mark');
						game.log(target,'移除了','#y“识”','标记');
						target.damage(3,player);
						event.goto(4);
					}
					'step 3'
					if(result.bool)
						player.useCard({name:'sha',isCard:true},target).addCount=false;
					'step 4'
					if(targets.length)
						event.goto(1);
					else
						player.awakenSkill('lgs_jiechong');
				},
				ai:{
					combo:'lgs_huishi',
				},
			},
			lgs_wangxian:{
				locked:true,
				unique:true,
				ai:{combo:'lgs_huishi'},
				group:['lgs_wangxian_draw1','lgs_wangxian_draw2'],
				subSkill:{
					draw1:{
						trigger:{player:'damageEnd'},
						filter:function(event,player){
							return event.source&&event.source.hasSkill('lgs_huishi_mark');
						},
						prompt:function(event){
							return '###是否发动【忘嫌】？###你可以令'+get.translation(event.source)+'摸3张牌';
						},
						check:function(event,player){
							return get.attitude(player,event.source)>0;
						},
						content:function(){
							trigger.source.draw(3,player);
						},
					},
					draw2:{
						trigger:{source:'damageSource'},
						filter:function(event,player){
							return event.player.hasSkill('lgs_huishi_mark');
						},
						prompt:function(event){
							return '###是否发动【忘嫌】？###你可以摸3张牌，本回合不能再对'+get.translation(event.player)+'使用牌';
						},
						check:()=>true,
						content:function(){
							'step 0'
							player.draw(3);
							'step 1'
							player.addTempSkill('lgs_wangxian_disable');
							player.storage.lgs_wangxian_disable.push(trigger.player);
						},
					},
					disable:{
						init:function(player){
							if(!Array.isArray(player.storage.lgs_wangxian_disable))
								player.storage.lgs_wangxian_disable=[];
						},
						onremove:function(player){
							player.storage.lgs_wangxian_disable=[];
						},
						mod:{
							playerEnabled:function(card,player,target){
								if(player.storage.lgs_wangxian_disable.contains(target)) return false;
							},
						},
					},
				},
			},
			lgs_chaojie:{
				trigger:{player:'damageBegin4'},
				filter:true,
				check:function(event,player){
					var source=event.source
					if(source.countCards('h')>player.countCards('h')) return get.attitude(player,target)<=0;
					if(source.countCards('h')==player.countCards('h')) return true;
					var list=[],value=0
					for(var card of player.getCards('h'))
						list.push(get.value(card));
					list.sort(function(a,b){return a>b});
					for(var i=0;i<player.countCards('h')-source.countCards('h');i++)
						value+=list[i];
					return value<=7;
				},
				content:function(){
					'step 0'
					var source=trigger.source
					if(source&&source.isAlive()){
						if(source.countCards('h')>player.countCards('h')){
							source.chooseToDiscard(source.countCards('h')-player.countCards('h'),'h',true);
							event.finish();
						}else if(source.countCards('h')<player.countCards('h'))
							player.chooseToDiscard(player.countCards('h')-source.countCards('h'),'h',true);
					}
					'step 1'
					game.log(player,'令伤害无效');
					trigger.cancel();
				},
			},
			lgs_jueyi:{
				shaRelated:true,
				trigger:{global:'useCardToPlayered'},
				filter:function(event,player){
					return event.card.name=='sha'&&player.countCards('he')&&event.target.isIn();
				},
				direct:true,
				content:function(){
					'step 0'
					player.chooseToDiscard(get.prompt2('lgs_jueyi',trigger.target),'he').set('ai',function(card){
						if(!_status.event.go) return 0;
						return get.unuseful(card);
					}).set('go',get.effect(trigger.target,trigger.card,trigger.player,player)>0&&trigger.target.mayHaveShan());
					'step 1'
					if(result.bool){
						player.logSkill('lgs_jueyi',trigger.target);
						trigger.getParent().directHit.add(trigger.target);
					}
				},
				ai:{
					expose:0.2,
				},
			},
			lgs_qinmian:{
				init:function(player){
					player.storage.lgs_qinmian=0;
				},
				intro:{
					content:'已发动#次【勤勉】',
				},
				trigger:{player:'useCard'},
				filter:function(event,player){
					return !player.hasSkill('lgs_qinmian_block')&&player==_status.currentPhase&&player.countCards('he');
				},
				check:function(event,player){
					var cards=player.getCards('he')
					var X=player.countMark('lgs_qinmian')+1
					if(X>=cards.length){
						for(var card of player.getCards('hs')){
							if((player.countCards('e','zhuge')||card.name!='sha')&&player.hasValueTarget(card))
								return false;
						}
					}
					var value=0
					cards.sort(function(a,b){return get.value(a)>get.value(b)});
					for(var i=0;i<Math.min(cards.length,X);i++){
						value+=get.value(cards[i]);
					}
					return value<=X*(5+player.countCards('he'));
				},
				content:function(){
					'step 0'
					// if(!player.isUnderControl)
					game.delay()
					player.addTempSkill('lgs_qinmian_clear');
					player.addMark('lgs_qinmian');
					event.X=player.countMark('lgs_qinmian');
					player.chooseToDiscard('请弃置'+event.X+'张牌','he',event.X,true).set('delay',true);
					'step 1'
					if(!player.countCards('he')) event.lgs_qinmian=true;
					player.draw(event.X);
					'step 2'
					if(event.lgs_qinmian){
						player.addTempSkill('lgs_qinmian_block');
						if(player.maxHp<5)
							player.gainMaxHp();
					}
				},
				subSkill:{
					clear:{
						onremove:function(player){
							player.removeMark('lgs_qinmian',player.countMark('lgs_qinmian'));
						},
					},
					block:{charlotte:true},
				},
			},
			lgs_yunshi:{
				audio:'caishi',
				enable:'phaseUse',
				usable:1,
				filter:function(event,player){
					return player.hp<player.maxHp&&player.hp==game.countSuit(player,'h');
				},
				content:function(event,player){
					player.recover();
				},
				ai:{
					order:13,
					result:{
						player:2,
					},
				},
			},
			lgs_jiaoxin:{
				init:function(player){
					player.storage.lgs_jiaoxin_block=[];
				},
				enable:'phaseUse',
				// filter:function(event,player){
					// return player.countCards('h')&&game.hasPlayer(function(current){
						// return !player.storage.lgs_jiaoxin_block.contains(current)&&current.countCards('h');
					// });
				// },
				filterCard:true,
				discard:false,
				lose:false,
				delay:0,
				filterTarget:function(card,player,target){
					return !player.storage.lgs_jiaoxin_block.contains(target)&&target.countCards('h');
				},
				content:function(){
					'step 0'
					player.addTempSkill('lgs_jiaoxin_block','phaseUseEnd');
					player.storage.lgs_jiaoxin_block.push(target);
					target.chooseCard('请选择一张手牌与'+get.translation(player)+'交换',true).set('ai',function(card){
						var player=_status.event.player,target=_status.event.getParent().player
						if(get.suit(card,player)=='heart'){
							if(get.attitude(player,target)>0)
								return 10-get.value(card);
							return 7-get.value(card);
						}
						return 6-get.value(card);
					});
					'step 1'
					event.cardp=event.cards[0];
					event.cardt=result.cards[0];
					player.swapHandcards(target,[event.cardp],[event.cardt]);
					if(get.suit(event.cardp,player)!='heart')
						event.finish();
					'step 2'
					if(get.suit(event.cardt,target)=='heart')
						event.draw=true;
					player.chooseBool('是否令'+get.translation(target)+(event.draw?'摸1张牌':'失去1点体力')+'？');
					'step 3'
					if(result.bool){
						if(event.draw)
							target.draw();
						else
							target.loseHp();
					}
				},
				ai:{
					threaten:1.3,
				},
				subSkill:{
					block:{
						charlotte:true,
						onremove:function(player){
							player.storage.lgs_jiaoxin_block=[];
						},
					},
				},
			},
			lgs_keyan:{
				trigger:{player:'phaseJieshuBegin'},
				filter:true,
				forced:true,
				content:function(){
					'step 0'
					player.draw(3);
					'step 1'
					player.chooseControl('red','black').set('prompt','恪严：请弃置一种花色的所有手牌');
					'step 2'
					player.discard(player.getCards('h',{'color':result.control}));
				},
			},
			lgs_renjian:{
				trigger:{player:"damageEnd"},
				filter:function(event,player){
					return !player.hasSkill('lgs_renjian_block');
				},
				direct:true,
				frequent:true,
				content:function(){
					'step 0'
					event.count=trigger.num;
					'step 1'
					event.count--;
					if(player.hasSkill('lgs_renjian_temp')){
						player.addTempSkill('lgs_renjian_block');
						if(player.hp<player.maxHp){
							player.chooseBool(get.prompt2('lgs_renjian')).set('frequentSkill','lgs_renjian');
						}else
							event.finish();
					}else{
						player.addTempSkill('lgs_renjian_temp');
					}
					'step 2'
					if(result.bool){
						player.logSkill('lgs_renjian');
						player.recover();
					}
					'step 3'
					if(event.count&&!player.hasSkill('lgs_renjian_block'))
						event.goto(1);
				},
				subSkill:{
					block:{charlotte:true},
					temp:{charlotte:true},
				},
			},
			lgs_zhanyue:{
				enable:'chooseToUse',
				viewAs:{
					name:'sha',
					isCard:true,
				},
				filterCard:function(){return false},
				selectCard:-1,
				ai:{
					order:function(item,player){
						if(player.hp==1&&!player.countCards('h','tao')&&!player.countCards('h','jiu')) return 0.1;
						return get.order({name:'sha'})+0.05;
					},
					result:{
						player:function(player,target){
							if(player.hp==1&&!player.countCards('h','tao')&&!player.countCards('h','jiu'))
								return -3;
							return 0;
						},
					},
					effect:{
						target:function(card,player,target){
							if(card.name=='jiu'&&target.hp==1&&!target.countCards('h','tao')&&target.countCards('h','jiu')<2) return 0;
							if(card.name=='recover')
								switch(target.maxHp-target.hp){
									case 0:
										break;
									case 1:
										return [1,-1];
									case 2:
										return [1,1];
									default:
										return [1,3];
								}
						},
					},
				},
				group:'lgs_zhanyue_loseDraw',
				subSkill:{
					loseDraw:{
						trigger:{player:'useCardAfter'},
						// vanish:true,
						filter:function(event,player){
							return event.card.name=='sha'&&event.card.isCard&&event.cards.length==0&&!game.countPlayer2(function(current){
								return current.getHistory('useCard',function(evt){
									return evt.card.name=='shan'&&evt.getParent(3)==event;
								}).length;
							});
						},
						forced:true,
						content:function(){
							'step 0'
							player.loseHp();
							'step 1'
							player.draw(player.maxHp-player.hp);
							'step 2'
							player.addTempSkill('lgs_zhanyue_mod');
						},
					},
					mod:{
						mark:true,
						intro:{
							content:'本回合使用实体非转化【杀】无距离与次数限制',
						},
						mod:{
							cardUsable:function(card,player){
								if(get.name(card,player)=='sha'&&card.cardid!==undefined&&card.isCard) return Infinity;
							},
							targetInRange:function(card,player){
								if(get.name(card,player)=='sha'&&card.cardid!==undefined&&card.isCard) return true;
							},
						},
					},
				},
			},
			lgs_huixie:{
				trigger:{global:'useCard2'},
				filter:function(event,player){
					var card=event.card
					return event.player!=player&&['basic','trick'].contains(get.type(card))&&get.suit(card)=='diamond'
							&&!event.targets.contains(player)&&lib.filter.targetEnabled2(card,event.player,player);
				},
				direct:true,
				content:function(){
					'step 0'
					var target=player
					event.target=target;
					player=trigger.player;
					event.player=player;
					player.chooseBool('是否发动【诙谐】令'+get.translation(target)+'成为'+get.translation(trigger.card)+'的目标？').set('ai',function(){
						var player=_status.event.player,target=_status.event.parent.target
						return get.effect(target,_status.event.getTrigger().card,player,player)>0;
					});
					'step 1'
					if(result.bool){
						target.logSkill('lgs_huixie');
						player.line(target);
						game.log(target,'成为了',trigger.card,'的目标');
						trigger.targets.add(target);
					}
				},
				mod:{
					selectTarget:function(card,player,range){
						if(['basic','trick'].contains(get.type(card))&&get.suit(card)=='diamond'&&range[1]!=-1){
							range[1]++;
						}
					}
				},
			},
			lgs_jieshen:{
				trigger:{player:'damageBegin4'},
				filter:true,
				check:function(event,player){
					var cards=player.getCards('h'),value=0
					for(var card of cards)
						value+=get.value(card);
					if(cards.length>3){
						value-=event.source?Math.max(0,event.source.countCards('h')-4):0;
						return value<12;
					}else{
						if(player.hp+player.hujia==1&&event.num==1&&player.countCards('h',function(card){return ['tao','jiu'].contains(get.name(card));}))
						value-=Math.max(0,event.num-1)*3;
						return value<9;
					}
				},
				content:function(){
					'step 0'
					var cards=player.getCards('h')
					event.X=cards.length;
					player.discard(cards);
					'step 1'
					if(event.X>=3){
						player.draw(2);
						if(trigger.source){
							player.line(trigger.source);
							player.addTempSkill('lgs_jieshen_disable');
							player.storage.lgs_jieshen_disable.push(trigger.source);
						}
					}else{
						player.draw(3);
						trigger.num=1;
					}
				},
			},
			lgs_jieshen_disable:{
				charlotte:true,
				init:function(player){
					player.storage.lgs_jieshen_disable=[];
				},
				mark:true,
				intro:{
					markcount:()=>0,
					content:'不能成为$牌的目标',
				},
				trigger:{global:'useCard1'},
				forced:true,
				firstDo:true,
				filter:function(event,player,card){
					if(!player.storage.lgs_jieshen_disable.contains(event.player)) return false;
					if(['taoyuan','wugu','huanjuyitang'].contains(event.card.name)) return true;
					return ['nanman','wanjian'].contains(event.card.name)&&event.player!=player;
				},
				content:function(){},
				mod:{
					targetEnabled:function(card,player,target){
						if(target.storage.lgs_jieshen_disable.contains(player)) return false;
					}
				},
			},
			lgs_fenqu:{
				trigger:{player:'useCardToPlayer'},
				filter:function(event,player){
					return event.card.name=='sha'&&event.card.number&&event.target.countCards('he');
				},
				check:function(event,player){
					return get.effect(event.target,event.card,player,player)<=8||event.target.countCards('he')<4;
				},
				content:function(){
					'step 0'
					next=trigger.target.chooseCard('请交给'+get.translation(player)+'任意张点数之和>'+get.number(trigger.card)+'的牌','he',true);
					next.set('selectCard',function(){
						var player=_status.event.player,trigger=_status.event.getTrigger(),num=0
						for(var card of ui.selected.cards)
							num+=get.number(card,player);
						if(num<=get.number(trigger.card,trigger.player)) return ui.selected.cards.length+2;
						return [ui.selected.cards.length, Infinity];
					}).set('complexCard',true);
					next.set('ai',function(cardx){
						if(_status.event.aicards==undefined){
							var player=_status.event.player,trigger=_status.event.getTrigger();
							var source=trigger.player;
							// 通过搜索算法，获取所有合法牌组
							var cds=player.getCards('he'),number=trigger.card.number,cardSet=[null];
							var searchForCardSets=function(listToSearch,tempSet,number,value,cardSet,searchIndex){
								for(var i=searchIndex;i<listToSearch.length;i++){
									var card=listToSearch[i]
									var X=0,tempValue=0,newSet=tempSet.concat(card);
									// game.log('newSet:',newSet);
									for(var card of newSet){
										X+=get.number(card,player);
										tempValue+=get.value(card);
									}
									if(X>10)
										tempValue+=get.effect(player,trigger.card,source,player)/3;
									// game.log("X:",X,',tempValue:',tempValue,',value:',value[0]);
									// 新卡组点数和大于所需值，且更廉价(或等价牌少)，则更新卡组和最低价值
									game.log('newSet:',newSet);
									game.log('value[0]:',value[0],'; tempValue:',tempValue);
									if(X>number&&(tempValue<value[0]||tempValue==value[0]&&newSet.length<cardSet[0].length||cardSet[0]==null)){
										cardSet[0]=newSet;
										value[0]=tempValue;
									}
									// game.log('cardSet:',cardSet[0]);
									// game.log();
									// 新卡组点数和小于等于所需值或小于等于10，则在新卡组基础上继续进行搜索
									if(X<=number||X<=10)
										searchForCardSets(listToSearch,newSet,number,value,cardSet,i+1);
								}
							}
							searchForCardSets(cds,[],number,[0],cardSet,0);
							_status.event.aicards=cardSet[0]||cds;
						}
						return _status.event.aicards.contains(cardx)?1:false;
					});
					'step 1'
					event.X=0;
					for(var card of result.cards)
						event.X+=get.number(card,trigger.target);
					trigger.target.give(result.cards,player);
					'step 2'
					if(event.X>10){
						game.log(trigger.card,'对',trigger.target,'无效');
						trigger.targets.remove(trigger.target);
						trigger.getParent().triggeredTargets1.remove(trigger.target);
						trigger.untrigger();
					}
				},
			},
			lgs_shouye:{
				trigger:{global:'phaseZhunbeiBegin'},
				filter:function(event,player){
					return event.player!=player&&player.countCards('h')&&event.player.isAlive();
				},
				direct:true,
				content:function(){
					'step 0'
					player.chooseCard('h',get.prompt2('lgs_shouye'),function(card){return get.type(card)!='equip'}).set('ai',function(card){
						var player=_status.event.player,trigger=_status.event.getTrigger()
						if(get.attitude(player,trigger.player)<=0) return false;
						return Math.max(trigger.player.getUseValue({name:card.name,nature:card.nature}),0.1);
					});
					'step 1'
					if(result.bool){
						player.logSkill('lgs_shouye');
						player.showCards(result.cards);
						player.addGaintag(result.cards,'lgs_shouye');
						trigger.player.addTempSkill('lgs_shouye_2');
						if(trigger.player.hasSkill('lgs_shouye_3')){
							trigger.player.addTempSkill('lgs_shouye_4');
							trigger.player.removeSkill('lgs_shouye_3');
						}else{
							trigger.player.addTempSkill('lgs_shouye_3');
						}
						trigger.player.storage.lgs_shouye.addArray(result.cards);
						trigger.player.storage.lgs_shouye_source.push(player);
					}
				},
			},
			lgs_shouye_2:{
				init:function(player){
					player.storage.lgs_shouye=[];
					player.storage.lgs_shouye_used=[];
					player.storage.lgs_shouye_source=[];
				},
				mark:true,
				intro:{
					mark:function(dialog,content,player){
						dialog.addText('授业展示的牌：');
						dialog.add(player.storage.lgs_shouye);
						dialog.addText('已使用过的牌：');
						if(player.storage.lgs_shouye_used.length)
							dialog.add(player.storage.lgs_shouye_used);
						else
							dialog.addText('无');
					},
				},
				hiddenCard:function(player,name){
					for(var card of player.storage.lgs_shouye)
						if(!player.storage.lgs_shouye_used.contains(card)&&name==card.name)
							return true;
				},
				trigger:{player:'phaseJieshuBegin'},
				filter:function(event,player){
					if(!player.isAlive()) return false;
					return player.storage.lgs_shouye_used.length>0;
				},
				forced:true,
				locked:false,
				popup:false,
				content:function(){
					'step 0'
					event.sources=player.storage.lgs_shouye_source.slice(0).sortBySeat();
					'step 1'
					var source=event.sources.shift()
					source.logSkill('lgs_shouye');
					var cards=source.getCards('h',function(card){return card.hasGaintag('lgs_shouye')})
					if(cards.length)
						player.gain(cards,source,'give','bySelf');
					if(event.sources.length)
						event.redo();
					'step 2'
					player.draw(2);
				},
				onremove:function(player){
					game.countPlayer(function(current){
						current.removeGaintag('lgs_shouye');
					});
				},
			},
			lgs_shouye_3:{
				enable:'chooseToUse',
				viewAs:function(cards,player){
					var card=player.storage.lgs_shouye[0]
					return {name:card.name,nature:card.nature};
				},
				filter:function(event,player){
					if(player.storage.lgs_shouye_used.length) return false;
					var card=player.storage.lgs_shouye[0]
					return event.filterCard({name:card.name,nature:card.nature},player,event)&&player.countCards('hes');
				},
				filterCard:true,
				selectCard:1,
				position:'he',
				prompt:function(event){
					var player=event.player
					return '将一张牌当做'+get.translation(player.storage.lgs_shouye[0].name)+'使用'
				},
				precontent:function(){
					var card=player.storage.lgs_shouye[0]
					player.storage.lgs_shouye_used.push(card);
				},
				ai:{
					order:function(){
						var player=_status.event.player
						return get.order(player.storage.lgs_shouye[0],player)+0.1;
					},
					respondSha:true,
					fireAttack:true,
					respondShan:true,
					skillTagFilter:function(player,tag,arg){
						if(player.storage.lgs_shouye_used.length) return false;
						if(!player.countCard('hes')) return false;
						var card=player.storage.lgs_shouye[0]
						if(tag=='fireAttack') return card.nature=='fire'||card.name=='huogong';
						if(tag=='respondSha'){
							if(arg!='use') return false;
							if(card.name!='sha') return false;
						}
						else if(tag=='respondShan'){
							game.log('shouye3-skillTagFilter-arg:',arg);
							// if(arg!='use') return false;
							if(card.name!='shan') return false;
						}
					},
					result:{
						player:function(player,target){
							var card=player.storage.lgs_shouye[0]
							return player.getUseValue({name:card.name,nature:card.nature})+2;
						},
					}
				},
			},
			lgs_shouye_4:{
				enable:'chooseToUse',
				hiddenCard:function(player,name){
					for(var card of player.storage.lgs_shouye)
						if(!player.storage.lgs_shouye_used.contains(card)&&card.name==name)
							return true;
					return false;
				},
				filter:function(event,player){
					if(!player.countCards('hes')) return false;
					for(var card of player.storage.lgs_shouye)
						if(!player.storage.lgs_shouye_used.contains(card)&&event.filterCard({name:card.name},player,event))
							return true;
					return false;
				},
				chooseButton:{
					dialog:function(event,player){
						return ui.create.dialog('授业',[player.storage.lgs_shouye,'card'],'hidden');
					},
					filter:function(button){
						var player=_status.event.player,evt=_status.event.parent,card=button.link
						if(player.storage.lgs_shouye_used.contains(button.link)) return false;
						return evt.filterCard({name:card.name,nature:card.nature},player,evt);
					},
					check:function(button){
						var player=_status.event.player,cardx=button.link;
						var card={name:cardx.name,nature:cardx.nature};
						return player.getUseValue(card)+2;
					},
					backup:function(links,player){
						return {
							viewAs:{
								name:links[0].name,
								nature:links[0].nature,
								originCard:links[0],
							},
							filterCard:true,
							position:'hes',
							ai1:function(card){
								return 1/Math.max(0.1,get.value(card));
							},
							popname:true,
							// ignoreMod:true,
							precontent:function(){
								player.storage.lgs_shouye_used.push(event.result.card.originCard);
							},
						};
					},
					prompt:function(links,player){
						return '将一张牌当'+get.translation(links[0].nature||'')+get.translation(links[0].name)+'使用';
					},
				},
				ai:{
					order:function(){
						game.log('shouye4-order-in');
						var event=_status.event;
						var player=event.player,list=[]
						for(var card of player.storage.lgs_shouye)
							if(!player.storage.lgs_shouye_used.contains(card)&&event.filterCard(card,player,event))
								list.push(get.order(card));
						game.log(list);
						if(!list.length) return 0;
						list.sort(function(a,b){
							return a<b;
						});
						return list[0]+0.1;
					},
					respondSha:true,
					fireAttack:true,
					respondShan:true,
					skillTagFilter:function(player,tag,arg){
						if(!player.countCard('hes')) return false;
						if(tag=='fireAttack') 
							return player.storage.lgs_shouye.filter(function(card){
								return !player.storage.lgs_shouye_used.contains(card)&&(card.nature=='fire'||card.name=='huogong');
							}).length;
						if(tag=='respondSha'){
							if(arg!='use') return false;
							if(!player.storage.lgs_shouye.filter(function(card){
								return !player.storage.lgs_shouye_used.contains(card)&&card.name=='sha';
							}).length) return false;
						}
						else if(tag=='respondShan'){
							game.log('shouye4-skillTagFilter-arg:',arg);
							if(arg!='use') return false;
							if(!player.storage.lgs_shouye.filter(function(card){
								return !player.storage.lgs_shouye_used.contains(card)&&card.name=='sha';
							}).length) return false;
						}
					},
					result:{
						player:1
					}
				}
			},
			lgs_ciai:{
				trigger:{global:['drawBefore','recoverBefore']},
				filter:function(event,player){
					var evt=event.getParent(2)
					return evt.player==player&&evt.card&&get.suit(evt.card,player)=='heart';
				},
				forced:true,
				content:function(){
					trigger.num++;
				},
				mod:{
					cardEnabled:function(card,player){
						if(get.suit(card,player)=='spade'&&get.type(card,player)!='equip') return false;
					},
					targetEnabled:function(card,player,target){
						if(target!=player&&get.suit(card,player)=='spade'&&get.type(card,player)!='equip') return false;
					},
				},
			},
			lgs_shixin:{
				zhuSkill:true,
				trigger:{global:'gainAfter'},
				filter:function(event,player){
					if(!player.hasZhuSkill('lgs_shixin')) return false;
					if(event.player.group!=player.group) return false;
					if(event.player==player||event.source!=player||player.countCards('h')>=event.player.countCards('h')) return false;
					var evt=event.getl(event.source);
					return evt.cards2.length||evt.js.length;
				},
				logTarget:'player',
				check:function(event,player){
					return get.attitude(player,event.player)>0;
				},
				content:function(){
					trigger.player.draw();
				},
			},
			lgs_zongyu:{
				trigger:{player:'phaseDrawBegin2'},
				filter:true,
				direct:true,
				content:function(){
					'step 0'
					player.chooseControl(player.hp<player.maxHp?['失去体力','回复体力','cancel2']:['失去体力','cancel2'],function(){
						var player=_status.event.player
						if(_status.event.controls.length==2) return (player.skipList.contains('phaseUse')&&(player.hp-player.countCards('h')<5))?'cancel2':'失去体力';
						if(player.skipList.contains('phaseUse')) return '回复体力';
						if(player.hp>=3) return '失去体力';
						if(player.hp<=2) return '回复体力';
						return 'cancel2';
					}).set('prompt',get.prompt2('lgs_zongyu'));
					'step 1'
					if(result.control=='失去体力'){
						player.logSkill('lgs_zongyu');
						player.loseHp();
						if(!trigger.numFixed)
							trigger.num+=2;
					}else if(result.control=='回复体力'){
						player.logSkill('lgs_zongyu');
						player.recover();
						if(!trigger.numFixed)
							trigger.num--;
					}
				},
			},
			lgs_nixi:{
				trigger:{player:'recoverAfter'},
				direct:true,
				content:function(){
					'step 0'
					player.chooseUseTarget(get.prompt2('lgs_nixi'),{name:'sha',isCard:true},'nodistance').logSkill='lgs_nixi';
					'step 1'
					if(result.bool&&!player.isPhaseUsing())
						player.getStat().card.sha--;
				},
				ai:{
					threaten:1.4,
					effect:{
						target:function(card,player,target){
							if(card.name=='recover'&&target.hp<target.maxHp) return [1,1];
						},
					},
				},
				group:['lgs_nixi_gain','lgs_nixi_loseHp'],
				subSkill:{
					gain:{
						trigger:{source:'damageSource'},
						filter:function(event,player){
							return event.getParent(4).name=='lgs_nixi';
						},
						direct:true,
						content:function(){
							// player.gainPlayerCard('逆袭：是否获得'+get.translation(trigger.player)+'一张牌？',trigger.player,'he').logSkill=['lgs_nixi',trigger.player];
							player.draw();
						},
					},
					loseHp:{
						trigger:{player:'shaMiss'},
						filter:function(event,player){
							// var evt=event;
							// game.log('evt:'+evt.name);
							// var evt1=evt.getParent(1),evt2=evt.getParent(2),evt3=evt.getParent(3),evt4=evt.getParent(4),evt5=evt.getParent(5);
							// game.log('evt1.name:'+evt1.name);
							// game.log('evt2.name:'+evt2.name);
							// game.log('evt3.name:'+evt3.name);
							// game.log('evt4.name:'+evt4.name);
							// game.log('evt5.name:'+evt5.name);
							return event.getParent(3).name=='lgs_nixi';
						},
						forced:true,
						locked:false,
						content:function(){
							player.loseHp();
						},
					},
				},
			},
			lgs_zhenmi:{
				trigger:{player:['useCardAfter','respondAfter']},
				filter:function(event,player){
					return !player.hasSkill('lgs_zhenmi_block');
				},
				frequent:true,
				content:function(){
					'step 0'
					player.draw();
					var buff=0;
					player.getHistory('lose',function(evt){
						if(evt.type!='discard'||evt.getParent(3).name!='lgs_zhenmi') return;
						buff+=evt.cards.filterInD('d').length;
					});
					player.chooseToDiscard('he',true).set('ai',function(card){
						if(get.type(card)=='equip'&&_status.event.check)
							return get.unuseful(card)+buff;
						return get.unuseful(card);
					}).set('check',player.hasFriend()).set('buff',buff);
					'step 1'
					if(result.cards&&result.cards.length&&get.type(result.cards[0])=='equip'){
						player.addTempSkill('lgs_zhenmi_block');
					}else
						event.finish();
					'step 2'
					event.cards=[];
					player.getHistory('lose',function(evt){
						if(evt.type!='discard'||evt.getParent(3).name!='lgs_zhenmi') return;
						event.cards.addArray(evt.cards.filterInD('d'));
					});
					player.chooseCardButton(event.cards,'缜密：选择至多3张要交出的牌',[1,3]).set('ai',function(button){
						if(_status.event.check){
							return 20-get.value(button.link);
						}
						return 0;
					}).set('check',player.hasFriend());
					'step 3'
					if(result.bool){
						event.cards2=result.links;
						player.chooseTarget('将'+get.translation(event.cards2)+'交给其他角色',function(card,player,target){
							return target!=player;
						}).set('ai',function(target){
							return get.attitude(_status.event.player,target);
						});
					}else
						event.finish();
					'step 4'
					if(result.bool){
						player.give(event.cards2,result.targets[0],'visible');
					}else
						event.goto(2);
				},
				subSkill:{
					block:{charlotte:true},
				},
			},
			lgs_jiehuo:{
				global:'lgs_jiehuo_global',
			},
			lgs_jiehuo_global:{
				// unique:true,
				enable:['chooseToUse','chooseToRespond'],
				viewAs:{name:'shan'},
				filter:function(event,player){
					if(!game.hasPlayer(function(current){
						return current!=player&&current.hasSkill('lgs_jiehuo')&&current.countCards('h');
					})) return false;
					return !event.lgs_jiehuo&&(event.type!='phase'||!player.hasSkill('lgs_jiehuo2'));
				},
				filterCard:function(){return false},
				selectCard:-1,
				precontent:function(){
					game.log(player,'请求','【'+get.skillTranslation('lgs_jiehuo',player)+'】');
				},
				log:false,
				group:['lgs_jiehuo1'],
				ai:{
					order:function(){
						return get.order({name:'shan'})-0.3;
					},
					respondShan:true,
					skillTagFilter:function(player){
						if(!game.hasPlayer(function(current){
							return current!=player&&current.hasSkill('lgs_jiehuo')&&current.countCards('h');
						})) return false;
					},
				},
			},
			lgs_jiehuo1:{
				trigger:{player:['useCardBegin','respondBegin']},
				filter:function(event,player){
					return event.skill=='lgs_jiehuo_global';
				},
				forced:true,
				content:function(){
					"step 0"
					// delete trigger.skill;
					trigger.getParent().set('lgs_jiehuo',true);
					"step 1"
					if(event.current==undefined) event.current=player.next;
					if(event.current==player){
						player.addTempSkill('lgs_jiehuo2');
						event.finish();
						trigger.cancel();
						trigger.getParent().goto(0);
					}
					else if(event.current.hasSkill('lgs_jiehuo')&&event.current.countCards('h')){
						next=event.current.chooseCard('是否替'+get.translation(player)+(trigger.name=='respond'?'打出':'使用')+'一张闪？',function(card){
							return get.type(card)!='equip'&&trigger.parent.filterCard({name:'shan',cards:[card]},player,trigger.parent);
						},function(card){
							if(!_status.event.check) return 0;
							if(card.name=='shan') return 10;
							if(_status.event.player.hp<3||player.hp>1) return 0;
							return 6-get.value(card);
						}).set('check',get.attitude(event.current,player)>0);
					}
					else{
						event.current=event.current.next;
						event.redo();
					}
					"step 2"
					var current=event.current;
					if(result.bool){
						event.finish();
						current.logSkill('lgs_jiehuo',trigger.player);
						trigger.card=get.autoViewAs(trigger.card,result.cards);
						trigger.cards=result.cards;
						trigger.throw=false;
						trigger.logSkill=false;
						var card=result.cards[0].copy('thrown');
						if(card.name!=trigger.card.name){
							if (!card._tempName) card._tempName=ui.create.div('.temp-name',card);
							card._tempName.innerHTML=get.translation(trigger.card.name);
							card._tempName.tempname=get.translation(trigger.card.name);
						}
						current.$throwordered2(card,false,get.translation(player)+(trigger.name=='useCard'?'使用':'打出'));
						if(typeof event.current.ai.shown=='number'&&event.current.ai.shown<0.95){
							event.current.ai.shown+=0.3;
							if(event.current.ai.shown>0.95) event.current.ai.shown=0.95;
						}
						if(trigger.cards[0].name!='shan')
							current.loseHp();
					}
					else{
						event.current=event.current.next;
						event.goto(1);
					}
				}
			},
			lgs_jiehuo2:{
				trigger:{global:['useCardAfter','useSkillAfter','phaseAfter']},
				silent:true,
				charlotte:true,
				filter:function(event){
					return event.skill!='lgs_jiehuo';
				},
				content:function(){
					player.removeSkill('lgs_jiehuo2');
				}
			},
			lgs_touliang:{
				group:['lgs_touliang1','lgs_touliang2'],
				locked:true,
				unique:true,
			},
			lgs_touliang1:{
				trigger:{
					global:[
						'phaseZhunbeiSkipped','phaseZhunbeiCancelled',
						'phaseJudgeSkipped','phaseJudgeCancelled',
						'phaseDrawSkipped','phaseDrawCancelled',
						'phaseUseSkipped','phaseUseCancelled',
						'phaseDiscardSkipped','phaseDiscardCancelled',
						'phaseJieshuSkipped','phaseJieshuCancelled',
					],
				},
				filter:function(event,player){
					return event.player!=player&&event.player.isAlive();
				},
				forced:true,
				content:function(){
					'step 0'
					player.draw();
					'step 1'
					var next=player[trigger.name]();
					event.next.remove(next);
					trigger.getParent('phase').next.push(next);
				},
			},
			lgs_touliang2:{
				trigger:{global:'phaseUseAfter'},
				filter:function(event,player){
					if(event.player==player||!event.player.isAlive()) return false;
					var history=event.player.getHistory('useCard');
					for(var i=0;i<history.length;i++){
						if(history[i].getParent('phaseUse',true)==null) continue;
						if(!history[i].targets) continue;
						for(var j=0;j<history[i].targets.length;j++){
							if(history[i].targets[j]!=event.player) return false;
						}
					}
					return true;
				},
				forced:true,
				content:function(){
					'step 0'
					player.draw();
					'step 1'
					var next=player.phaseUse();
					event.next.remove(next);
					trigger.getParent('phase').next.push(next);
				},
			},
			lgs_huanzhu:{
				trigger:{global:'phaseBefore'},
				filter:function(event,player){
					return event.player!=player&&!player.isTurnedOver()&&!player.isOut();
				},
				logTarget:'player',
				content:function(){
					'step 0'
					player.loseMaxHp();
					'step 1'
					if(!player.isAlive())
						event.finish();
					else{
						var X1=0,X2=0,current=player;
						while(current!=trigger.player){
							X1+=1;
							current=current.next;
						}
						current=player;
						while(current!=trigger.player){
							X2+=1;
							current=current.previous;
						}
						game.swapSeat(player,trigger.player);
						player.draw(Math.min(X1,X2));
					}
					'step 2'
					trigger.cancel();
					var next=player.insertPhase()
					next.lgs_huanzhu=true;
					var evt=trigger.getParent('phaseLoop',true)
					// if(evt&&evt.player==trigger.player)  // 若非额外回合
					if(evt&&trigger.skill==undefined)
						evt.player=player;
				},
				group:'lgs_huanzhu_turnOver',
				subSkill:{
					turnOver:{
						trigger:{player:'phaseAfter'},
						filter:function(event,player){
							return event.lgs_huanzhu;
						},
						forced:true,
						content:function(){
							player.turnOver();
						},
					},
				},
			},
		},
		card:{
			huanjuyitang:{
				enable:true,
				type:'trick',
				// fullskin:true,
				image:'ext:理工杀/huanjuyitang.jpg',
				derivation:'lgs_sunqingyue',
				filterTarget:true,
				selectTarget:-1,
				// postAi:()=>true,
				contentBefore:function(){
					'step 0'
					player.chooseControl(['先摸再弃','先弃再摸']).set('ai',function(){
						var players=game.filterPlayer(),cardNum1=[],targetResult1=[],eff1=0,cardNum2=[],targetResult2=[],eff2=0;
						for(var i=0;i<players.length;i++){
							var current=players[i],num=players[i].countCards('h');
							if(player.hasSkill('lgs_langfang')&&get.attitude(player,current)>0) num++;
							if(current!=player&&current.hasSkill('lgs_langfang')) num++;
							cardNum1.push(num);cardNum2.push(num);
						}
						for(var i=0;i<players.length;i++){
							var current=players[i]
							targetResult1.push(cardNum1[i]/10);
							if(cardNum1[(i?0:players.length)+i-1]==cardNum1[(i<players.length-1?i+1:0)]){
								targetResult1[i]-=1;
								cardNum1[i]--;
							}
							if(current.countCards('e',function(card){
								return get.value(card)<6;
							})) cardNum1[i]++;
							var att=0;
							if(get.attitude(player,current)>0) att=1;
							else if(get.attitude(player,current)<0) att=-1;
							eff1+=att*targetResult1[i];
						}
						for(var i=0;i<players.length;i++){
							var current=players[i]
							targetResult2.push(0);	
							if(!current.countCards('he')) targetResult2[i]+=1;
							else targetResult2[i]+=cardNum2[i]/10-0.2;
							if(cardNum2[(i?0:players.length)+i-1]==cardNum2[(i<players.length-1?i+1:0)]){
								targetResult2[i]+=1;
								cardNum2[i]++;
							}
							if(current.countCards('e',function(card){
								return get.value(card)<6;
							})) cardNum2[i]++;
							var att=0;
							if(get.attitude(player,current)>0) att=1;
							else if(get.attitude(player,current)<0) att=-1;
							eff2+=att*targetResult2[i];
						}
						return (eff1>eff2?0:1);
					});
					'step 1'
					var map={};
					map.index=result.index;
					event.getParent().customArgs.default.huanjuyitang_map=map;
				},
				content:function(){
					'step 0'
					if(event.huanjuyitang_map.index)
						target.chooseToDiscard('he',true);
					else
						target.draw();
					'step 1'
					if(event.huanjuyitang_map.index)
						target.draw(target.previous.countCards('h')==target.next.countCards('h')?2:1);
					else
						target.chooseToDiscard(target.previous.countCards('h')==target.next.countCards('h')?2:1,'he',true);
				},
				ai:{
					wuxie:function(){
						return 0;
					},
					order:8.2,
					basic:{
						useful:0.5,
						value:1,
					},
					tag:{
						draw:1,
						loseCard:1,
						// multitarget:1,
					},
					result:{
						target:function(player,target){
							var players=game.filterPlayer(),cardNum1=[],targetResult1=[],eff1=0,cardNum2=[],targetResult2=[],eff2=0;
							// 记录两份全场手牌数待用
							for(var i=0;i<players.length;i++){
								var current=players[i],num=players[i].countCards('h');
								if(player.hasSkill('lgs_langfang')&&get.attitude(player,current)>0) num++;
								if(current==player) num--;
								else if(current.hasSkill('lgs_langfang')) num++;
								cardNum1.push(num);cardNum2.push(num);
							}
							// 计算先摸再弃的效果
							for(var i=0;i<players.length;i++){
								var current=players[i]
								targetResult1.push(cardNum1[i]/10);  // 换牌价值
								if(cardNum1[(i?0:players.length)+i-1]==cardNum1[(i<players.length-1?i+1:0)]){  // 上下与下家手牌数相等时
									targetResult1[i]-=1;
									cardNum1[i]--;
								}
								if(current.countCards('e',function(card){  // 大概率选择弃装备时
									return get.value(card)<6;
								})) cardNum1[i]++;
								var att=0;
								if(get.attitude(player,current)>0) att=1;
								else if(get.attitude(player,current)<0) att=-1;
								eff1+=att*targetResult1[i];
							}
							for(var i=0;i<players.length;i++){
								var current=players[i]
								targetResult2.push(0);
								if(!current.countCards('he'))  // 强制制衡效果
									targetResult2[i]+=1;
								else
									targetResult2[i]+=cardNum2[i]/10-0.2;
								if(cardNum2[(i?0:players.length)+i-1]==cardNum2[(i<players.length-1?i+1:0)]){
									targetResult2[i]+=1;
									cardNum2[i]++;
								}
								if(current.countCards('e',function(card){
									return get.value(card)<6;
								})) cardNum2[i]++;
								var att=0;
								if(get.attitude(player,current)>0) att=1;
								else if(get.attitude(player,current)<0) att=-1;
								eff2+=att*targetResult2[i];
							}
							var targetIndex=0,res=0
							for(var i=0;i<players.length;i++)
								if(players[i]==target){
									targetIndex=i;
									break;
								}
							if(eff1>eff2) res=targetResult1[targetIndex];
							else res=targetResult2[targetIndex];
							if(player.hasSkill('lgs_langfang')) res+=game.countPlayer(function(current){
								return get.attitude(player,current)>0;
							});
							for(var current of players)
								if(current.hasSkill('lgs_langfang')&&current!=player){
									var att=0
									if(get.attitude(player,current)>0) att=1;
									else if(get.attitude(player,current)<0) att=-1;
									res+=att;
								}
							return res;
						},
					},
				},
			},
			huishi_zhu:{
				image:'ext:理工杀/huishi_zhu.jpg',
				fullimage:true,
				type:'identity',
			},
			huishi_zhong:{
				image:'ext:理工杀/huishi_zhong.jpg',
				fullimage:true,
				type:'identity',
			},
			huishi_fan:{
				image:'ext:理工杀/huishi_fan.jpg',
				fullimage:true,
				type:'identity',
			},
			huishi_nei:{
				image:'ext:理工杀/huishi_nei.jpg',
				fullimage:true,
				type:'identity',
			},
		},
		dynamicTranslate:{
			lgs_gangrou:function(player){
				if(/*player.storage.lgs_gangrou==true*/player.hasSkill('lgs_gangrou_rou')) return '转换技，阴：你可以将一张非基本牌当【杀】使用或打出，然后重铸一张基本牌。<span class="bluetext">阳：出牌阶段，你可以弃置一张黑色牌，重置本回合【杀】的使用次数。</span>';
				return '转换技，<span class="bluetext">阴：你可以将一张非基本牌当【杀】使用或打出，然后重铸一张基本牌。</span>阳：出牌阶段，你可以弃置一张黑色牌，重置本回合【杀】的使用次数。';
			},
			lgs_shenghua:function(player){
				if(player.storage.shlv==1) return '<span class="bluetext">1级：每轮限一次，其他角色的摸牌阶段结束时，你可以移去一张“膳”，令其执行一个由你选择的任意阶段。</span>2级：一名角色的摸牌阶段结束时，你可以移去X张“膳”，令其执行一个由你选择的任意阶段（X为本轮发动“生花”的次数）。';
				return '1级：每轮限一次，其他角色的摸牌阶段结束时，你可以移去一张“膳”，令其执行一个由你选择的任意阶段。<span class="bluetext">2级：一名角色的摸牌阶段结束时，你可以移去X张“膳”，令其执行一个由你选择的任意阶段（X为本轮发动“生花”的次数）。</span>';
			},
			lgs_shensuan:function(player){
				if(player.storage.lgs_shensuan) return '转换技，阴：当你使用或打出牌时，可以弃置任意张牌，若这些牌与你使用或打出的牌点数总和为13，你摸三张牌。<span class="bluetext">阳：其他角色使用牌指定唯一目标时，你可以弃置其一张牌，若此牌与其使用的牌点数之和大于13，其摸两张牌。</span>';
				return '转换技，<span class="bluetext">阴：当你使用或打出牌时，可以弃置任意张牌，若这些牌与你使用或打出的牌点数总和为13，你摸三张牌。</span>阳：其他角色使用牌指定唯一目标时，你可以弃置其一张牌，若此牌与其使用的牌点数之和大于13，其摸两张牌。';
			},
		},
		translate:{
			// "ligongsha":"理工杀",
			"st316sha":"316杀",
			"sp316sha":"316杀-SP",
			"stligongsha":"理工杀",
			"spligongsha": "理工杀-SP",
			
			"sp_hankuncheng":"SP汉坤成",
			"sp_zhuxinkun":"SP朱辛坤",
			"sp_chenxi":"SP陈曦",
			"sp_renguanyu":"SP任冠宇",
			"sp_wangwenxuan":"SP王文煊",
			"sp_liutong":"SP刘通",
			"sp_chenyaoshi":"SP陈耀仕",
			"sp_puqian":"SP蒲谦",
			"sp_hankunchengzhuxinkun":"汉坤成朱辛坤",
			"lgs_puqian":"蒲谦",
			"lgs_liutong":"刘通",
			"lgs_chenyaoshi":"陈耀仕",
			"lgs_hankuncheng":"汉坤成",
			"lgs_chenxi":"陈曦",
			"lgs_wangwenxuan":"王文煊",
			"lgs_zhuxinkun":"朱辛坤",
			"lgs_renguanyu":"任冠宇",
			
			"lgs_fengzichao":"冯梓超",
			"lgs_wangchenhao":"王宸昊",
			"lgs_gedongjian":"葛东建",
			"lgs_jihantao":"纪汉涛",
			"lgs_liuyichu":"刘奕初",
			"lgs_wangrunshizengdiwen":"王润石曾镝文",
			"lgs_wangzhaowen":"王昭雯",
			"lgs_zhangjunhao":"张峻豪",
			"lgs_zhangtianyu":"张天宇",
			"lgs_wangyujia":"王郁嘉",
			"lgs_qijunkai":"綦俊凯",
			"lgs_wangsiqi":"王思淇",
			"lgs_yubin":"于斌",
			"lgs_wangyixuan":"王逸轩",
			"lgs_guozichen":"郭子晨",
			"lgs_huxiaoyu":"胡晓雨",
			"lgs_wangqi":"王祺",
			"lgs_liujingyi":"刘敬一",
			"lgs_zhangjiahui":"张嘉慧",
			"lgs_sunqingyue":"孙清玥",
			"lgs_pengyuhong":"彭宇鸿",
			"lgs_sunjiazhi":"孙嘉志",
			"lgs_zhouruiqi":"周瑞麒",
			"lgs_wanghongshuo":"王鸿硕",
			"lgs_yeyueda":"叶跃达",
			"lgs_lixiaoting":"李筱汀",
			"lgs_zhangliao":"谋张辽",
			"lgs_zhangliaox":"谋张辽X",
			"lgs_yuxiaoran":"于筱然",
			"lgs_wanglinjing":"王琳璟",
			"lgs_liyifei":"李易非",
			"lgs_luyeyang":"逯业扬",
			"lgs_qujiaqi":"曲家祺",
			"lgs_qiyue":"齐悦",
			"lgs_guojingjun":"郭晶珺",
			"lgs_wangjiaqi":"王佳齐",
			"lgs_weixinran":"魏欣然",
			"lgs_chenglinuo":"程丽诺",
			"lgs_lizhaofu":"李炤甫",
			"lgs_wangyuan":"王媛",
			"lgs_muqing":"穆青",
			"lgs_wanghuan":"王欢",
			"sp_zengdiwen":"曾镝文",
			"sp_wangrunshi":"王润石",
			"sp_wangyixuan":"SP王逸轩",
			"sp_wanghongshuo":"SP王鸿硕",
			
			
			"lgs_gangrou":"刚柔",
			"lgs_gangrou_info":"转换技，阴：你可以将一张非基本牌当【杀】使用或打出，然后重铸一张基本牌。阳：出牌阶段，你可以弃置一张黑色牌，重置本回合【杀】的使用次数。",
			"lgs_yanhuan":"言欢", 
			"lgs_yanhuan_info":"当你于回合内使用♦牌、弃置♠牌，或于回合外使用♥牌、弃置♣牌时，可以摸一张牌。",
			"lgs_gangqu":"刚躯",
			"lgs_gangqu_info":"当你需要使用或打出【杀】时，可以展示所有手牌，若其中：有【杀】，你弃置所有【杀】并摸等量的牌，然后视为你使用或打出了一张【杀】；没有【杀】，你可以将一张牌当【杀】使用或打出，然后本回合你不能再发动此技能。",
			"lgs_liepo":"烈魄",
			"lgs_liepo_info":"当你成为一名角色【杀】的目标时，若你没有【闪】，你可以取消之。若如此做，此【杀】结算后，该角色视为对你使用了一张【决斗】。",
			"lgs_xiushen":"修身",
			"lgs_xiushen_info":"主公技，当与你势力相同的其他角色成为【杀】的目标时，其可以交给你一张【杀】，若如此做，你可以交给其一张【闪】。",
			"lgs_qishi":"起事",
			"lgs_qishi_info":"出牌阶段，你可以弃置一名其他角色一张手牌，然后若该角色只有一种花色的手牌或没有手牌，其可以展示手牌并选择一项：1.弃置你等同于其手牌数的牌；2.对你造成X点伤害（X为本回合其他角色因“起事”展示手牌的次数）。",
			"lgs_yange":"言歌",
			"lgs_yange_info":"锁定技，你的判定牌均视为♣。",
			"lgs_yian":"易安",
			"lgs_yian_info":"锁定技，你的回合外，当你的手牌数与体力值变得相等时，若此时没有体力值低于1的角色，终止一切结算，结束当前回合。",
			"lgs_xiaoyi":"晓义",
			"lgs_xiaoyi_info":"觉醒技，准备阶段，若你已发动〖易安〗的次数不小于你的手牌数，你将手牌数摸至体力上限，然后减1点体力上限，获得技能〖盈缩〗。",
			"lgs_yingsuo":"盈缩",
			"lgs_yingsuo_info":"当手牌数不大于你的角色成为【杀】的目标时，你可以选择一项：1.交给其一张手牌，然后摸一张牌；2.收回装备区的任意张牌。",
			"lgs_beishan":"备膳",
			"lgs_beishan_info":"结束阶段，你可以摸2张牌，然后将至少2张手牌置于你的武将牌上，称为“膳”。",
			"lgs_shenghua":"生花",
			"lgs_shenghua_info":"1级：每轮限一次，其他角色的摸牌阶段结束后，你可以移去一张“膳”，令其执行一个由你选择的任意阶段。2级：一名角色的摸牌阶段结束时，你可以移去X张“膳”，令其执行一个由你选择的任意阶段（X为本轮发动“生花”的次数）。",
			"lgs_manfu":"满腹",
			"lgs_manfu_info":"觉醒技，准备阶段，若你拥有四种花色的“膳”，你回复1点体力或摸2张牌，然后减少1点体力上限，升级〖生花〗。",
			"lgs_boshi":"博识",
			"lgs_boshi_info":"摸牌阶段，你可以改为观看牌堆顶的10张牌，并获得其中一张牌。",
			"lgs_youtu":"忧途",
			"lgs_youtu_info":"结束阶段，若你本回合的失去牌数≥获得牌数，你可以依次执行至多2次以下效果：令一名角色摸1张牌，然后你可以弃置其1张牌。",
			"lgs_xinyou":"心由",
			"lgs_xinyou_info":"出牌阶段开始时，你可以减一点体力上限，视为使用一张基本牌或非延时锦囊牌。若你上个出牌阶段发动过此技能：1.若你本次视为使用了与上次不同的牌，你摸1张牌；2.若你本次不发动此技能，你失去1点体力。",
			"lgs_qingshen":"轻身",
			"lgs_qingshen_info":"限定技，结束阶段，你可以选择一名其他角色，你依次将装备区里的一张牌当【杀】对其使用，直到你的装备区内没有牌或不能再对其使用【杀】，然后你增加等同于以此法造成伤害总数的体力上限。",
			"lgs_jinyi":"近易",
			"lgs_jinyi_info":"每回合限一次，当你获得牌时，你可以将至多等量的牌交给其他角色。",
			"lgs_qiujin":"求谨",
			"lgs_qiujin_info":"当你失去牌时，若你失去牌的数量：小于X，你可以移除一个“谨”标记并摸等同于失去牌数的牌；等于X，你摸X张牌，且本回合不能再发动〖求谨〗；大于X，你获得“谨”标记至此次失去牌的数量。（X为你的“谨”标记数）",
			"lgs_polu":"破路",
			"lgs_polu_info":"出牌阶段，你可以将一张牌扣置于没有“破”，且与你相邻，或与有“破”的角色相邻的角色的武将牌旁，称为“破”。有“破”的角色防具失效；当你与其他角色计算距离时，无视所有有“破”的角色；你对有“破”的角色使用牌无距离限制。有“破”的角色的回合开始时，其获得“破”。",
			"lgs_juesha":"绝杀",
			"lgs_juesha_info":"当你对距离为1的角色使用【杀】时，若此【杀】的伤害足以使其进入濒死状态，你可以令此【杀】不可被闪避且伤害+1。",
			"lgs_daimeng":"呆萌",
			"lgs_daimeng_info":"当你成为点数大于等于10的牌的目标时，可以令之对你无效。",
			"lgs_shensuan":"神算",
			"lgs_shensuan_info":"转换技，阴：当你使用或打出牌时，可以弃置任意张牌，若这些牌与你使用或打出的牌点数总和等于13，你摸3张牌。阳：当其他角色使用牌指定唯一目标时，你可以弃置其一张牌，若此牌与其使用的牌点数之和大于13，其摸2张牌。",
			"lgs_shensuan_1_info":"当你使用或打出牌时，可以弃置任意张牌，若这些牌与你使用或打出的牌点数总和等于13，你摸3张牌。",
			"lgs_shensuan_2_info":"当其他角色使用牌指定唯一目标时，你可以弃置其一张牌，若此牌与其使用的牌点数之和大于13，其摸2张牌。",
			"lgs_fengyu":"讽喻",
			"lgs_fengyu_info":"其他角色的结束阶段，若其本回合未造成过伤害，你可以令其弃一张牌。若为第一次对其发动此技能，则改为弃两张牌。",
			"lgs_jianxing":"坚行",
			"lgs_jianxing_info":"出牌阶段开始时，或当你体力值变化时，你可以展示一名角色一张手牌，其下一个结束阶段前，直到其使用此牌或受到伤害，其不能使用或打出此牌以外的其他牌。其使用此牌时若在你的回合，你摸一张牌。",
			"lgs_yonglan":"慵懒",
			"lgs_yonglan_info":"锁定技，你的回合外，当有角色使用牌指定唯一目标，且你需要使用或打出牌响应之时，若你不响应此牌，你摸一张牌；若你响应此牌，响应后你弃一张牌。",
			"lgs_yinzhi":"隐智",
			"lgs_yinzhi_info":"你可以将四张花色各不相同的牌一起当任意基本牌或普通锦囊牌使用，然后回复一点体力。",
			"lgs_guanglan":"广览",
			"lgs_guanglan_info":"有手牌的其他角色的开始阶段，你可以观看其手牌，并选择一项：1.用一张其手牌中不含有的类别的牌交换其中一张牌；2.摸一张牌并受到一点伤害。",
			"lgs_hairong":"海容",
			"lgs_hairong_info":"当你受到伤害后，可以选择一项：1.摸一张牌；2.令当前回合角色摸X张牌，然后本回合你成为其牌的目标时，你可以为此牌减少至多X个目标（X为你手牌中包含的类别数）。",
			"lgs_kubi":"苦逼",
			"lgs_kubi_wuxie":"苦逼",
			"lgs_kubi_info":"每回合限一次，当你需要使用或打出某种牌名的牌时，若你手牌中没有此牌名的牌，你可以摸1张牌，若你摸的牌不是此牌名，你翻面。锁定技，若你背面朝上，你的手牌上限+3。",
			"lgs_tiewan":"铁腕",
			"lgs_tiewan_info":"准备阶段，你可以令本回合出牌阶段最多使用一张非装备牌，若如此做，本回合你使用非装备牌指定目标时，可以令其中一名目标不能使用或打出与此牌颜色相同的牌直到回合结束，然后对其造成一点伤害。",
			"lgs_zaoxing":"早行",
			"lgs_zaoxing_info":"每轮限一次，一名角色的回合开始时，你可以摸三张牌。若如此做，跳过你的下个摸牌阶段。出牌阶段，你可以选择一项：1.弃两张牌，令一名其他角色摸一张牌；2.弃一张牌，失去一点体力并摸两张牌。若如此做，本轮你跳过弃牌阶段。",
			"lgs_qianye":"潜夜",
			"lgs_qianye_dis":"潜夜",
			"lgs_qianye_info":"当你成为其他角色使用牌的唯一目标时，你可以摸一张牌。若如此做，该牌结算结束后，你须弃置一张手牌。",
			"lgs_tianle":"天乐",
			"lgs_tianle_info":"每回合限一次，当你成为其他角色牌的目标时，可以摸一张牌并展示，然后进行一次判定，若颜色与你展示的牌相同，取消之。",
			"lgs_jieyou":"解忧",
			"lgs_jieyou_info":"其他角色出牌阶段开始时，你可以交给其等同于其体力值的牌，该出牌阶段当其使用了所有因〖解忧〗获得的牌时，你令其回复一点体力；出牌阶段结束时，若其未使用所有〖解忧〗牌，你失去一点体力。",
			"lgs_zhiyong":"智勇",
			"lgs_zhiyong_info":"你可以将全部手牌当一张【杀】使用或打出。结算后，若此【杀】造成过伤害，你摸X+1张牌（X为转化为此【杀】的牌数），然后本回合不能再发动〖智勇〗；若未造成伤害，你获得响应此杀的闪或此杀响应的牌。",
			"lgs_linyi":"凛义",
			"lgs_linyi_info":"限定技，结束阶段，你可以将体力上限减少至1，并令1至X名角色各获得两点护甲（X为减少的体力上限数）。若如此做，你死亡时，全场角色失去所有护甲。",
			"lgs_miaokou":"妙口",
			"lgs_miaokou_info":"当你使用或打出牌时，若此牌与弃牌堆顶的牌花色或点数相同，你可以摸一张牌。",
			"lgs_feiqiu":"非酋",
			"lgs_feiqiu_info":"锁定技，当你判定时，若当前判定牌将导致判定失效，你获得判定牌并重新判定。你重复此流程直到判定牌将导致判定生效。",
			"lgs_yeyin":"夜隐",
			"lgs_yeyin_info":"当你受到伤害或成为黑色牌的目标时，若你的手牌中：没有红色牌，你可以摸X张牌；有红色牌，你可以将一张红色手牌交给其他角色，然后弃置其他红色手牌并进行判定：若为红，令此伤害-1/牌对你无效。（X为你受到此牌的伤害）",
			"lgs_qiezhu":"切嘱",
			"lgs_qiezhu_info":"出牌阶段，你可以将一张武器牌交给一名其他角色，并令其获得弃牌堆中的一张【杀】；或将一张【杀】交给一名可成为你【借刀杀人】目标的角色，并视为对其使用一张【借刀杀人】。",
			"lgs_woxun":"我寻",
			"lgs_woxun_info":"使命技，准备阶段和结束阶段，或当你造成或受到伤害时，你将牌堆顶的一张牌置于武将牌上，称为“影”。当你每回合第一次使用或打出牌时，可以用一张牌替换一张“影”。<br>成功：出牌阶段开始时，若你拥有至少8张“影”，“影”中包含四种花色和三种类别，且“影”中有数量唯一最多的牌名，你记录此牌名，获得此牌名的所有“影”，然后获得技能〖定筹〗。<br>失败：出牌阶段开始时，若你有至少12张“影”，且仍未满足成功条件，你计算“影”中数量最多的牌名，弃置手牌中该牌名的牌。",
			"lgs_dingchou":"定筹",
			"lgs_dingchou_info":"锁定技，〖我寻〗成功时记录的牌名的牌不计入你的手牌上限，结束阶段你从弃牌堆中随机获得一张该牌名的牌。",
			"lgs_jisun":"极损",
			"lgs_jisun_viewas":"极损",
			"lgs_jisun_move":"极损",
			"lgs_jisun_info":"你可以将♠牌当【闪电】使用；出牌阶段，你可以将判定区里的【闪电】移动给其他角色。",
			"lgs_hongqi":"宏器",
			"lgs_hongqi_one":"宏器",
			"lgs_hongqi_more":"宏器",
			"lgs_hongqi_info":"每轮各限一次，1.其他角色受到值为1的伤害时，其可以交给你一张牌，若如此做，你可以选择一项：令其摸3张牌并将手牌弃置至X张，或令其摸X张牌并将手牌弃置至3张。2.一名角色即将受到值＞1的伤害时，你可以令其摸等同于伤害值的牌，然后此伤害减至1。（X为场上判定区内的牌数）",
			"lgs_hanxiao":"涵笑",
			"lgs_hanxiao_info":"锁定技，你的手牌上限+2X（X为你手牌中♦牌的数量）。当你失去手牌中最后的♦牌时，你回复1点体力。",
			"lgs_chenghuan":"成欢",
			"lgs_chenghuan_info":"出牌阶段限一次，你可以弃置一张牌，选择一名男性角色和一名女性角色，令其各摸一张牌，且直到你的下个出牌阶段，每当其中一方成为牌的目标时，你可以令另一方也成为此牌的目标。",
			"lgs_ganggan":"刚敢",
			"lgs_ganggan_info":"当你成为其他角色锦囊牌的目标时，你可以对其使用一张无视距离的【杀】，若此【杀】造成了伤害，该锦囊牌对你无效。",
			"lgs_xiyan":"戏言",
			"lgs_xiyan_info":"当你需要使用【杀】或非延时锦囊牌指定唯一其他角色为目标时，可以令其猜测你手牌中是否有此牌：若有且其猜测没有，你获得其一张牌；若没有且其猜测有，你视为对其使用了此牌。",
			"lgs_xingchi":"行迟",
			"lgs_xingchi_info":"锁定技，当你成为牌的目标时，若你不是此牌的唯一目标，你最后进行此牌的结算。",
			"lgs_bushi":"补食",
			"lgs_bushi_info":"每轮限3次，当其他角色使用【杀】或非延时锦囊牌指定唯一目标时，你可以摸一张牌，然后根据本轮你发动〖补食〗的次数执行：一次:你摸1张牌；两次:你弃1张牌；三次:你成为此牌的目标。",
			"lgs_cangmo":"藏墨",
			"lgs_cangmo_info":"游戏开始时，你摸2张牌并将2张手牌置于武将牌上，称为“墨”。准备阶段和结束阶段，你可以将一张“墨”与牌堆顶的一张牌交换。当你成为【杀】或锦囊牌的目标时，若你有与此牌同名的“墨”，你移除一张该牌名的“墨”并令此牌对你无效。出牌阶段，你可以移除一张“墨”，将一张牌当作与此“墨”相同的牌使用，然后从牌堆顶补充一张“墨”。",
			"lgs_youli":"游历",
			"lgs_youli_info":"锁定技，出牌阶段结束时，若你拥有技能〖藏墨〗且你没有“墨”，你观看至多两名角色的手牌，并将其中至多两张类别不同的牌置于武将牌上当作“墨”（每名角色最多选一张）。若你以此法获得的“墨”数小于2，你失去一点体力。",
			"lgs_shanxuan":"闪炫",
			"lgs_shanxuan_info":"摸牌阶段，你可以多摸X张牌(X为你的体力值的最低纪录)。",
			"lgs_jieyi":"解意",
			"lgs_jieyi_info":"每回合限一次，其他角色使用【杀】或锦囊牌时，你可以弃一张牌令此牌无效，然后其摸两张牌。若此牌目标包含该角色自己，你也摸两张牌。",
			"lgs_shannian":"善念",
			"lgs_shannian_info":"一名角色因弃置而失去牌后，你将这些牌置入仁库；一名角色因摸牌而获得牌后，你可以将仁库中至多等量的牌置于牌堆顶。",
			"lgs_jingyao":"憬遥",
			"lgs_jingyao_info":"限定技，，出牌阶段，你可以弃置X张牌并选择一名其他角色（X为你与其的距离），你与其上家交换位置，然后该角色获得技能〖芳许〗并获得X个“许”标记。",
			"lgs_oldjingyao":"憬遥",
			"lgs_oldjingyao_info":"限定技，出牌阶段，你可以弃置任意张牌并选择一名与你不相邻的其他角色，若你弃置的牌的花色包含任意一种该角色手牌所包含的花色，你与该角色的上家或下家交换位置，且你存活时，该角色摸牌阶段摸牌数+1。",
			"lgs_fangxu":"芳许",
        	"lgs_fangxu_info":"摸牌阶段，若你有“许”标记，你可以选择一项：1.多摸1张牌；2.移除一个“许”标记并多摸2张牌。",
			"lgs_qishang":"绮尚",
			"lgs_qishang_info":"游戏开始时，你获得4个“绮”标记。出牌阶段，你可以摸两张牌，然后若你手牌中包含的花色数：小于X，你移除一个“绮”标记；大于等于X，你随机弃置X张手牌，若你以此法弃置的牌数小于3，你将“绮”标记数量补至4，且本回合不能再发动〖绮尚〗。（X为“绮”标记数。）",
			"lgs_qiaohui":"巧慧",
			"lgs_qiaohui_info":"当你获得牌后，若你手牌中没有重复花色，你可以摸一张牌。",
			"lgs_qingwei":"清卫",
			"lgs_qingwei_info":"当你受到伤害时，你可以交给伤害来源一张牌；或当你造成伤害时，可以获得受伤角色一张牌。若如此做，伤害来源选择一项：1.令受伤角色回复一点体力；2.获得技能〖镜洁〗直到你的下一个“回合结束时”。",
			"lgs_jingjie":"镜洁",
			"lgs_jingjie_dis1":"镜洁",
			"lgs_jingjie_dis2":"镜洁",
			"lgs_jingjie_draw":"镜洁",
			"lgs_jingjie_info":"锁定技，当你失去牌后，你弃置区域里与失去牌同花色的所有牌。出牌阶段结束时，若你的手牌包含至少三种花色，你弃置所有手牌。结束阶段若你没有手牌，你摸一张牌。",
			"lgs_qiaqun":"洽群",
			"lgs_qiaqun2":"洽群",
			"lgs_qiaqun_info":"游戏开始时，你将4张【欢聚一堂】加入牌堆。任意角色的出牌阶段限一次，其可以弃置一张牌，从牌堆/弃牌堆中获得一张【欢聚一堂】。",
			"lgs_langfang":"朗放",
			"lgs_langfang_use":"朗放",
			"lgs_langfang_target":"朗放",
			"lgs_langfang_info":"锁定技，其他角色使用牌指定多个目标时，你摸一张牌，然后若你不是此牌目标，你成为此牌目标；你使用牌指定多个目标时，须选择至少一名目标角色，这些角色各摸一张牌。",
			"lgs_chengmian":"成眠",
			"lgs_chengmian_info":"准备阶段，你可以摸3张牌并翻面。锁定技，你的武将牌背面朝上时，你跳过出牌和弃牌阶段。",
			"lgs_zhiji":"鸷击",
			"lgs_zhiji_info":"其他角色的准备阶段，你可以对其使用一张无视距离的【杀】。你发动〖鸷击〗使用的【杀】第奇数次被闪避时你从牌堆中获得一张【杀】，第偶数次造成伤害时你翻面。",
			"lgs_shuanglun":"爽论",
			"lgs_shuanglun_info":"出牌阶段限一次，你可以与一名其他角色拼点，赢者视为对没赢者使用一张【决斗】。",
			"lgs_yanta":"言他",
			"lgs_yanta_info":"你拼点时，可以用一名不参与拼点的角色的一张手牌当作拼点牌。",
			"lgs_yingcun":"影存",
			"lgs_yingcun_record":"影存",
			"lgs_yingcun_info":"准备阶段，你可以选择一名本局未选择过的其他角色，其记录当前体力上限、体力值与手牌数。你死亡时，可以令任意名〖影存〗选择过的角色将体力上限、体力值与手牌数调整为记录值。",
			"lgs_fangyan":"芳言",
			"lgs_fangyan_info":"锁定技，你在聊天区发布的文字不会被屏蔽。",
			"lgs_ezuo":"恶作",
			"lgs_ezuo_info":"①出牌阶段限2次，你可以将一张手牌置于武将牌上称为“机关”并用此“机关”记录一名未记录的角色（“机关”及记录角色仅对自己可见），或用一张手牌替换一张已有的机关。②被记录的角色使用与对应“机关”同名的牌时，你移除该“机关”并选择一项：1.转移此牌的一名目标；2.令此牌无效，你获得此牌。",
			"lgs_tuqiang":"图强",
			"lgs_tuqiang_info":"觉醒技，开始阶段，若你发动〖恶作②〗的次数大于存活角色数，你将所有“机关”收归手牌并失去〖恶作〗，增加一点体力上限，回满体力，然后获得技能〖克己〗。",
			"lgs_xingxi":"性喜",
			"lgs_xingxi_info":"准备阶段，你可以选择一项：1.失去一点体力，结束阶段回复一点体力；2.回复一点体力，结束阶段失去一点体力。",
			"lgs_bomie":"驳蔑",
			"lgs_bomie_info":"出牌阶段限一次，当你使用【杀】指定一个目标后，你可以根据以下条件执行相应效果：若其体力值：1.大于你，本回合你使用【杀】没有距离限制，且可以多使用X张【杀】；2.等于你，你摸X张牌；3.小于你，其抵消此【杀】需要多出X张【闪】。（X为其体力值）",
			"lgs_zhenji":"镇纪",
			"lgs_zhenji_info":"每回合限一次，当一名角色使用牌指定多个目标时，你可以选择保留其中一个目标，并取消其他所有目标。",
			"lgs_xinxing":"信行",
			"lgs_xinxing_info":"你可以将区域里的随机一张牌当随机一张当前可使用的非装备牌使用（无次数限制，不能重复使用相同牌，所有牌均被使用过一次后清空已使用牌记录）。若你以此法使用的牌不是手牌，你摸一张牌，且本回合不能再发动〖信行〗。",
			"lgs_linhan":"凛寒",
			"lgs_linhan_info":"视为使用测试技能。",
			"lgs_tuxi":"突袭",
			"lgs_tuxi_info":"摸牌阶段摸牌时，你可少摸任意张牌并选择等量其他角色，你获得其一张手牌并与其谋弈：<br>披甲陷阵：其弃置一张牌；<br>断桥奇袭：其获得“惊”标记。<br>若你负，其跳过下一个弃牌阶段。",
			"lgs_huiwei":"麾围",
			"lgs_huiwei_info":"锁定技，其他角色回合开始时，若其有“惊’标记，其弃置“惊”标记并选择一项：1.本回合手牌上限-1，且令你获得〖英姿〗直至你下一回合结束；2.交给你一张装备牌。",
			"lgs_yingzi":"英姿",
			"lgs_yingzi_info":"摸牌阶段，你可以多摸一张牌。",
			"lgs_tuxix":"突袭",
			"lgs_tuxix_draw":"突袭",
			"lgs_tuxix_info":"摸牌阶段摸牌时，你可以少摸任意张牌并选择等量其他角色，你获得其一张手牌并与其谋弈：<br>披甲陷阵：你的下一个摸牌阶段摸牌数+1；<br>断桥奇袭：其获得“惊”标记。",
			"lgs_huiweix":"麾围",
			"lgs_huiweix_info":"锁定技，其他角色回合开始时，若其有“惊”标记，其弃置“惊”标记并选择一项：1.弃置2张非装备牌；2.交给你1张装备牌。",
			"lgs_jingshu":"静姝",
			"lgs_jingshu_info":"当你即将因弃置而失去牌时，你可以保留其中的任意张牌，若如此做，下一次你即将因弃置而失去这些牌时不可再保留这些牌，且失去后你受到一点伤害。",
			"lgs_duyi":"笃毅",
			"lgs_duyi_info":"出牌阶段限一次，或当你受到伤害后，你可以选择一项：1.将一张牌置于武将牌上称为“毅”，然后摸一张牌；2.获得任意张“毅”。若如此做，若你的“毅”数量等于体力值，你回复一点体力。",
			"lgs_xiaokan":"笑侃",
			"lgs_xiaokan_info":"出牌阶段，你可以弃置一名手牌数不小于你的其他角色一张牌，若如此做，其选择一项：1.摸X张牌并翻面（X为其手牌数且至多为4），然后本回合你不能再发动〖笑侃〗；2.受到你造成的一点伤害，然后视为对你使用一张【杀】。",
			"lgs_caisi":"才思",
			"lgs_caisi_info":"你可以将【闪电】和【闪】、【火攻】和火【杀】、【桃园结义】和【桃】、【无中生有】和【无懈可击】相互转化使用或打出。",
			"lgs_chijiang":"驰疆",
			"lgs_chijiang_info":"锁定技，当你使用牌指定目标时，你令除你以外的所有目标获得“疆”标记。你与有“疆”标记的角色及其相邻角色计算距离视为1。结束阶段，若你与全场角色距离1以内，你失去一点体力或减一点体力上限，获得所有其他角色区域内的各一张牌，然后弃置等同于场上“疆”标记数的牌并移除所有“疆”标记。",
			"lgs_huiyou":"会友",
			"lgs_huiyou_info":"出牌阶段，你可以弃置任意张手牌，若如此做，你选择一名手牌数小于你的角色，其摸等量的牌，然后摸X张牌（X为你与其手牌中都包含的花色数）。",
			"lgs_yinwei":"淫威",
			"lgs_yinwei_xiongluan":"淫威",
			"lgs_yinwei_info":"当你使用【杀】指定一个目标时，你可以执行以下效果：若你的手牌数大于该角色，本回合其不能使用手牌；若你的体力值大于该角色，此【杀】对其伤害+1；若你的技能数大于该角色，本回合其非锁定技失效。",
			"lgs_shenhuai":"深怀",
			"lgs_shenhuai_info":"对每名角色限一次。一名角色进入濒死状态时，你可以弃置2张牌或失去1点体力，令其回复1点体力，若如此做，直到你的下个回合结束，你获得技能〖耀武〗和〖扬威〗。",
			"lgs_yaowu":"耀武",
			"lgs_yaowu_info":"锁定技，当一名角色使用【杀】对你造成伤害时，若此杀为红色，该角色回复1点体力或摸一张牌。否则你摸一张牌。",
			"lgs_yangwei":"扬威",
			"lgs_yangwei2":"扬威",
            "lgs_yangwei3":"扬威",
            "lgs_yangwei_sha":"扬威",
			"lgs_yangwei_info":"出牌阶段限一次，你可以摸两张牌并获得“威”标记直到此阶段结束，然后此技能失效直到下个回合的结束阶段。拥有“威”标记的角色出牌阶段可额外使用一张【杀】、使用【杀】无距离限制且无视防具。",
            "lgs_qjinyi":"锦衣",
			"lgs_qjinyi_info":"每回合限一次，当一张装备牌进入你的装备区后，你可以摸X张牌（X为你装备区的牌数）。",
			"lgs_shuangzhi":"爽直",
			"lgs_shuangzhi_info":"每回合限一次，当你成为其他角色非伤害类锦囊牌的目标时，你可以对其造成一点伤害。",
			"lgs_kaizhu":"慨助",
			"lgs_kaizhu_info":"出牌阶段，你可以将装备区或判定区的一张牌移动给其他角色并令其回复一点体力，然后你废除对应区域；其他角色与你计算距离+X（X为你废除的区域数）；其他角色失去因〖慨助〗进入其区域的牌后，你恢复你的对应区域。",
			"lgs_jiangxin":"匠心",
			"lgs_jiangxin_info":"当你受到伤害后，可以弃置两张牌（不足则全弃，无牌则不弃），然后摸一张牌并展示之。若你以此法弃置与摸的牌：1.有至少两张花色相同，你摸两张牌；2.三张花色相同，你可以再次发动〖匠心〗。",
			"lgs_mengxu":"梦续",
			"lgs_mengxu_info":"锁定技，你的任意阶段开始前，若你的手牌数小于4，你摸1张牌并跳过此阶段。",
			"lgs_yiying":"义膺",
			"lgs_yiying_info":"每回合限一次，其他角色使用的目标包含自己的红色牌结算后，若其体力值大于你，你可以选择一项：1.弃置其一张牌；2.视为对其使用一张无距离限制的【杀】。背水：弃置两张手牌。",
			"lgs_biluo":"笔落",
			"lgs_biluo_info":"当你的一张基本牌或普通锦囊牌（包括你的判定牌）因使用之外的原因进入弃牌堆时，你可以视为使用一张与此牌相同的牌（不计次数，无距离限制）。",
			"lgs_qinhe":"亲和",
			"lgs_qinhe_give":"亲和",
			"lgs_qinhe_gain":"亲和",
			"lgs_qinhe_info":"出牌阶段限2次，你可以令一名没有“和”标记的角色获得“和”标记。有“和”标记的角色：1.受到伤害时，摸2张牌，且你可以移除其“和”标记；2.造成伤害时，移除“和”标记并弃置2张牌。",
			"lgs_shiyuan":"释怨",
			"lgs_shiyuan_info":"当一名角色使用【杀】指定一个目标时，你可以取消之，该角色收回此【杀】，然后根据你对该角色发动〖释怨〗的次数执行以下效果：一次，你与其各摸一张牌；两次，其可以对你使用一张【杀】；三次，你失去技能〖释怨〗。",
			"lgs_qianyin":"千音",
			"lgs_qianyin_info":"锁定技，当你造成伤害、受到伤害或回复体力后，你失去上次因〖千音〗获得的技能，然后随机获得一个“理工杀”扩展包的技能（不可重复获得相同技能，不可获得觉醒技、使命技和联动技能）。",
			"lgs_jifei":"疾非",
			"lgs_jifei_info":"其他角色使用牌指定除你和其以外的角色为唯一目标时，你可以与其拼点，赢者摸一张牌并展示之。",
			"lgs_minghao":"明毫",
			"lgs_minghao_info":"其他角色的结束阶段，你可以猜测其手牌中是否有某种牌名的牌。若猜对，你根据牌名执行对应效果，然后可以再次发动〖明毫〗（不得猜测本回合猜过的牌名）；若该回合首次即猜错，本轮〖明毫〗失效。<br>·牌名及对应效果：<br>·【杀】：你视为对其使用一张【杀】；<br>·【闪】：你弃置其一张牌；<br>·【桃】或【酒】：你获得其一张牌；<br>·锦囊牌：其弃置此牌名的所有牌并横置武将牌；<br>·装备牌：你对其造成一点伤害。",
			"lgs_zhiqian":"执前",
			"lgs_zhiqian_draw":"执前",
			"lgs_zhiqian_discard":"执前",
			"lgs_zhiqian_info":"锁定技，摸牌阶段，若你的手牌数为全场最少，你改为摸X张牌（X为手牌最多角色手牌数）；弃牌阶段，若你的手牌数为全场最多，你改为弃Y张牌（Y为手牌最少角色手牌数）。",
			"lgs_wendao":"问道",
			"lgs_wendao_info":"当你需要使用牌时（濒死使用【桃】【酒】和使用【无懈可击】时除外），你可以弃两张牌并摸一张牌，或弃一张牌并摸两张牌。若如此做，①本次你使用与弃置的牌同花色的牌无次数与距离限制，②本次你不能使用与摸的牌同类型的牌。",
			"lgs_fengsao":"风骚",
			"lgs_fengsao_info":"每回合限3次，你可以将一张牌当作其他角色使用牌历史记录中的倒数第X张非装备牌使用（X为本回合你发动此技能的次数；以此法使用牌无距离与次数限制）。",
			"lgs_weizun":"唯尊",
			"lgs_weizun_info":"限定技，出牌阶段，你可以选择一名目标，然后令除你以外的所有角色依次执行：其可以对该目标使用一张牌，若其使用了牌，本局游戏你于出牌阶段可使用杀的次数+1，若其未使用牌，你可以视为对其使用一张杀（不计次数）。",
			"lgs_liangcong":"良从",
			"lgs_liangcong_info":"当你受到或造成伤害时，你可以选择一项：1.弃置伤害来源的武器牌和受伤角色的防具牌；2.弃置伤害来源的进攻马和受伤角色的防御马。",
			"lgs_gufang":"孤芳",
			"lgs_gufang_info":"结束阶段，你依次执行以下两项：1.若你装备区牌的数量不为全场唯一最多，你可以移动场上的一张装备牌；2.若你装备区牌的数量为全场唯一最多，你可以摸一张牌。",
			"lgs_yasi":"雅思",
			"lgs_yasi_info":"出牌阶段限一次，你可以弃置一张红色牌，令一名角色进行一次判定，若点数不小于7，其摸两张牌并回复一点体力。",
			"lgs_linuo":"立诺",
			"lgs_linuo_info":"每回合限一次，一名角色的判定牌生效前，你可以亮出牌堆顶的一张牌，并对判定牌执行以下更改之一：1.点数+X；2.点数-X；3.花色改为亮出牌的花色。（牌面永久更改，X为亮出牌的点数。）执行结束后，你将亮出的牌置入弃牌堆。",
			"lgs_huishi":"慧识",
			"lgs_huishi_info":"对每名其他角色限一次。其他角色的结束阶段，你可以猜测其身份（你的猜测仅该角色可知），其告知你正确与否。若猜对，其获得“识”标记；若猜错，你可以对其造成一点伤害，然后〖慧识〗失效直到你的下回合开始。",
			"lgs_jiechong":"节冲",
			"lgs_jiechong_info":"觉醒技，准备阶段，若你对所有当前存活的其他角色发动过〖慧识〗，你减一点体力上限，获得技能〖忘嫌〗，然后令有“识”标记的角色依次选择一项：1.移除“识”标记，然后受到你造成的3点伤害；2.亮出身份牌，然后你可以视为对其使用一张【杀】。",
			"lgs_wangxian":"忘嫌",
			"lgs_wangxian_info":"当有“识”标记的角色对你造成伤害时，你可以令其摸3张牌；当你对有“识”标记的角色造成伤害时，你可以摸3张牌，然后你本回合使用牌不能再指定该角色为目标。",
			"lgs_chaojie":"嘲解",
			"lgs_chaojie_info":"当你受到伤害时，你可以令你与伤害来源中手牌较多者将手牌弃置至数量与对方相同，若伤害来源未以此法弃置牌，此伤害对你无效。",
			"lgs_jueyi":"决意",
			"lgs_jueyi_info":"当一名角色使用【杀】指定一个目标时，你可以弃置一张牌，令目标角色不能使用【闪】。",
			"lgs_qinmian":"勤勉",
			"lgs_qinmian_info":"当你于回合内使用牌时，若你有可弃置的牌，你可以弃置X张牌（不足则全弃）并摸X张牌（X为本回合发动〖勤勉〗的次数）。若你以此法弃置了所有牌，则你增加一点体力上限（最多加至5），然后本回合不能再发动〖勤勉〗。",
			"lgs_yunshi":"蕴诗",
			"lgs_yunshi_info":"出牌阶段限一次，若你手牌中的花色数等于体力值，你可以回复一点体力。",
			"lgs_jiaoxin":"交心",
			"lgs_jiaoxin_info":"出牌阶段对每名角色限一次，你可以与一名其他角色各选择一张手牌并交换。若你选择的是♥牌：1.若其选择的也是♥牌，你可以令其摸1张牌；2.若其选择的不是♥牌，你可以令其失去1点体力。",
			"lgs_keyan":"恪严",
			"lgs_keyan_info":"锁定技，结束阶段，你摸3张牌，然后弃置一种颜色的所有手牌。",
			"lgs_renjian":"韧坚",
			"lgs_renjian_info":"当你于一回合内受到第2点伤害时，你可以回复1点体力。",
			"lgs_zhanyue":"展跃",
			"lgs_zhanyue_info":"你可以视为使用【杀】。锁定技，当你使用的虚拟【杀】结算后，若没有【闪】响应此【杀】，你失去1点体力并摸等同于已失去体力值数量的牌，然后本回合使用实体非转化【杀】无次数与距离限制。",
			"lgs_huixie":"诙谐",
			"lgs_huixie_info":"你使用♦基本或普通锦囊牌可以多指定一个目标；其他角色使用♦基本或普通锦囊牌可以指定你为额外目标。",
			"lgs_jieshen":"洁身",
			"lgs_jieshen_disable":"洁身",
			"lgs_jieshen_info":"当你受到伤害时，你可以弃置所有手牌，然后若你弃置的牌数：小于3，你摸3张牌，令此伤害的值最多为1；大于等于3，你摸2张牌，然后回复一点体力。",
			"lgs_fenqu":"奋取",
			"lgs_fenqu_info":"当你使用【杀】指定一个目标时，若此【杀】有点数，可以令该角色交给你任意张总点数>X的牌（X为此【杀】的点数，若其所有牌的总点数≤X则全部交出）。若其交出的牌总点数>10，此【杀】对其无效。",
			"lgs_zongyu":"纵欲",
			"lgs_zongyu_info":"摸牌阶段摸牌时，你可以选择一项：1.回复一点体力，少摸一张牌；2.失去一点体力，多摸两张牌。",
			"lgs_nixi":"逆袭",
			"lgs_nixi_info":"当你回复体力时，你可以视为使用一张【杀】（无距离与次数限制），当此【杀】：造成伤害时，你摸一张牌；被闪避时，你失去一点体力。",
			"lgs_zhenmi":"缜密",
			"lgs_zhenmi_info":"当你使用或打出牌后，你可以摸一张牌，然后弃一张牌。若你弃置的牌为装备牌，本回合你不能再发动〖缜密〗，然后你可以将至多3张本回合因〖缜密〗弃置且仍在弃牌堆中的牌交给一名其他角色，",
			"lgs_jiehuo":"解惑",
			"lgs_jiehuo_global":"解惑",
			"lgs_jiehuo_info":"当你攻击范围内的其他角色需要使用或打出【闪】时，其可以令你选择是否将一张非装备牌当做【闪】替其使用或打出。当你以此法使用或打出转化【闪】时，若对应的实体牌不是【闪】，你失去一点体力。",
			"lgs_shouye":"授业",
			"lgs_shouye_2":"授业",
			"lgs_shouye_3":"授业",
			"lgs_shouye_4":"授业",
			"lgs_shouye_info":"其他角色的准备阶段，你可以展示一张非装备手牌，本回合其可以将一张牌当做你展示的牌使用（限一次）。若如此做，本回合结束阶段，若其本回合因〖授业〗使用过牌，其获得你展示的牌并摸2张牌。",
			"lgs_ciai":"慈爱",
			"lgs_ciai_info":"锁定技，你不能使用♠非装备牌或成为♠非装备牌的目标；你使用♥牌时，此牌除造成伤害以外的效果值+1。",
			"lgs_shixin":"师心",
			"lgs_shixin_info":"主公技，当一名与你同势力的其他角色从你的区域里获得牌时，若其手牌数不小于你，你可以令其摸1张牌。",
			"lgs_touliang":"偷梁",
			"lgs_touliang1":"偷梁",
			"lgs_touliang2":"偷梁",
			"lgs_touliang_info":"锁定技，当一名其他角色跳过任意阶段时，或一名其他角色出牌阶段结束后，若该出牌阶段其未使用牌指定过除其以外的角色为目标，你摸一张牌并执行一个额外的此阶段。",
			"lgs_huanzhu":"换柱",
			"lgs_huanzhu_info":"其他角色的回合开始前，若你正面朝上，你可以减一点体力上限，与其交换位置并摸x张牌(x为你与其位次之差) ，然后将此回合改为你的回合。若如此做，本回合结束后，你将武将牌翻面，然后将手牌数调整至体力上限。",
			"lgs_zhenghuo":"整活",
			"lgs_zhenghuo_info":"每当你造成一点伤害后（改：使用非延时锦囊牌或【杀】时），你获得一个“活”标记。当你即将受到值＞1的伤害时，你可以弃置一个“活”标记，令此伤害-1（改：防止此伤害）。",
			"lgs_huahuo":"花活",
			"lgs_huahuo_info":"觉醒技，准备阶段，若你的“活”标记数≥3，你减一点体力上限，修改技能〖整活〗并获得技能〖狠活〗。",
			"lgs_henhuo":"狠活",
			"lgs_henhuo_info":"当你造成伤害时，你可以弃置至少2个“活”标记并进行X次判定（X为弃置的“活”标记数-1），然后可以执行以下选项中的至多Y项（Y为判定结果为黑色的次数）：1.重置本回合【杀】的使用次数；2.获得所有黑色判定牌；3.弃置一张牌令此伤害+1。",
			"":"",
			"":"",
			"":"",
			"":"",
			"":"",
			"":"",
			
			"huanjuyitang":"欢聚一堂",
			"huanjuyitang_info":"出牌阶段，对所有角色使用。你选择一项，令所有目标依次执行：1.弃一张牌，然后摸一张牌，若其上下家手牌数相等则多摸一张牌；2.摸一张牌，然后弃一张牌，若其上下家手牌数相等则多弃一张牌。",
			"identity":"身份",
			"huishi_zhu":"主公",
			"huishi_zhong":"忠臣",
			"huishi_fan":"反贼",
			"huishi_nei":"内奸",
		},
	};
});

		if(!lib.config.characters.contains('ligongsha')) lib.config.characters.remove('ligongsha');
		lib.translate['ligongsha_character_config']='<span style=\"color: yellow\">理工杀</span>';
	},
	help:{},config:{},package:{
    character:{
        character:{
		},
        translate:{
        },
    },
    card:{
        card:{
        },
        translate:{
        },
        list:[],
    },
    skill:{
        skill:{  
        },
        translate:{
		},
    },
    intro:(function(){
		var log = [
			'update in 2024/3/23',
			'- 调整技能：〖亲和〗〖深怀〗，修复技能〖宏器〗的bug',
			'- 为多个技能添加语音',
			'',
			'v2.1 2022-8-18',
			'- 更新武将：王郁嘉，綦俊凯',
			'',
			'v2.0 2022-7-30',
			'- 整体更改扩展包格式，实现“武将分栏”、“武将评级”、“选将界面标/界/SP转换”、“国战珠联璧合”、“转换技描述动态标注”等功能',
			'- 更新武将：汉坤成&朱辛坤，SP刘通，刘奕初，王润石&曾镝文，王昭雯，张峻豪，张天宇',
			'- 修复葛东建〖坚行〗被展示牌的角色会判定八卦阵并取消坚行的bug',
			'- 修复纪汉涛〖隐智〗ai不生效的bug',
			'- 修复蒲谦〖起事〗ai队友会选择报复的bug',
			'- 优化SP汉坤成〖刚柔〗ai，并为〖刚柔〗添加转换技标记',
			'- SP汉坤成〖刚柔〗、陈耀仕〖生花〗、王宸昊〖神算〗技能描述添加动态标注',
			'',
			'v1.07 2022-7-24',
			'- 更新武将：纪汉涛',
			'v1.06 2022-7-19',
			'- 更新武将：王宸昊，葛东建（使用王宸昊请更新理工杀至最新版本，安装包已发至QQ群）',
			'- 修复sp王文煊〖破路〗ai的bug',
            'v1.05 2022-7-8',
			'- 更新武将：SP王文煊，冯梓超',
			'v1.04.2 2022-7-1',
			'- 添加了SP汉坤成、蒲谦、陈耀仕和刘通的技能AI，和各武将技能的威胁度；修改了SP任冠宇〖轻身〗AI',
			'- 修复了刘通手牌数等于体力值时，失去装备会触发〖易安〗的bug',
			'v1.04.1 2022-6-19',
			'- SP朱辛坤添加主公技“修身”',
			'- 按照新版技能描述，修改了SP朱辛坤〖烈魄〗，发动时无需展示手牌，有闪时不能发动',
			'- 按照新版技能描述，修改了SP汉坤成〖言欢〗，改为只能自己摸牌。（实际效果：无需点击选择目标，手感更丝滑）',
			'v1.04 2022-6-14',
			'- 更新武将：SP任冠宇',
			'- 按照技能描述，修改了SP汉坤成〖言欢〗的触发时机',
            'v1.03.3 2022-6-9',
            '- 修复了陈耀仕〖生花〗取消后仍会增加本轮发动次数的BUG；现在，〖生花〗会在“膳”不足时不可发动',
            'v1.03 2022-6-7',
            '- 更新武将：刘通，陈耀仕，SP陈曦',
            '- 修复了SP朱辛坤的文本错误',
            '- 为多项技能添加了指示线以提示',
            'v1.02.3 2022-6-6',
            '- 测试武将：刘通觉醒版，陈耀仕（施工中）',
            'v1.02.2 2022-6-5',
            '- 修复了SP汉坤成“刚柔①”关于重铸事件的结算顺序错误',
            'v1.02.1 2022-6-2',
            '- 测试武将：刘通“易安”无限制版',
            '- 优化SP汉坤成代码',
            'v1.02 2022-6-1',
			'- 更新武将：蒲谦',
			'- 将更新日志内置进拓展包信息界面',
			'v1.01 2022-5-28',
			'- 更新武将：SP朱辛坤',
			'- 优化SP汉坤成代码',
			'v1.00',
			'- 更新第一个武将：SP汉坤成',
		];
		return '<p style="color:rgb(210,210,000); font-size:12px; line-height:14px; text-shadow: 0 0 2px black;">' + log.join('<br>') + '</p>';
	})(),
    author:"酒盏深和浅，ech0",
    diskURL:"",
    forumURL:"",
    version:"2.0",
},files:{"character":["sp_hankuncheng.jpg","sp_zhuxinkun.jpg","lgs_puqian.jpg","lgs_liutong.jpg","lgs_fengzichao.jpg","sp_wangwenxuan"],"card":[],"skill":[]}}})

// 写法参考：
// 判断技能发动次数：峻攻
