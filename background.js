// background.js
chrome.action.onClicked.addListener(tab => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: [
      "libs/html2canvas.min.js",
      "libs/jspdf.umd.min.js",
      "libs/pdfjs/pdf.min.js",     // ← injeta aqui, antes do content.js
      "content.js"
    ]
  });
});
