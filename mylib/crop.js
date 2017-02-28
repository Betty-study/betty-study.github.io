;(function($){
			var Crop=function(opts){
				this.boundingBox=null;//最外层容器
				this.handlers={};
				
				this.opts={
					'width':400,
					'height':400,
					'ratio_wh':1,
					'trackerW':100,
					'imgSrc':'koala.jpg',
				}
				
				this.rend();
			};
			Crop.prototype={
				//自定义事件
				on:function(type,handle){//添加自定义事件
					if(typeof this.handlers[type]=='undefined'){
						this.handlers[type]=[];
					}
					this.handlers[type].push(handle);
					return this //链式调用
				},
				fire:function(type,data){//执行自定义事件
					if(this.handlers[type] instanceof Array){
						this.handlers[type].each(function(){
							$(this)(data);
						});
					}
				},
				//方法：添加DOM节点
				rendUI:function(){
					this.boundingBox=$('<div class="crop"></div>');
					this.boundingBox.appendTo('body');
					this.cropMain=$('<div class="crop-main"></div>');//图片预览主容器
					this.cropPreview=$('<div class="crop-preview"></div>'); //剪切预览区
					this.cropMain.appendTo(this.boundingBox);
					this.cropPreview.appendTo(this.boundingBox);
					this.cropImg=$('<img src="'+this.opts.imgSrc+'" class="clip-img" />');//原始图片
					this.cropImg.appendTo(this.cropMain);
                    this.cropHolder=$('<div class="crop-holder"></div>'); //剪切操作区
                    this.cropHolder.appendTo(this.cropMain);
                    this.cropTracker=$('<div class="crop-tracker"></div>'); //图片剪切追踪框
                    this.cropTracker.appendTo(this.cropHolder);
                    this.cropHandles=$('<span class="crop-handle crop-handle-tl" data-handle="tl"></span>'+
										'<span class="crop-handle crop-handle-tm" data-handle="tm"></span>'+
										'<span class="crop-handle crop-handle-tr" data-handle="tr"></span>'+
										'<span class="crop-handle crop-handle-rm" data-handle="rm"></span>'+
										'<span class="crop-handle crop-handle-br" data-handle="br"></span>'+
										'<span class="crop-handle crop-handle-bm" data-handle="bm"></span>'+
										'<span class="crop-handle crop-handle-bl" data-handle="bl"></span>'+
										'<span class="crop-handle crop-handle-lm" data-handle="lm"></span>');//拖拽拉伸控制点
					this.cropHandles.appendTo(this.cropTracker); 
					this.cropShow=$('<div></div>') //选区显示部分
					this.cropShow.appendTo(this.cropTracker); 
				},
				//方法：监听事件
				bindUI:function(){
				},
				//方法：初始化组件属性
				syncUI:function(){
					var that=this;
					this.cropMain.css({
						'width':this.opts.width,
						'height':this.opts.height
					});
					
					//图片加载完后执行					
					this.cropImg.on('load', function() {
						if($(this).width()/$(this).height<that.opts.ratio_wh){
							$(this).height('100%');
						} else {
							$(this).width('100%');
						}
						
						var height=$(this).height(),
							width=$(this).width(),
							left=(that.opts.width-width)/2,
							top=(that.opts.height-height)/2;
						that.cropImg.css({
							'position':'absolute',
							'left':left,
							'top':top, 
						});
						
						that.cropHolder.css({
							'position':'absolute',
							'width':width,
							'height':height,
							'left':left,
							'top':top,
						});
						var tracker_h=that.opts.trackerW*that.opts.ratio_wh;
						that.cropTracker.css({
							'width':that.opts.trackerW,
							'height':tracker_h,
							'left':(width-that.opts.trackerW)/2,
							'top':(height-tracker_h)/2,
						});
					});		
				},
				//方法：渲染组件
				rend:function(){
					this.rendUI();
					this.bindUI();
					this.syncUI();
				}
			};
			window['Crop']=Crop;
		})(window.jQuery);