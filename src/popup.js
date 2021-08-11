document.addEventListener(
  "DOMContentLoaded",
  () => {
    var checkPageButton = document.getElementById("url");
    checkPageButton.addEventListener(
      "change",
      (e) => {
        console.log(e);
        chrome.storage.local.set({ url: e.target.value });
      },
      false
    );
  },
  false
);
