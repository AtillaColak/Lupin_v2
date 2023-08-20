function scrapePage() {
    // Here you can access the DOM and scrape data
    var title = document.title;
    var bodyText = document.body.innerText;

    return {
        title,
        bodyText
    };
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'scrape' && typeof sendResponse === 'function') {
        sendResponse(scrapePage());
    }
});
