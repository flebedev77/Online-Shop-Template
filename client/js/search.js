//search script
const searchBar = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

searchButton.onclick = function () {
    search();
}
window.onkeydown = function (e) {
    if (e.key == "Enter") {
        search();
    }
}
function search() {
    window.location.href = window.location.origin + "/search/" + searchBar.value.replaceAll('"', "").replaceAll("'", "").replaceAll("-", "").replaceAll(" ", "_");
}