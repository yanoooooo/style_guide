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

  // 画像あげたい
  $(function() {
    $(".drag-drop-area").on({
        "dragenter dragover":function(e){
        e.preventDefault();
        },
        "drop":function(e){
        var file = e.originalEvent.dataTransfer.files[0];
        var fr1 = new FileReader();
        fr1.onload = function(e) {
            var blob=new Blob([e.target.result],{"type":file.type});
            var fr2 = new FileReader();
            fr2.onload = function(e) {
            var src=e.target.result;
            src=new Uint8Array(src);
            src=String.fromCharCode.apply("",src);
            src=btoa(src);
            src="data:"+file.type+";base64,"+src;
            $("<img>").attr({"src":src,"alt":file.name}).appendTo('.drag-drop-inside');
            }
            fr2.readAsArrayBuffer(blob);
        }
        fr1.readAsArrayBuffer(file);
        e.preventDefault();
        },
    });
});