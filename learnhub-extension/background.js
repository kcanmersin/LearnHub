// background.js

// Content script'ten gelen mesajları dinle
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Eğer mesajın eylemi "getToken" ise
    if (message.action === "getToken") {
        // chrome.storage.local'dan token'ı al
        chrome.storage.local.get(['learnhub_token'], (result) => {
            // Hata kontrolü
            if (chrome.runtime.lastError) {
                console.error("Arka planda token alınırken hata:", chrome.runtime.lastError);
                // Hata varsa content script'e hata mesajı gönder
                sendResponse({ error: chrome.runtime.lastError.message });
            } else {
                // Token bulunduysa content script'e gönder
                sendResponse({ token: result.learnhub_token });
            }
        });
        // sendResponse'un asenkron olarak çağrılacağını belirtir
        return true;
    }
    // İleride başka mesaj türleri eklenirse buraya eklenebilir
});

// Service worker başladığında konsola log yaz (opsiyonel)
try {
    console.log("LearnHub Service Worker Başlatıldı.");
} catch (e) {
    // Bu bazen hata verebilir, görmezden gel
}