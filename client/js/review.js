//Only for use in product.ejs
//this script is responsible for reading/writing reviews

authenticate(getCookie("remember")).then((valid) => {
    const writeReviewElement = document.querySelector("#write-Review");
    const reviewTitleInput = document.getElementById("review-title-input");
    const reviewContentInput = document.getElementById("review-content-input");
    const publishReviewButton = document.getElementById("publishReviewButton");
    const cancelReviewButton = document.getElementById("cancelReviewButton");

    const reviewContainer = document.getElementById("reviewContainer");

    //remove everything from the url -> "http://localhost:3000/items/3" -> "3"
    const productId = window.location.href.replace(window.location.origin + "/items/", "")

    if (valid) {
        publishReviewButton.onclick = function() {

            fetch("http://" + window.location.host + "/publish-comment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ cookie: getCookie("remember"), title: reviewTitleInput.value.replace(/\\/g, "/"), content: reviewContentInput.value.replace(/\\/g, "/"), productId })
            }).then((res) => {
                if (res.ok) {
                    return res.json();
                }
            }).then((data) => {
                if (data.ok) {
                    addReview(reviewContainer, data.title, data.content, data.username);
                    reviewTitleInput.value = "";
                    reviewContentInput.value = "";
                } else {
                    alert("Failed to post your review. Sorry for the inconvience");
                }
            })
        }
    } else {
        //if not logged in can't review
        writeReviewElement.style.display = "none";
    }

    cancelReviewButton.onclick = function() {
        reviewTitleInput.value = "";
        reviewContentInput.value = "";
    }


    //getting all the comments other people (and if logged in the current user) have posted in the past
    fetch("/get-all-comments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ cookie: getCookie("remember"), productId })
    }).then((res) => {
        if (res.ok) return res.json();
    }).then((data) => {
        if (data.ok) {
            data.data.forEach((review) => {
                addReview(reviewContainer, review.title, review.content, review.username);
            });
        }
    });
})

//helper function to add reviews to the review container
function addReview(parent, title, content, author) {

//    Generates this html
//    <span class="review">
//         <div class="review-title-container">
//             <h3>Title</h3>
//             <p>Posted by username</p>
//         </div>
//         <p>Content</p>
//     </span>

    const review = document.createElement("span");
    review.classList.add("review");

    const reviewTitleContainer = document.createElement("div");
    reviewTitleContainer.classList.add("review-title-container");

    const header = document.createElement("h3");
    header.innerText = title;

    const authorp = document.createElement("p");
    authorp.innerText = author;

    const contentp = document.createElement("p");
    contentp.innerText = "Posted by " + content;

    review.appendChild(reviewTitleContainer);
    reviewTitleContainer.appendChild(header);
    reviewTitleContainer.appendChild(authorp);
    review.appendChild(contentp);

    parent.appendChild(review);
}