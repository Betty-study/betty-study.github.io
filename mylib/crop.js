;
(function($) {
	var Crop = function(opts) {
		this.boundingBox = null; //最外层容器
		this.handlers = {};

		this.opts = {
			'width': 400,
			'height': 400,
			'trackerW': 100,
			'imgSrc': 'koala.jpg',
		}
		
		$.extend(this.opts, opts);
		this.rend();
	};
	Crop.prototype = {
		
		//自定义事件
		on: function(type, handle) { //添加自定义事件
			if(typeof this.handlers[type] == 'undefined') {
				this.handlers[type] = [];
			}
			this.handlers[type].push(handle);
			return this //链式调用
		},
		fire: function(type, data) { //执行自定义事件
			if(this.handlers[type] instanceof Array) {
				this.handlers[type].each(function() {
					$(this)(data);
				});
			}
		},
		//方法：添加DOM节点
		rendUI: function() {
			this.boundingBox = $('<div class="crop"></div>');
			this.boundingBox.appendTo('body');
			this.cropMain = $('<div class="crop-main"></div>'); //图片预览主容器
			this.cropPreview = $('<div class="crop-preview"></div>'); //剪切预览区
			this.cropMain.appendTo(this.boundingBox);
			this.cropPreview.appendTo(this.boundingBox);
			this.cropImg = $('<img src="' + this.opts.imgSrc + '" class="clip-img" />'); //原始图片
			this.cropImg.appendTo(this.cropMain);
			this.cropHolder = $('<div class="crop-holder"></div>'); //剪切操作区
			this.cropHolder.appendTo(this.cropMain);
			this.cropTracker = $('<div class="crop-tracker"></div>'); //图片剪切追踪框
			this.cropTracker.appendTo(this.cropHolder);
			this.cropHandles = $('<span class="crop-handle crop-handle-tl" data-handle="tl"></span>' +
				'<span class="crop-handle crop-handle-tm" data-handle="tm"></span>' +
				'<span class="crop-handle crop-handle-tr" data-handle="tr"></span>' +
				'<span class="crop-handle crop-handle-rm" data-handle="rm"></span>' +
				'<span class="crop-handle crop-handle-br" data-handle="br"></span>' +
				'<span class="crop-handle crop-handle-bm" data-handle="bm"></span>' +
				'<span class="crop-handle crop-handle-bl" data-handle="bl"></span>' +
				'<span class="crop-handle crop-handle-lm" data-handle="lm"></span>'); //拖拽拉伸控制点
			this.cropHandles.appendTo(this.cropTracker);
			this.cropShow = $('<div></div>') //选区显示部分
			this.cropShow.appendTo(this.cropTracker);
		},
		
		//方法：初始化组件属性
		syncUI: function() {
			var that = this;
			var ratio_wh=this.opts.width/this.opts.height;
			this.cropMain.css({
				'width': this.opts.width,
				'height': this.opts.height
			});

			//图片加载完后执行					
			this.cropImg.on('load', function() {
				var src=$(this).attr('src');
				if($(this).width() / $(this).height < that._getRatio()) {
					$(this).height('100%');
				} else {
					$(this).width('100%');
				}

				var height = $(this).height(),
					width = $(this).width(),
					left = (that.opts.width - width) / 2,
					top = (that.opts.height - height) / 2;
				that.cropImg.css({
					'position': 'absolute',
					'left': left,
					'top': top,
					'opacity':0.6,
				});

				that.cropHolder.css({
					'position': 'absolute',
					'width': width,
					'height': height,
					'left': left,
					'top': top,
				});
				var tracker_h = that.opts.trackerW / that._getRatio(),
					offset_l=(width - that.opts.trackerW) / 2, //追踪选择框左偏移值
					offset_t=(height - tracker_h) / 2;
				that.cropTracker.css({
					'width': that.opts.trackerW,
					'height': tracker_h,
					'left': offset_l,
					'top': offset_t,
				});
				that.cropShow.css({ 
					'height':tracker_h,
					'background':'url('+src+')  no-repeat',
					'background-size': width + 'px '+ height+'px', //多个值需加单位
					'background-position':-offset_l +'px '+ -offset_t+'px', 
					'overflow':'hidden',
				});
				that.cropPreview.css({
					'width': that.opts.trackerW,
					'height':tracker_h,
					'border':'1px solid #ddd',
					'background':'url('+src+')  no-repeat',
					'background-size': width + 'px '+ height+'px', //多个值需加单位
					'background-position':-offset_l +'px '+ -offset_t+'px', 
				});
			});
			
		},
		//方法：监听事件
		bindUI: function() {
			var that=this;
			this.cropTracker.on('mousedown',function(e){
				that.mousedownMove(e);
			});
			$(document).on('mousemove',function(e){
				that.mouseMove(e);
			}).on('mouseup',function(){
				that._isMove=false;
			});
			
		},
		//方法：渲染组件
		rend: function() {
			this.rendUI();
			this.syncUI();
			this.bindUI();
		},
		
		_getRatio:function(){
			return this.opts.width/this.opts.height;
		},
		_getTrackerHeight:function(){
			return this.cropTracker.width() / this._getRatio();
		},
		
		updatePreviewUI:function(l,t){
			var ratio=this.cropTracker.width() / this.cropPreview.width();
			var sizeW=this.cropTracker.width() / ratio,
				sizeH=this._getTrackerHeight() / ratio,
				posL=-l*sizeW/this.cropImg.width(),
				posT=-t*sizeH/this.cropImg.height();
				
			this.cropPreview.css({
				'background-size': sizeW+ 'px '+ sizeH+'px', 
				'background-position':posL +'px '+ posT+'px'
			});
		},
		_mousedown:function(e){
			this.startX=e.pageX;
			this.startY=e.pageY;
			this.posL=this.cropTracker.position().left;
			this.posT=this.cropTracker.position().top;
		},
		mousedownMove:function(e){
			this._mousedown(e);
			this._isMove=true;
		},
		updateMoveUI:function(e){
			var left=e.pageX-this.startX+this.posL,
				top=e.pageY-this.startY+this.posT;
			//选框活动范围
			var maxL=this.cropImg.width()-this.cropTracker.width(),
				maxT=this.cropImg.height()-this.cropTracker.height();
				
				left=left>0?(left>maxL?maxL:left):0;
				top=top>0?(top>maxT?maxT:top):0;
				
				this.cropTracker.css({
						'left':left,
						'top':top
				});
				this.cropShow.css({
					'background-position':-left +'px '+ -top+'px', 
				});
				this.updatePreviewUI(left,top);
				
		},
		mouseMove:function(e){
			if(this._isMove){
				this.updateMoveUI(e);
			}
		},
		_mousedownStretch:function(e){
			
		},
		
		stretch:function(e){
			
		},
		redraw:function(e){
			
		},
	
	};
	window['Crop'] = Crop;
})(window.jQuery);