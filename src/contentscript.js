console.log("✅ Content script running");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("📩 Message received at content script:", request);

    if (request.message === "scroll") {
        console.log("⬇️ Scrolling...");
        window.scrollBy(0, 400,{behaviour:"smooth"});
    }

    // ✅ Send a response back to prevent the error
    sendResponse({ status: "✅ Scroll action performed" });

    return true; // ✅ Keeps the message port open for async response
});
