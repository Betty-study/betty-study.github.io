;(function($) {
  'use strict';
  var Carcousel=function(object){
    var self=this;
    //保存单个旋转木马对象
    this.wrapper=object;
    this.container=this.wrapper.find('.c');
    this.slideItems=this.container.find('.p');
    this.prevBtn=this.wrapper.find('.prev-btn');
    this.nextBtn=this.wrapper.find('.next-btn');
    this.flag=true;


    //配置默认参数
    this.options={
      'width':600,
      'height':100,
      'focueWidth':200,
      'focueHeight':100,
      'gScale':0.9,
      'speed':'1s',
      'verticalAlign':'middle',
      'autoPlay':true,
    };

    $.extend(this.options,this.getOptions());

    //初始化UI
    this.setCarcouselPos();

    //左旋转
    this.prevBtn.click(function(){
      if(self.flag){
        self.flag=false;
        self.carcousel('prev');
      }
    });

    //右旋转
    this.nextBtn.click(function(){
      if(self.flag){
        self.flag=false;
        self.carcousel('next');
      }
    })

  };

  Carcousel.prototype={
    _getItemCounts:function(){
      return this.slideItems.length;
    },
    _getTopValue:function(height){
      var top=(this.options.height-height)/2, 
          verticalAlign=this.options.verticalAlign;
      if(verticalAlign=='top'){
        top=0;
      } else if(verticalAlign=='bottom'){
        top=this.options.height-height;
      }
      return top;
    },
    setBtnsPos:function(){
      var bw=(this.options.width-this.options.focueWidth)/2, 
          bh=this.options.height,
          zIndex=Math.ceil(this._getItemCounts()/2);
          console.log(zIndex);
      this.prevBtn.css({
        'left':0,
        'width':bw,
        'height':bh,
        'z-index':zIndex
      });
      this.nextBtn.css({
        'right':0,
        'width':bw,
        'height':bh,
        'z-index':zIndex
      });
    },
    setSlidePos:function(obj,i){
      var self=this;
      var level=Math.floor(this._getItemCounts()/2),
          g_gap=(this.options.width-this.options.focueWidth)/2,
          gap=g_gap/level,
          midIndex=level;

      var scale=Math.pow(this.options.gScale,Math.abs(i-(this._getItemCounts()-1)/2)); //分布在左右两边每一帧的缩放值

      var w=this.options.focueWidth*scale,
          h=this.options.focueHeight*scale,
          offset_x=gap*i,
          offset_y=this._getTopValue(h),
          zIndex=i;

      if(i>midIndex){ //
          offset_x= this.options.width - gap*(this._getItemCounts()-1-i) - w;
          zIndex=(this._getItemCounts()-1-i);
      } 

      var cssPropertyAnimation = {
            'width': w,
            'height': h,
            'transform':'translate('+offset_x+'px'+','+offset_y+'px'+')',
          };
      var cssProperty = {
            'z-index': zIndex
          };

      if(i!=midIndex){
        $.extend(cssPropertyAnimation,cssProperty);
      }

      var transition=(function(){
        var prop=[], dura=[];

        for(var i in cssPropertyAnimation){
          prop.push(i);
          dura.push(self.options.speed);
        }

        return [prop,dura];
      })();

      obj.css($.extend(cssProperty,cssPropertyAnimation,{'transition-property':transition[0]},{'transition-duration':transition[1]}));
    },
    //初始化 UI 
    setCarcouselPos:function(){
      var self=this;
      this.wrapper.css({
        'width':self.options.width,
        'height':self.options.height
      });
      this.setBtnsPos();
      this.slideItems.each(function(i){
        $(this).data('index',i); //给相应的位置加上data index 值，让旋转切换只跟data index的位置有关
        self.setSlidePos($(this),i);
      })
    },

    //旋转
    carcousel:function(dir){
      var self=this;
      this.slideItems.each(function(){
        var idx=$(this).data('index');
        if(dir=='next'){//右旋转
          idx++; 
          if(idx>self._getItemCounts()-1){
            idx=0;
          }
        } else if(dir=='prev'){//左旋转
          if(idx==0){ 
            idx=self._getItemCounts()-1;
          } else {
            idx--;
          }
        }
        $(this).data('index',idx);
        self.setSlidePos($(this),idx);
      })

      setTimeout(function(){self.flag=true},parseInt(self.options.speed)*1000);
    },

    getOptions:function(){
      var setting=this.wrapper.data('setting');
      return setting && setting!=''? setting: {};
    }
  };

  Carcousel.init=function(objects){
    var _this_=this;
    objects.each(function(){
      new _this_($(this)); 
    })
  }
  window['Carcousel']=Carcousel;

})(window.jQuery);