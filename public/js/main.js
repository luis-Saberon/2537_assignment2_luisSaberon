function ajaxGET(url, callback) {

  const xhr = new XMLHttpRequest();
  xhr.onload = function() {
      if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
          callback(this.responseText);
      } else {
          console.log(this.status);
      }
  }
  xhr.open("GET", url);
  xhr.send();
}


document.addEventListener("DOMContentLoaded", () => {
  const rand = Math.ceil(Math.random() * 4);
  document.getElementById("imageContainer").innerHTML = `<img src=/images/hyrax${rand}.jpg style='width:250px;'>`;

  ajaxGET('/userInfo', (data) => {
    document.getElementById("name").innerHTML = data;
  });
});