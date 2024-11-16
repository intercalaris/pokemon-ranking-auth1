const thumbUp = document.querySelectorAll(".fa-thumbs-up");
const thumbDown = document.querySelectorAll(".fa-thumbs-down");
const trash = document.querySelectorAll(".fa-trash-o");

thumbUp.forEach((element) => {
  element.addEventListener("click", function () {
    const id = this.getAttribute("data-id");
    fetch(`/items/${id}/thumbUp?_method=PUT`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (response.ok) return response.json();
      })
      .then((data) => {
        console.log(data);
        window.location.reload(true);
      })
      .catch((err) => console.error(err));
  });
});

thumbDown.forEach((element) => {
  element.addEventListener("click", function () {
    const id = this.getAttribute("data-id");
    fetch(`/items/${id}/thumbDown?_method=PUT`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (response.ok) return response.json();
      })
      .then((data) => {
        console.log(data);
        window.location.reload(true);
      })
      .catch((err) => console.error(err));
  });
});

trash.forEach((element) => {
  element.addEventListener("click", function () {
    const id = this.getAttribute("data-id");
    fetch(`/items/${id}?_method=DELETE`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (response.ok) {
          window.location.reload(true);
        }
      })
      .catch((err) => console.error(err));
  });
});
