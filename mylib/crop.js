;
(function($) {
	var Crop = function(opts) {
		this.boundingBox = null; //最外层容器
		this.handles = {};

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
		on: function(type, handler) { //添加自定义事件
			if(typeof this.handles[type] == "undefined") {
				this.handles[type] = [];
			}
			this.handles[type].push(handler);
			return this; //链式调用
		},
		fire: function(type, data) { //执行自定义事件
			if(this.handles[type] instanceof Array) {
				var handles = this.handles[type];
				for(var i = 0, len = handles.length; i < len; i++) {
					handles[i](data);
				}
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
				'<span class="crop-handle crop-handle-lm" data-handle="lm"></span>'); //拖拽拉伸控制点， 增加data-handle方便查找相应的控制点
			this.cropHandles.appendTo(this.cropTracker);
			this.cropShow = $('<div></div>') //选区显示部分
			this.cropShow.appendTo(this.cropTracker);
		},

		//方法：初始化组件属性
		syncUI: function() {
			var that = this;
			var ratio_wh = this.opts.width / this.opts.height;
			this.cropMain.css({
				'width': this.opts.width,
				'height': this.opts.height
			});

			//图片加载完后执行					
			this.cropImg.on('load', function() {
				var src = $(this).attr('src');
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
					'opacity': 0.6,
				});

				that.cropHolder.css({
					'position': 'absolute',
					'width': width,
					'height': height,
					'left': left,
					'top': top,
				});
				var tracker_h = that.opts.trackerW / that._getRatio(),
					offset_l = (width - that.opts.trackerW) / 2, //追踪选择框左偏移值
					offset_t = (height - tracker_h) / 2;
				that.cropTracker.css({
					'width': that.opts.trackerW,
					'height': tracker_h,
					'left': offset_l,
					'top': offset_t,
				});
				that.cropShow.css({
					//'position':'absolute',
					'height': '100%',
					'background': 'url(' + src + ')  no-repeat',
					'background-size': width + 'px ' + height + 'px', //多个值需加单位
					'background-position': -offset_l + 'px ' + -offset_t + 'px',
					'overflow': 'hidden',
				});
				that.cropPreview.css({
					'width': that.opts.trackerW,
					'height': tracker_h,
					'border': '1px solid #ddd',
					'background': 'url(' + src + ')  no-repeat',
					'background-size': width + 'px ' + height + 'px', //多个值需加单位
					'background-position': -offset_l + 'px ' + -offset_t + 'px',
				});
			});

		},
		//方法：监听事件
		bindUI: function() {
			var that = this;
			this.boundingBox.delegate('.crop-main', 'mousedown', function(e) {
				that.fire('mousedownRedraw', e);
			}).delegate('.crop-tracker', 'mousedown', function(e) {
				that.fire('mousedowMove', e);
			}).delegate('.crop-handle', 'mousedown', function(e) {
				that.fire('mousedownStrect', e);
				that.handle = $(this).data('handle');
			});

			$(document).on('mousemove', function(e) {
				that.fire('mouseMove', e)
			}).on('mouseup', function() {
				that.destory();
			});

			this.on('mousedownRedraw', function(e) {
					that.mousedownRedraw(e)
				})
				.on('mousedowMove', function(e) {
					that.mousedownMove(e);
				})
				.on('mousedownStrect', function(e) {
					that.mousedownStrect(e)
				})
				.on('mouseMove', function(e) {
					that.mouseMove(e);
				});

		},
		//方法：渲染组件
		rend: function() {
			this.rendUI();
			this.syncUI();
			this.bindUI();
		},

		destory: function() {
			if(this._isRedraw){
				this.cropHandles.appendTo(this.cropTracker);
			}
			this._isMove = false;
			this._isDrag=false;
			this._isRedraw=false;
		},

		_getRatio: function() {
			return this.opts.width / this.opts.height;
		},
		_getTrackerHeight: function() {
			return this.cropTracker.width() / this._getRatio();
		},
		_getCropImgCss:function(){
			return {
				'width':this.cropImg.width(),
				'height':this.cropImg.height()
			}
		},
		updatePreviewUI: function(l, t) {
			var ratio = this.cropTracker.width() / this.cropPreview.width();
			var sizeW = this._getCropImgCss().width / ratio,
				sizeH = this._getCropImgCss().height / ratio,
				posL = -l * sizeW / this._getCropImgCss().width,
				posT = -t * sizeH / this._getCropImgCss().height;

			this.cropPreview.css({
				'background-size': sizeW + 'px ' + sizeH + 'px',
				'background-position': posL + 'px ' + posT + 'px'
			});
		},
		_mousedown: function(e) {
			e.stopPropagation();
			this.startX = e.pageX;
			this.startY = e.pageY;
			//保存当前移动拖拽选框的高和宽及相对于父元素的偏移量
			this.trackerH = this.cropTracker.height();
			this.trackerW = this.cropTracker.width();
			this.posL = this.cropTracker.position().left;
			this.posT = this.cropTracker.position().top;
			
		},
		mousedownMove: function(e) {
			this._mousedown(e);
			this._isMove = true;
			this._isDrag = false;
		},
		mousedownStrect: function(e) {
			this._mousedown(e);
			this.posR = this._getCropImgCss().width - this.cropTracker.width()  - this.posL;
			this.posB = this._getCropImgCss().height - this.cropTracker.height() - this.posT;
			this._isMove = false;
			this._isDrag = true;

		},
		mousedownRedraw: function(e) {
			this.startX = e.pageX;
			this.startY = e.pageY;
			this._isRedraw=true;
			this.cropTracker.css({
				display:'none',
				width:0,
				height:0, 
			});
			this.cropImg.css({
				'opacity':1, 
			}); 
		},

		updateStrectUI: function(e) {
			var width, height, max_w, max_h, left, top,
				min_w = 10,
				min_h = 10;

			if(this.handle == 'tm' || this.handle == 'bm') {
				height = e.pageY - this.startY + this.trackerH;
				if(this.handle == 'tm') {
					height = this.startY - e.pageY + this.trackerH;
				}
				width = height * this._getRatio();
			} else if(this.handle == 'lm' || this.handle == 'rm') {
				width = e.pageX - this.startX + this.trackerW;
				if(this.handle == 'lm') {
					width = this.startX - e.pageX + this.trackerW;
				}
				height = width / this._getRatio();
			} else {
				if(this.handle == 'tl' || this.handle == 'tr') {
					height = this.startY - e.pageY + this.trackerH;
					width = this.startX - e.pageX + this.trackerW;

				} else if(this.handle == 'bl' || this.handle == 'br') {
					height = e.pageY - this.startY + this.trackerH;
					width = e.pageX - this.startX + this.trackerW;
				}

				width = height * this._getRatio();
				if(height > width) {
					width = height * this._getRatio();
				} else if(height < width) {
					height = width / this._getRatio();
				}
			}

			//计算出选区的最大宽和值
			max_h = this._getCropImgCss().height - this.posT;
			max_w = this._getCropImgCss().width - this.posL;
			if(this.handle == 'tl') {
				max_h = this._getCropImgCss().height - this.posB;
				max_w = this._getCropImgCss().width - this.posL;
			} else if(this.handle == 'tm' || this.handle == 'tr') {
				max_h = this._getCropImgCss().height - this.posB;
				max_w = this._getCropImgCss().width - this.posL;
			} else if(this.handle == 'bl' || this.handle == 'lm') {
				max_h = this._getCropImgCss().height - this.posT;
				max_w = this._getCropImgCss().width - this.posR;
			}
			
			//计算出选区的最大宽和值
			if(height > max_h) {
				height = max_h;
				width = height * this._getRatio();
			} else if(height < min_h) {
				height = min_h;
				width = height * this._getRatio();
			}
			if(width > max_w) {
				width = max_w;
				height = max_w / this._getRatio();
			} else if(width < min_w) {
				width = min_w;
				height = min_w / this._getRatio();
			}
			
			left = this.posL;
			top = this.posT;
			if(this.handle == 'tl') {
				left = this.posL + this.trackerW - width;
				top = this.posT + this.trackerH - height;
			} else if(this.handle == 'tm' || this.handle == 'tr') {
				top = this.posT + this.trackerH - height;
			} else if(this.handle == 'bl' || this.handle == 'lm') {
				left = this.posL + this.trackerW - width;
			}

			this.cropTracker.css({
				'width': width,
				'height': height,
				'left': left,
				'top': top,
			});

			this.cropShow.css({
				backgroundPosition: -left + 'px ' + -top + 'px'
			})

			this.updatePreviewUI(left, top);
		},
		updateRedrawUI: function(e) {
			var left=this.startX-this.cropImg.offset().left,
				top=this.startY-this.cropImg.offset().top,
				width=e.pageX-this.startX,
				height=width/this._getRatio();
					
					
					var max_h = this._getCropImgCss().height - top,
						max_w = this._getCropImgCss().width - left;
					
					if(height > max_h) {
						height = max_h;
						width = height * this._getRatio();
					} 
					if(width > max_w) {
						width = max_w;
						height = max_w / this._getRatio(); 
					}
					this.cropHandles.detach();
					this.cropTracker.css({
						display:'block',
						left:left,
						top:top,
						bottom:'initial',
						right:'initial', 
						width:width,
						height:height,
					});
					this.cropShow.css({
						backgroundPosition: -left + 'px ' + -top + 'px'
					});
					this.cropImg.css({
						'opacity':0.6, 
					}); 
					this.updatePreviewUI(left, top);
		},
		updateMoveUI: function(e) {
			var left = e.pageX - this.startX + this.posL,
				top = e.pageY - this.startY + this.posT;
			//选框活动范围
			var maxL = this._getCropImgCss().width - this.cropTracker.width(),
				maxT = this._getCropImgCss().height - this.cropTracker.height();
			
			left = left > 0 ? (left > maxL ? maxL : left) : 0;
			top = top > 0 ? (top > maxT ? maxT : top) : 0;

			this.cropTracker.css({
				'left': left,
				'top': top
			});
			
			this.cropShow.css({
				'background-position': -left + 'px ' + -top + 'px',
			});
			this.updatePreviewUI(left, top);
		},

		mouseMove: function(e) {
			if(this._isMove) {
				this.updateMoveUI(e);
			}
			if(this._isDrag) {
				this.updateStrectUI(e);
			}
			if(this._isRedraw) {
				this.updateRedrawUI(e);
			}
		},
	};
	window['Crop'] = Crop;
})(window.jQuery);