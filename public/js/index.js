var Common = require('./common');
var common = new Common();
var ImageUtil = require('./image_util');
var image_util = new ImageUtil();

// データ関係
var pccs_words = common.data.pccs_words;

// PCCSトーンのソート
pccs_words.sort(function(a,b){
    if(a.reading < b.reading) return -1;
    if(a.reading > b.reading) return 1;
    return 0;
});

new Vue({
  el: "#main__contents",
  data: {
    pccs_words: pccs_words
  },
  methods: {
    clickDropArea: function(id) {
      image_util.target_area = id;
      fileInput.click();
    }
  }
})

// 画像関係
document.addEventListener('DOMContentLoaded', function () {
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
    image_util.organizeFiles(ev.target.files);
    // 値のリセット
    fileInput.value = '';
  });
});

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
