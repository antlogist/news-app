/**
 * @file
 * @author Anthony Podlesnyy
 * @see <a href="https://podlesnyy.ru/" target="_blank">podlesnyy.ru</a>
 * @description News application allows users an opportunity to search for news. Users can select countries and news categories. 
 * The country and the category are not included in the search if users search for news by the text. 
 * Please, register and get your API key on https://newsapi.org/
 */

/* =============HTTP============= */

/** 
 * @namespace http 
 * @description XML Http request to the server.
 */
const http = () => {
    return {
        /**
         * @function get
         * @async
         * @description XML Http get request to the server.
         * @param {string} url - Api url.
         * @param {httpCallback} callback - The callback function. See {@link httpCall~httpCallback}.
         * @returns {object} - Server response.
         * @throws Will throw an error if the wrong URL or API key.
         * @memberof http
         * @inner
         * @example 
         * http().get("5d7eda5042ce4dcaaf0ae", httpCallback);
         */
        get(url, cb) {
            try {
                // xhr Object
                const xhr = new XMLHttpRequest();
                // xhr open
                xhr.open("GET", url);
                // xhr load
                xhr.addEventListener("load", () => {
                    // if error
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code ${xhr.status}`, xhr);
                        return;
                    }
                    // parse
                    const response = JSON.parse(xhr.responseText);
                    let res = response;
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
};

/* =============HTTP CALL============= */

/** 
 * @namespace httpCall 
 * @description Call the {@link http} request.
 */
const httpCall = {
    /**
     * @description Api key.
     * @constant {string}
     * @inner
     * @memberof httpCall
     */
    apiKey: "",

    /**
     * @description Api url.
     * @constant {string}
     * @inner
     * @memberof httpCall
     */
    apiUrl: "https://news-api-v2.herokuapp.com",

    /**
     * @function getTopHeadlines 
     * @description Pass callback into http. Get top news for a choosen country. Start preloading. See {@link http~get} and {@link httpCall~httpCallback}.
     * @param {string} [country = "ru"] country - Search by country.
     * @param {string} [category = "technology"] - Search by category.
     * @returns {object} - Object of arrays.
     * @inner
     * @memberof httpCall
     * @example
     * httpCall.getTopHeadlines("ru", "technology");
     */
    getTopHeadlines: function (country = "ru", category = "technology") {
        preloader.showPreloader();
        http().get(
            `${this.apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${this.apiKey}`,
            this.httpCallback
        );
    },

    /**
     * @function getEverything
     * @description Pass callback into the http request. Get the news with a query. Start preloading. See {@link http~get} and {@link httpCall~httpCallback}.
     * @param {string} query - Search query.
     * @returns {object} - Object of arrays.
     * @inner
     * @memberof httpCall
     * @example
     * httpCall.getEverything("Nur-Sultan");
     */
    getEverything: function (query) {
        // Show preloader
        preloader.showPreloader();
        http().get(
            `${this.apiUrl}/everything?q=${query}&apiKey=${this.apiKey}`,
            this.httpCallback
        );
    },

    /**
     * @function httpCallback
     * @description Callback function passed into the {@link http~get}. If errors this function shows toast alert. 
     * @param {object} err - Error object.
     * @param {object} res - Response object.
     * @returns {object}
     * @inner
     * @memberof httpCall
     * @example
     * http().get("5d7eda5042ce4dcaaf0ae", httpCallback);
     */
    httpCallback: function(err, res) {
        // If error
        if (err) {
            // Remove preloader
            preloader.removePreloader();
            // Enable search button
            render.searchButton.disabled = false;
            M.toast({ html: `${err}` });
            return;
        }
        // If no articles
        if (!res.articles.length) {
            // Remove preloader
            preloader.removePreloader();
            // Enable search button
            render.searchButton.disabled = false;
            M.toast({ html: "No news :(" });
            return;
        }
        // Clear content if articles
        if (newsContent.children.length) {
            render.clearContent();
        }
        // Render articles
        render.renderContent(res.articles);
    }
};

/* =============RENDER============= */

/** 
 * @namespace render 
 * @description DOM elements manipulation.
 */
const render = {

    /**
     * @description DOM element. News content div element.
     * @constant {HTMLDivElement}
     * @inner
     * @memberof render
     * @example
     * render.newsContent;
     */
    newsContent: document.getElementById("newsContent"),

    /**
     * @description DOM element. Search news form element.
     * @constant {HTMLFormElement}
     * @inner
     * @memberof render
     * @example
     * render.searchForm;
     */
    searchForm: document.forms["searchForm"],

    /**
     * @description DOM element. Select country element.
     * @constant {HTMLSelectElement}
     * @inner
     * @memberof render
     * @example
     * render.searchCountry;
     */
    searchCountry: searchForm.elements["searchCountry"],

    /**
     * @description DOM element. Select category element.
     * @constant {HTMLSelectElement}
     * @inner
     * @memberof render
     * @example
     * render.searchCategory;
     */
    searchCategory: searchForm.elements["searchCategory"],

    /**
     * @description DOM element. Search text input element.
     * @constant {HTMLInputElement}
     * @inner
     * @memberof render
     * @example
     * render.searchText;
     */
    searchText: searchForm.elements["searchText"],

    /**
     * @description DOM element. Action button element.
     * @constant {HTMLButtonElement}
     * @inner
     * @memberof render
     * @example
     * render.searchButton;
     */
    searchButton: searchForm.elements["action"],

    /**
     * @function clearContent
     * @description Content clearing.
     * @returns {void}
     * @inner
     * @memberof render
     * @example
     * render.clearContent();
     */
    clearContent: function() {
        newsContent.innerHTML = "";
    },

    /**
     * @function renderContent
     * @description Content rendering. See {@link render~template}
     * @param {Array} arr - News array.
     * @returns {HTMLDivElement} - Div element.
     * @inner
     * @memberof render
     * @example
     * render.renderContent(res.articles);
     */
    renderContent: function(arr) {
        let fragment = "";
        arr.map((item, index, arr) => {
            const el = this.template(item, index, arr.length);
            fragment += el;
        });
        newsContent.insertAdjacentHTML("afterbegin", fragment);

        // Remove preloader
        preloader.removePreloader();
    },

    /**
     * @function template
     * @description Template creation with masonry css. See {@link render~renderContent}
     * @param {Object} item - Article object
     * @param {string} item.urlToImage - Image url.
     * @param {string} item.title - Article title.
     * @param {string} item.url - Article url.
     * @param {string} item.description - Article description.
     * @param {number} index - Article index.
     * @param {number} length - Array length.
     * @returns {string} - Dom element template.
     * @inner
     * @memberof render
     * @example
     * render.template({
     *  title: "Warriors win back to back to start Okanagan Cup - AM 1150 (iHeartRadio)",
     *  description: "Vipers goaltender Roan Clarke stopped 17 shots.",
     *  url: "https://www.iheartradio.ca/am-1150/news/warriors-win-back-to-back-to-start-okanagan-cup-1.13594433",
     *  urlToImage: "http://www.iheartradio.ca/image/policy:1.13594453:1601229394/okanagancup.jpg?a=16%3A9&w=1000&$p$a$w=6706b33"
     * }, 1, 20);
     */
    template: function({ urlToImage, title, url, description }, index, length) {
        const dummyImageUrl = "https://via.placeholder.com/450x337";
        return `<div class="col s12 m6">
                  <div class="card">
                    <div class="card-image">
                      <img src="${urlToImage || dummyImageUrl}">
                    </div>
                    <div class="card-content">
                    <span class="card-title">${title}</span>
                      <p>${description}</p>
                    </div>
                    <div class="card-action">
                      <a href="${url}">This is a link</a>
                    </div>
                  </div>
                </div>`;
    },
    /**
     * @function anotherTemplate
     * @description Another version template creation. See {@link render~renderContent}
     * @param {Object} item - Article object
     * @param {string} item.urlToImage - Image url.
     * @param {string} item.title - Article title.
     * @param {string} item.url - Article url.
     * @param {string} item.description - Article description.
     * @param {number} index - Article index.
     * @param {number} length - Array length.
     * @returns {string} - Dom element template.
     * @inner
     * @memberof render
     * @example
     * render.anotherTemplate({
     *  title: "Warriors win back to back to start Okanagan Cup - AM 1150 (iHeartRadio)",
     *  description: "Vipers goaltender Roan Clarke stopped 17 shots.",
     *  url: "https://www.iheartradio.ca/am-1150/news/warriors-win-back-to-back-to-start-okanagan-cup-1.13594433",
     *  urlToImage: "http://www.iheartradio.ca/image/policy:1.13594453:1601229394/okanagancup.jpg?a=16%3A9&w=1000&$p$a$w=6706b33"
     * }, 1, 20);
     */
    anotherTemplate: function({ urlToImage, title, url, description }, index, length) {
        const dummyImageUrl = "https://via.placeholder.com/450x337";
        const rowOpen = '<div class="row">';
        const rowClose = "</div>";
        return `${!(index % 2) ? rowOpen : ""}<div class="col s12 m6">
                  <div class="card">
                    <div class="card-image">
                      <img src="${urlToImage || dummyImageUrl}">
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
};

/* =============PRELOADER============= */

/** 
 * @namespace preloader 
 * @description Render and remove preloader. 
 */
const preloader = {

    /**
     * @function showPreloader
     * @description Preloader rendering and search button disabling. See {@link httpCall~getTopHeadlines} and {@link httpCall~getEverything}
     * @returns {HTMLDivElement}
     * @inner
     * @memberof preloader
     * @example
     * preloader.showPreloader();
     */
    showPreloader: function() {
        // disable search button
        render.searchButton.disabled = true;
        document.body.insertAdjacentHTML(
            "afterbegin",
            "<div class='progress'><div class='indeterminate'></div></div>"
        );
    },


    /**
     * @function removePreloader
     * @description Preloader removeing and search button enabling. See {@link httpCall~getTopHeadlines} and {@link httpCall~getEverything}
     * @returns {void}
     * @inner
     * @memberof preloader
     * @example
     * preloader.removePreloader();
     */
    removePreloader: function() {
        render.searchButton.disabled = false;
        const preloaderEl = document.querySelector(".progress");
        if (preloaderEl) {
            preloaderEl.remove();
        }
    }
};

/* =============EVENTS============= */

/** 
 * @namespace events
 * @description Event listeners and event methods.
 */
const events = {
    /**
     * @function onFormSubmit
     * @description Call the http request after form submitting.
     * @param {Event} e - Form submit event. See {@link listeners}
     * @returns {object} - Object of arrays.
     * @memberof events
     * @inner
     * @example
     * searchForm.addEventListener("submit", events.onFormSubmit);
     */
    onFormSubmit: function (e) {
        e.preventDefault();
        const selectCountry = render.searchCountry.value;
        const selectCategory = render.searchCategory.value;
        const searchVal = render.searchText.value;
        if (!searchVal) {
            httpCall.getTopHeadlines(selectCountry, selectCategory);
        } else {
            httpCall.getEverything(searchVal);
        }
    },
    /**
     * @function onDomLoad
     * @description Call the http request {@link httpCall~getTopHeadlines} after DOM loaded.
     * @param {Event} e - DOM loaded event. See {@link listeners}
     * @returns {object} - Object of arrays.
     * @memberof events
     * @inner
     * @example
     * addEventListener("DOMContentLoaded", events.onDomLoad);
     */
    onDomLoad: function () {
        M.AutoInit();
        httpCall.getTopHeadlines();
    }
};

(function () {
    /** 
     * @event DOMContentLoaded 
     * @description Loaded DOM is a target event. See {@link events~onDomLoad}.
     * @memberof events
     * @inner
    */
    addEventListener("DOMContentLoaded", events.onDomLoad);

    /** 
     * @event searchFormSubmit 
     * @description Search form submit is a target of event. See {@link events~onFormSubmit}.
     * @memberof events
     * @inner
    */
    searchForm.addEventListener("submit", events.onFormSubmit);
})();
