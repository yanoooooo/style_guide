var Common = require('./common');
var common = new Common();
var ImageUtil = require('./image_util');
var image_util = new ImageUtil();
var ColorUtil = require('./color_util');
var color_util = new ColorUtil();

// データ関係
var pccs_words = common.data.pccs_words;
var styleName = ["mainStyle", "accentStyle", "baseStyle"];

// PCCSトーンのソート
pccs_words.sort(function(a,b){
    if(a.reading < b.reading) return -1;
    if(a.reading > b.reading) return 1;
    return 0;
});

var vue_data = new Vue({
  el: "#main__contents",
  data: {
    pccs_words: pccs_words,
    Area1_baseStyle: {},
    Area1_mainStyle: {},
    Area1_accentStyle: {},
    Area1_word_id: 0,
    Area2_baseStyle: {},
    Area2_mainStyle: {},
    Area2_accentStyle: {},
    Area2_word_id: 0,
    Area3_baseStyle: {},
    Area3_mainStyle: {},
    Area3_accentStyle: {},
    Area3_word_id: 0,
    output_baseStyle: {},
    output_mainStyle: {},
    output_accentStyle: {}
  },
  methods: {
    clickDropArea: function(id) {
      if(vue_data[id+"_word_id"] == 0) {
        alert("最初に単語を選んでください");
        return;
      }
      image_util.target_area = id;
      fileInput.click();
    }
  }
})

// -------- Slide bar
var slider1 = document.getElementById("Area1_slider");
var slider2 = document.getElementById("Area2_slider");
var slider3 = document.getElementById("Area3_slider");

slider1.oninput = function() { slideBarGenerate(this.id);}
slider2.oninput = function() { slideBarGenerate(this.id);}
slider3.oninput = function() { slideBarGenerate(this.id);}

function getExtractColors() {
  var colors = {
    "color1": {
      base: vue_data.Area1_baseStyle["background-color"],
      main: vue_data.Area1_mainStyle["background-color"],
      accent: vue_data.Area1_accentStyle["background-color"],
      slider: slider1.value
    },
    "color2": {
      base: vue_data.Area2_baseStyle["background-color"],
      main: vue_data.Area2_mainStyle["background-color"],
      accent: vue_data.Area2_accentStyle["background-color"],
      slider: slider2.value
    },
    "color3": {
      base: vue_data.Area3_baseStyle["background-color"],
      main: vue_data.Area3_mainStyle["background-color"],
      accent: vue_data.Area3_accentStyle["background-color"],
      slider: slider3.value
    },
  }
  return colors;
}

function slideBarGenerate(slider_id){
  var colors = getExtractColors();
  mixed_colors = color_util.mixedColor(colors);
  vue_data["output_"+styleName[0]] = {
    "background-color": mixed_colors.main
  }
  vue_data["output_"+styleName[1]] = {
    "background-color": mixed_colors.accent
  }
  vue_data["output_"+styleName[2]] = {
    "background-color": mixed_colors.base
  }
}

// -------- 画像関係
document.addEventListener('DOMContentLoaded', function () {
  //https://qiita.com/amamamaou/items/1b51c834d62c8567fad4
  //TODO drop実装する
  // ドロップ要素にドロップされた時
  // dropArea.addEventListener('drop', function (ev) {
  //   ev.preventDefault();
  //
  //   dropArea.classList.remove('dragover');
  //   output.textContent = '';
  //
  //   // ev.dataTransfer.files に複数のファイルのリストが入っている
  //   organizeFiles(ev.dataTransfer.files);
  // });
  // ファイル参照で画像を追加した場合
  fileInput.addEventListener('change', function (ev) {
    // ev.target.files に複数のファイルのリストが入っている
    //TODO promiseに変更する
    image_util.organizeFiles(ev.target.files);
    // 値のリセット
    fileInput.value = '';

    //画像から色を抽出
    var imgs = [];
    var image_ids_arr = image_util.image_ids[image_util.target_area];
    if(!image_ids_arr) {
      image_ids_arr = [];
    }
    for(var i=0; i<image_ids_arr.length; i++) {
      imgs.push({img: image_ids_arr[i]});
    }

    var promise = sleep(0.5, createColor, imgs, vue_data[image_util.target_area+"_word_id"]);
    promise.then(function(result) {
      // console.log(result);
      var styleColor = result;

      vue_data[image_util.target_area+"_"+styleName[0]] = {
        "background-color": styleColor.main,
        "border-color":  styleColor.main
      };
      vue_data[image_util.target_area+"_"+styleName[1]] = {
        "background-color": styleColor.accent,
        "border-color":  styleColor.accent
      };
      vue_data[image_util.target_area+"_"+styleName[2]] = {
        "background-color": styleColor.background,
        "border-color":  styleColor.background
      }

      // 出力する色
      var colors = getExtractColors();
      mixed_colors = color_util.mixedColor(colors);
      vue_data["output_"+styleName[0]] = {
        "background-color": mixed_colors.main
      }
      vue_data["output_"+styleName[1]] = {
        "background-color": mixed_colors.accent
      }
      vue_data["output_"+styleName[2]] = {
        "background-color": mixed_colors.base
      }
    })
  });
});

const createColor = (imgs, word_id) => {
  // var sourceImage = document.getElementById(image_util.target_area).children;
  // console.log(sourceImage);
  var result = color_util.createColor(common.data.pallet_num, imgs, word_id);
  return result;
}

const sleep = (waitSeconds, someFunction, imgs, word_id) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(someFunction(imgs, word_id))
    }, waitSeconds * 1000)
  })
}

// 高さ調整
var board = document.getElementById('moodboard__contents');
window.addEventListener('load', function(){
  var h = window.innerHeight;
  var style = board.style;
  style.minHeight = h + 'px';
}, false);
window.addEventListener('resize', function(){
  var h = window.innerHeight;
  var style = board.style;
  style.minHeight = h + 'px';
}, false);

$(function(){
  　　　function adjust(){
            var h = $(window).height(); //ウィンドウの高さ
            var none = $(window).height(); //ウィンドウの高さ
            $('.drag-drop-area').css('height', h-320); //可変部分の高さを適用
            $('.moodboard__contents--none').css('height', h-150); //可変部分の高さを適用
       }
       adjust();
       $(window).on('resize', function(){
            adjust();
       })
  });
