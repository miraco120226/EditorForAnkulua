/*var fs = require('fs')
  , gm = require('gm').subClass({imageMagick: true});

 // gm('/pic_edit/123.jpg')
*/
/*
var picture = document.createElement('img');
picture.src='./pic_edit/123.jpg';
var body=document.getElementById("pic").appendChild(picture);
*/
var pic_orig_path;
var pic_path;
var pic_path2;
var pic_name;
var crop_x=0;
var crop_y=0;
var crop_height=0;
var crop_width=0;
var pic_nature_width
var pic_nature_height
var input_img_max_size=1280;//預設1280x720 or 720x1280
var input_img_other_size;
var pic_size_change=0.5;//縮放倍率
var outside_border=5;
var inside_border=2;

(function (){
  input_img_other_size=input_img_max_size/16*9;
  document.getElementsByClassName("up_crop1")[0].style.width=(input_img_max_size*pic_size_change+inside_border*2)+'px';
  document.getElementsByClassName("up_crop1")[0].style.height=(input_img_max_size*pic_size_change+inside_border*2)+'px';
  document.getElementsByClassName("up_crop1")[0].style.backgroundColor='#ff0000';
  document.getElementsByClassName("up_crop1")[0].style.padding=outside_border+'px';
  document.getElementsByClassName("up_crop2")[0].style.width=(input_img_max_size*pic_size_change)+'px';
  document.getElementsByClassName("up_crop2")[0].style.height=(input_img_max_size*pic_size_change)+'px';
  document.getElementsByClassName("up_crop2")[0].style.backgroundColor='#ffffff';
  document.getElementsByClassName("up_crop2")[0].style.padding=inside_border+'px';

  document.getElementsByClassName("down_crop1")[0].style.padding=outside_border+'px';
  document.getElementsByClassName("down_crop2")[0].style.padding=inside_border+'px';
})();


function setCrop(){
  pic_nature_width=document.getElementById("image").naturalWidth;
  pic_nature_height=document.getElementById("image").naturalHeight;


  document.getElementById("image").style.width=(pic_nature_width*pic_size_change)+'px';
  document.getElementsByClassName("cropped-image")[0].style.backgroundSize=(pic_nature_width*pic_size_change)+'px';
  document.getElementById("cropped-image_css").innerHTML='.cropped-image {background: url('+pic_path2+') no-repeat;background-size:'+(pic_nature_height*pic_size_change)+'px;}';
  document.getElementsByClassName("down_crop1")[0].style.position='absolute';

  if(pic_nature_width==1280){
    document.getElementsByClassName("up_crop1")[0].style.height=(pic_nature_height*pic_size_change+inside_border*2)+'px';
    document.getElementsByClassName("up_crop2")[0].style.height=(pic_nature_height*pic_size_change)+'px';
    document.getElementsByClassName("down_crop1")[0].style.top=(pic_nature_height*pic_size_change+20)+'px';
    document.getElementsByClassName("down_crop1")[0].style.left='0px';
  }
  else if(pic_nature_width==720){
    document.getElementsByClassName("up_crop1")[0].style.width=(pic_nature_width*pic_size_change+inside_border*2)+'px';
    document.getElementsByClassName("up_crop2")[0].style.width=(pic_nature_width*pic_size_change)+'px';
    document.getElementsByClassName("down_crop1")[0].style.top='0px';
    document.getElementsByClassName("down_crop1")[0].style.left=(pic_nature_width*pic_size_change+20)+'px';
  }
  document.getElementsByClassName("down_crop1")[0].style.backgroundColor='#0000ff';
}

function send(){
  parent.window.opener.NewPicInput(parent.document.getElementById("iframe2").contentWindow.txt);
}

function resize(){

    var fs = require('fs')
      , gm = require('gm')
      , path = require('path');

    gm(pic_orig_path)
    .crop(crop_width-2, crop_height-2, crop_x+1, crop_y+1)
    .write(pic_orig_path.substr(0,pic_orig_path.length-pic_name.length)+parent.document.getElementById("iframe2").contentWindow.pic_input_name+'.png', function (err) {
      if (!err) console.log("done");
      else window.alert(err);
    });
}

function startcrop(){

YUI().use(
  'aui-image-cropper',
  function(Y) {
    var imageCropper = new Y.ImageCropper(
      {
        srcNode: '#image',
        x: 100,
        y: 100
      }
    ).render();
    var statusTPL='';
    //var statusTPL = '<strong class="x">x:{x}</strong><strong class="y">y:{y}</strong><strong class="height">height:{height}</strong><strong class="width">width:{width}</strong>';

    var updateImage = function() {
      var cropRegion = imageCropper.get('region');

      cropRegion.height=cropRegion.height-2;
      cropRegion.width=cropRegion.width-2;

      croppedImage.setStyles(
        {
          'backgroundPosition': (-cropRegion.x) + 'px ' + (-cropRegion.y) + 'px',
          height: cropRegion.height,
          width: cropRegion.width
        }
      );

      cropRegion.height=cropRegion.height*2;
      cropRegion.width=cropRegion.width*2;
      cropRegion.x=cropRegion.x*2;
      cropRegion.y=cropRegion.y*2;

      crop_x=cropRegion.x;
      crop_y=cropRegion.y;
      crop_height=cropRegion.height;
      crop_width=cropRegion.width;

      var crop_menu=parent.document.getElementById("iframe2").contentWindow;
      crop_menu.output(crop_menu.pic_input_name);

      document.getElementsByClassName("down_crop1")[0].style.width=(cropRegion.width/2+inside_border*2)+'px';
      document.getElementsByClassName("down_crop2")[0].style.width=(cropRegion.width/2)+'px';
      document.getElementsByClassName("down_crop1")[0].style.height=(cropRegion.height/2+inside_border*2)+'px';
      document.getElementsByClassName("down_crop2")[0].style.height=(cropRegion.height/2)+'px';

      croppedImage.html(Y.Lang.sub(statusTPL, cropRegion));      
    };

    imageCropper.after(
      'crop',
      function(event) {
        updateImage();
      }
    );

    var croppedImage = Y.one('#croppedImage');

    var croppedStatus = Y.one('#croppedStatus');

    croppedImage.show();

    updateImage();
  }
);

}