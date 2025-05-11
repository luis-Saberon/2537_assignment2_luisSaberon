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

document.addEventListener('DOMContentLoaded', () => {
  ajaxGET('/userInfo', (data) => {
    document.getElementById('name').innerHTML = data;
  })
});