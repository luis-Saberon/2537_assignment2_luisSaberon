function ajaxPOST(url, callback, data) {

  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
      if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
          //console.log('responseText:' + xhr.responseText);
          callback(this.responseText);

      } else {
          console.log(this.status);
      }
  }
  xhr.open("POST", url);
  // make it clear that our call is an AJAX call
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  // we are sending form data, we must inform the server of this
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(data);
}

document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll('.promote').forEach((button) => {
    button.addEventListener('click', (e) => {
      ajaxPOST('/promote', (data) => {
      }, `name=${button.dataset.name}`)
    })
  })

  document.querySelectorAll('.demote').forEach((button) => {
    button.addEventListener('click', (e) => {
      ajaxPOST('/demote', (data) => {
      }, `name=${button.dataset.name}`)
    })
  })
})