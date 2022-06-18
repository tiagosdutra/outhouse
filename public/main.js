const thumbUp = document.getElementsByClassName("fa-thumbs-up");
const thumbDown = document.getElementsByClassName("fa-thumbs-down");
const trash = document.getElementsByClassName("fa-ban");
const addComment = document.getElementsByClassName('addComment')

Array.from(thumbUp).forEach(function(element) {
      element.addEventListener('click', function(){
        const name = this.parentNode.parentNode.childNodes[1].innerText
        const address = this.parentNode.parentNode.childNodes[3].innerText
        const details = this.parentNode.parentNode.childNodes[5].innerText
        const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[7].innerText)
        fetch('locations', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'name': name,
            'address': address,
            'details': details,
            'thumbUp':thumbUp
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});
Array.from(thumbDown).forEach(function(element) {
      element.addEventListener('click', function(){
        const name = this.parentNode.parentNode.childNodes[1].innerText
        const address = this.parentNode.parentNode.childNodes[3].innerText
        const details = this.parentNode.parentNode.childNodes[5].innerText
        const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[7].innerText)
        fetch('locationsDown', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'name': name,
            'address': address,
            'details': details,
            'thumbUp':thumbUp
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});

Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        const name = this.parentNode.parentNode.childNodes[1].innerText
        const address = this.parentNode.parentNode.childNodes[3].innerText
        const details = this.parentNode.parentNode.childNodes[5].innerText
        const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[7].innerText)
        fetch('locations', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'name': name,
            'address': address,
            'details': details,
            'thumbUp':thumbUp
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});


Array.from(addComment).forEach(function (element) {
  element.addEventListener("click", function () {
    let postId = this.parentNode.querySelector('.objectId').value
    console.log(postId);
    let comments = this.parentNode.querySelector('.commentbox').value
    console.log(comments)
    fetch("comments", {
      method: "put",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({

        postId: postId,
        comments: comments

      }),
    })
      .then((response) => {
        if (response.ok) return response.json();
      })
      .then((data) => {
        console.log(data);
        // window.location.reload(true);
      });
  });
});