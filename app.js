/**
 * API key
 * @type {string}
 */
const apiKey = "";
/**
 * API url
 * @type {string}
 */
const apiUrl = "https://news-api-v2.herokuapp.com";
/**
 * News content
 * @type {HTMLDivElement}
 */
const newsContent = document.getElementById("newsContent");
/**
 * Search news form
 * @type {HTMLDivElement}
 */
const searchForm = document.forms["searchForm"];
/**
 * Search country form select
 * @type {HTMLDivElement}
 */
const searchCountry = searchForm.elements["searchCountry"];
/**
 * Search text form input
 * @type {HTMLDivElement}
 */
const searchText = searchForm.elements["searchText"];

// xhr GET function
function http() {
    return {
        get(url, cb) {
            try {
                // xhr object
                const xhr = new XMLHttpRequest();
                // xhr open
                xhr.open("GET", url);
                // xhr load
                xhr.addEventListener("load", () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code ${xhr.status}`, xhr);
                        return;
                    }
                    // parse
                    const response = JSON.parse(xhr.responseText);
                    res = response;
                    // callback
                    cb(null, res);
                });
                // xhr error
                xhr.addEventListener("error", () => {
                    console.log("error");
                });
                // xhr send
                xhr.send();
            } catch (error) {
                console.log(error);
            }
        }
    };
}

// Server Request
function getHttpRequest() {
    showPreloader();
    return {
        getTopHeadlines(country = "ru", cb) {
            http().get(
                `${apiUrl}/top-headlines?country=${country}&apiKey=${apiKey}`,
                load
            );
        },
        getEverything(query = "Nur-Sultan", cb) {
            http().get(
                `${apiUrl}/everything?q=${query}&apiKey=${apiKey}`,
                load
            );
        }
    };
}

// Get news
function load(err, res) {
    if (err) {
        M.toast({ html: `${err}` });
        return;
    }
    if (!res.articles.length) {
        M.toast({ html: "No news :(" });
        return;
    }
    if (newsContent.children.length) {
        clearContainer();
    }
    render(res.articles);
}

function clearContainer() {
    newsContent.innerHTML = "";
}

// Render
function render(arr) {
    removePreloader();
    let fragment = "";
    arr.map((item, index, arr) => {
        const el = template(item, index, arr.length);
        fragment += el;
    });

    newsContent.insertAdjacentHTML("afterbegin", fragment);
}

// Template
function template({ urlToImage, title, url, description }, index, length) {
    const rowOpen = '<div class="row">';
    const rowClose = "</div>";

    return `${!(index % 2) ? rowOpen : ""}<div class="col s12 m6">
              <div class="card">
                <div class="card-image">
                  <img src="${urlToImage || ""}">
                </div>
                <div class="card-content">
                <span class="card-title">${title}</span>
                  <p>${description}</p>
                </div>
                <div class="card-action">
                  <a href="${url}">This is a link</a>
                </div>
              </div>
            </div>${index % 2 || +index === +length - 1 ? rowClose : ""}`;
}

// Form submit
searchForm.addEventListener("submit", e => {
    e.preventDefault();
    const selectVal = searchCountry.value;
    const searchVal = searchText.value;
    if (!searchVal) {
        console.log(searchVal);
        getHttpRequest().getTopHeadlines(selectVal);
    } else {
        console.log(selectVal);
        getHttpRequest().getEverything(searchVal);
    }
});

// Show preloader
function showPreloader() {
    document.body.insertAdjacentHTML(
        "afterbegin",
        "<div class='progress'><div class='indeterminate'></div></div>"
    );
}

// Remove preloader
function removePreloader() {
    const preloader = document.querySelector(".progress");
    if (preloader) {
        preloader.remove();
    }
}

// News init
addEventListener("DOMContentLoaded", function() {
    M.AutoInit();
    getHttpRequest().getEverything();
});
