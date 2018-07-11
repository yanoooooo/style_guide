function ImageUtil(){
  this.max_file_num = 3;
  this.target_area = "";
  this.image_ids = {};
}

ImageUtil.prototype.organizeFiles = function organizeFiles(files) {
  var output = document.getElementById(this.target_area).getElementsByClassName("drag-drop-inside")[0];
  var img_num = output.getElementsByTagName("img").length;
  var length = files.length;
  var file;

  // error処理
  if(length > this.max_file_num || img_num >= this.max_file_num) {
    alert("画像は3枚まで入力可能です。");
    return;
  }
  // 文言をクリア
  if(img_num == 0) {
    output.textContent = '';
    this.image_ids[this.target_area] = [];
  }
  for(var i=0; i<length; i++){
    file = files[i];
    // 画像のバリデーション
    if(!file || file.type.indexOf('image/') < 0) {
      continue;
    }
    // 画像出力処理へ進む
    this.outputImage(file, output);
  }
}

ImageUtil.prototype.outputImage = function outputImage(blob, output) {
  var image = new Image();
  blobURL = URL.createObjectURL(blob);
  image.src = blobURL;
  image.id = Math.random().toString(36).slice(-8);
  this.image_ids[this.target_area].push(image.id);

  image.addEventListener('load', function () {
    URL.revokeObjectURL(blobURL);
    output.appendChild(image);
  });
}

module.exports = ImageUtil;
