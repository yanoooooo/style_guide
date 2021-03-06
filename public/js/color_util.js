var Common = require('./common');
var common = new Common();

function ColorUtil(){
  this.imgs = [];
};

// ** RGB配列をRGB文字列にする [0, 0, 0] -> "rgb(0, 0, 0)" ** //
function arr2rgb(arr) {
  var str = "rgb(";
  var num = arr.length;
  for(var i=0; i<num; i++) {
    if(i == num-1) {
      str += arr[i] + ")";
    } else {
      str += arr[i] + ",";
    }
  }
  return str;
}

// ** 引数のIDを持つ画像の色をnum個抽出する "id",num -> [[0, 0, 0], [0, 0, 0]] ** //
function extractColorPalette(id, num) {
  var colorThief = new ColorThief();
  var sourceImage = document.getElementById(id);

  return colorThief.getPalette(sourceImage, num);
}

// ** rgb値を円錐型のHSV値に変換する [r, g, b] -> [h, s, v] ** //
function arr2hsv(rgb) {
  var r = rgb[0] / 255;
  var g = rgb[1] / 255;
  var b = rgb[2] / 255;

  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var diff = max - min;
  var h = 0;

  switch(max){
    case min:
      h = 0;
      break;
    case r:
      h = (60 * ((g - b) / diff));
      break;
    case g:
      h = (60 * ((b - r) / diff)) + 120;
      break;
    case b:
      h = (60 * ((r - g) / diff)) + 240;
      break;
    default:
      console.log("arr2hsv error");
      break;
  }
  if(h < 0) {
    h += 360;
  }
  h = parseInt(h);

  var s = diff / max;
  var v = max;

  return [h, s, v];
}

// ** 複数のhsv値を12色にクラスタリングし、指定したclusterの数を返す [[h, s, v],[h, s, v]] -> [{hsv: [h, s, v], num: 1}, {hsv: [], num: 0}] ** //
function hsvClustering(hsvArr, cluster) {
  var clusterArr = [];
  for(var i=0; i<12; i++) {
    var sum_h = 0;
    var sum_s = 0;
    var sum_v = 0;
    var num = 0;
    clusterArr.push({hsv: [], num: 0});
    for(var j=0; j<hsvArr.length; j++) {
      if(parseInt(hsvArr[j][0] / 30) == i) {
        // 無彩色のものは含めない
        if(hsvArr[j][1] > 0.1) {
          sum_h += hsvArr[j][0];
          sum_s += hsvArr[j][1];
          sum_v += hsvArr[j][2];
          num++;
        }
      }
    }
    // 合計値の平均をクラスタの代表色とする
    if(num != 0) {
      clusterArr[i].hsv = [sum_h/num, sum_s/num, sum_v/num];
      clusterArr[i].num = num;
    }
  }

  return clusterArr;
}

// ** クラスタリングされた色からスタイルガイド用の色を決定する
// [{hsv: [h, s, v], num: 1}, {hsv: [], num: 0}] -> {main: [h, s, v], background: []....} **//
function hsv2styleColor(clusterArr, word_id) {
  var pccs_group = common.data.pccs_group;
  var pccs_words = common.data.pccs_words;
  // console.log(word_group_id);
  // console.log(pccs_group);
  var styleColor = {};
  styleColor.main = [];
  styleColor.background = [];
  styleColor.accent = [];
  styleColor.char = [];
  styleColor.link = [];
  var pccs = {}
  var group_id = 0;
  for(index in pccs_words) {
    if(word_id == pccs_words[index]["id"]) {
      group_id = pccs_words[index]["group"];
    }
  }

  for(index in pccs_group) {
    if(group_id == pccs_group[index]["id"]) {
      pccs = pccs_group[index];
    }
  }

  // メインカラーはclusterArrからnumがmaxのものとする
  var main = clusterArr[0];
  var mainIndex = 0;
  // console.log(clusterArr);
  for(var i=1; i<clusterArr.length; i++) {
    if(clusterArr[i].num > main.num) {
      main = clusterArr[i];
      mainIndex = i;
    }
  }
  //ここで、単語によって明度を変更する
  main.hsv[1] = pccs.saturation;
  main.hsv[2] = pccs.value;
  styleColor.main = main.hsv;

  // 一番使われていない色かつメインカラーと隣り合わない色をベースカラーとし、彩度と明度を上げる
  var background = JSON.parse(JSON.stringify(main));
  for(var i=1; i<clusterArr.length; i++) {
    if(clusterArr[i].num < background.num && clusterArr[i].num != 0 && (mainIndex+1 != i || mainIndex-1 != i)) {
      background = JSON.parse(JSON.stringify(clusterArr[i]));
    }
  }
  background.hsv[1] = 0.03;
  background.hsv[2] = 0.95;
  styleColor.background = background.hsv;

  // 抽出した色がメインカラーと反対側に色をもっていれば、それをアクセントカラーとする
  // なければ、補色を計算する
  var complementaryIndex = mainIndex+6;
  if(complementaryIndex >= 12) {
    complementaryIndex -= 12;
  }
  if(clusterArr[complementaryIndex].num != 0) {
    styleColor.accent = clusterArr[complementaryIndex].hsv;
  } else {
    styleColor.accent = JSON.parse(JSON.stringify(styleColor.main));
    styleColor.accent[0] = styleColor.accent[0] + 180;
    if(styleColor.accent[0] > 360) {
      styleColor.accent[0] -= 360;
    }
  }

  // 文字の色はメインカラーの明度を下げたもの
  styleColor.char = JSON.parse(JSON.stringify(styleColor.main));
  styleColor.char[2] = 0.4;

  // リンク色はアクセントカラーの明度を下げたもの
  styleColor.link = JSON.parse(JSON.stringify(styleColor.accent));
  styleColor.link[2] = 0.4;

  return styleColor;
}

// ** 円錐型のhsv値をrgb値に変換する [r, g, b] -> [h, s, v] ** //
function hsv2rgb(hsv) {
  var H = hsv[0];
  var S = hsv[1];
  var V = hsv[2];

  var C = V * S;
  var Hp = H / 60;
  var X = C * (1 - Math.abs(Hp % 2 - 1));

  var R, G, B;
  if (0 <= Hp && Hp < 1) {[R,G,B]=[C,X,0]};
  if (1 <= Hp && Hp < 2) {[R,G,B]=[X,C,0]};
  if (2 <= Hp && Hp < 3) {[R,G,B]=[0,C,X]};
  if (3 <= Hp && Hp < 4) {[R,G,B]=[0,X,C]};
  if (4 <= Hp && Hp < 5) {[R,G,B]=[X,0,C]};
  if (5 <= Hp && Hp < 6) {[R,G,B]=[C,0,X]};

  var m = V - C;
  [R, G, B] = [R+m, G+m, B+m];

  R = Math.floor(R * 255);
  G = Math.floor(G * 255);
  B = Math.floor(B * 255);

  return [R ,G, B];
}

// ** 文字列rgbをarrayに変換 "rgb(r, g, b)" -> [r, g, b] ** //
function rgb2arr(rgb_str) {
  var str = JSON.parse(JSON.stringify(rgb_str));
  str = str.replace("rgb(", "");
  str = str.replace(")", "");
  arr = str.split(",");
  for(index in arr) {
    arr[index] = parseInt(arr[index]);
  }
  return arr;
}

// ** img.idとPCCSトーンを含む配列を投げると、その画像のメイン、アクセント、ベースを返す ** //
ColorUtil.prototype.createColor = function createColor(pallet_num, imgs, word_group_id) {
  var colorThief = new ColorThief();
  var paletteNum = 8;
  var extractColors = {}
  var hsvArr = [];
  for(var i=0; i<imgs.length; i++) {
    var colorArr = extractColorPalette(imgs[i].img, paletteNum);
    var colorPalette = [];
    for(var j=0; j<colorArr.length; j++) {
      // hsvに変換
      var hsv = arr2hsv(colorArr[j]);
      hsvArr.push(hsv);
      colorPalette.push({rgb: arr2rgb(colorArr[j]), hsv: arr2rgb(hsv2rgb(hsv))});
    }
  }

  // クラスタリングした色から、スタイルガイドの色を決定する
  var styleColor = hsv2styleColor(hsvClustering(hsvArr), word_group_id);
  // hsvをrgbに変換
  for(key in styleColor) {
    styleColor[key] = arr2rgb(hsv2rgb(styleColor[key]));
  }

  return styleColor;
};

// ** Sliderの値に応じて、3色をミックスしたrgb値を返す ** //
ColorUtil.prototype.mixedColor = function mixedColor(colors) {
  var result = {
    "base": [0, 0, 0],
    "main": [0, 0, 0],
    "accent": [0, 0, 0]
  };
  var num = 0.0;

  for(index in colors) {
    if(colors[index]["base"]) {
      var key = index;
      var rgb = rgb2arr(colors[key]["base"]);
      var slider_rate = parseFloat(colors[key]["slider"]/100);
      result["base"][0] += rgb[0] * slider_rate;
      result["base"][1] += rgb[1] * slider_rate;
      result["base"][2] += rgb[2] * slider_rate;

      rgb = rgb2arr(colors[key]["main"]);
      result["main"][0] += rgb[0] * slider_rate;
      result["main"][1] += rgb[1] * slider_rate;
      result["main"][2] += rgb[2] * slider_rate;

      color = rgb2arr(colors[key]["accent"]);
      result["accent"][0] += color[0] * slider_rate;
      result["accent"][1] += color[1] * slider_rate;
      result["accent"][2] += color[2] * slider_rate;

      num += slider_rate;
    }
  }
  result["base"] = arr2rgb([parseInt(result["base"][0]/num), parseInt(result["base"][1]/num), parseInt(result["base"][2]/num)]);
  result["main"] = arr2rgb([parseInt(result["main"][0]/num), parseInt(result["main"][1]/num), parseInt(result["main"][2]/num)]);
  result["accent"] = arr2rgb([parseInt(result["accent"][0]/num), parseInt(result["accent"][1]/num), parseInt(result["accent"][2]/num)]);

  return result;
};

module.exports = ColorUtil;

//以下テスト表示用
// window.onload = function(){
//   // 色抽出
//   var colorThief = new ColorThief();
//   var paletteNum = 8;
//   var imgArr = [
//     {img: "image1", div: "#color1", hsv: "#hsv1"},
//     {img: "image2", div: "#color2", hsv: "#hsv2"},
//     {img: "image3", div: "#color3", hsv: "#hsv3"}
//   ];
//   var extractColors = {}
//   var hsvArr = [];
//   for(var i=0; i<imgArr.length; i++) {
//     var colorArr = extractColorPalette(imgArr[i].img, paletteNum);
//     var colorPalette = [];
//     for(var j=0; j<colorArr.length; j++) {
//       // hsvに変換
//       var hsv = arr2hsv(colorArr[j]);
//       // hsv[1] = 0.9;
//       // hsv[2] = 0.9;
//       hsvArr.push(hsv);
//       //console.log(hsv);
//       colorPalette.push({rgb: arr2rgb(colorArr[j]), hsv: arr2rgb(hsv2rgb(hsv))});
//     }
//     //extract color
//     extractColors[imgArr[i].div] = new Vue({
//       el: imgArr[i].div,
//       data: {
//         colors: colorPalette
//       }
//     });
//     //hsv
//     extractColors[imgArr[i].hsv] = new Vue({
//       el: imgArr[i].hsv,
//       data: {
//         colors: colorPalette
//       }
//     });
//   }
//
//   // 複数の画像から抽出した色をクラスタリング
//   var result = hsvClustering(hsvArr);
//   var clusterColors = [];
//   for(var i=0; i<result.length; i++) {
//     if(result[i].num != 0) {
//       clusterColors.push(result[i].hsv);
//     }
//   }
//   for(var i=0; i<clusterColors.length; i++) {
//     clusterColors[i] = {rgb: arr2rgb(hsv2rgb(clusterColors[i]))};
//   }
//   var extract = new Vue({
//     el: "#main__contents",
//     data: {
//       colors: clusterColors
//     }
//   });
//
//   // クラスタリングした色から、スタイルガイドの色を決定する
//   var styleColor = hsv2styleColor(result);
//   var styleResult = new Vue({
//     el: "#result",
//     data: {
//       mainStyle: {
//         "background-color": arr2rgb(hsv2rgb(styleColor.main)),
//         "border-color":  arr2rgb(hsv2rgb(styleColor.main)),
//         "color": "white"
//       },
//       cardStyle: {
//         "border": "solid 5px",
//         "border-color":  arr2rgb(hsv2rgb(styleColor.accent))
//       },
//       bodyStyle: {
//         "background-color": arr2rgb(hsv2rgb(styleColor.background)),
//         "color": arr2rgb(hsv2rgb(styleColor.char)),
//       },
//       linkStyle: {
//         "color": arr2rgb(hsv2rgb(styleColor.link))
//       }
//     }
//   });
//
//   console.log(styleColor);
// };
