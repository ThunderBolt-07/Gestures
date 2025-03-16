const button=document.getElementById("permission")
button.addEventListener("click", async () => {
    console.log("creating doc")
    chrome.runtime.sendMessage({message:"cos"})
});

