let popup = null;
let currentSelection = '';
let notificationTimeout = null;

function showNotification(message) {
    const existingNotification = document.getElementById('learnhub-notification');
    if (existingNotification) {
        clearTimeout(notificationTimeout);
        existingNotification.remove();
    }
    const notification = document.createElement('div');
    notification.id = 'learnhub-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    notification.classList.add('show');
    notificationTimeout = setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 500);
    }, 3000);
}

function createPopup(x, y) {
    closePopup();

    const POPUP_MAX_WIDTH = 400;
    const POPUP_MAX_HEIGHT = 400;
    const margin = 15;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let finalX = x;
    let finalY = y;

    if (x + POPUP_MAX_WIDTH + margin > scrollX + viewportWidth) {
        finalX = scrollX + viewportWidth - POPUP_MAX_WIDTH - margin;
    }
    if (finalX < scrollX + margin) {
        finalX = scrollX + margin;
    }

    if (y + POPUP_MAX_HEIGHT + margin > scrollY + viewportHeight) {
         if (y - POPUP_MAX_HEIGHT - margin > scrollY) {
             finalY = y - POPUP_MAX_HEIGHT - margin;
         } else {
             finalY = scrollY + viewportHeight - POPUP_MAX_HEIGHT - margin;
         }
    }
     if (finalY < scrollY + margin) {
         finalY = scrollY + margin;
     }

    popup = document.createElement('div');
    popup.id = 'learnhub-popup';
    popup.style.position = 'absolute';
    popup.style.left = `${finalX}px`;
    popup.style.top = `${finalY}px`;

    const selectedTextDiv = document.createElement('div');
    selectedTextDiv.id = 'learnhub-selected-text';
    selectedTextDiv.textContent = `Selected: "${currentSelection}"`;
    popup.appendChild(selectedTextDiv);

    const contentDiv = document.createElement('div');
    contentDiv.id = 'learnhub-content';
    contentDiv.textContent = 'Loading...';
    popup.appendChild(contentDiv);

    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'learnhub-button-container';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.id = 'learnhub-close-button';
    closeButton.addEventListener('click', closePopup);
    buttonContainer.appendChild(closeButton);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save & Close';
    saveButton.id = 'learnhub-save-button';
    saveButton.disabled = true;
    buttonContainer.appendChild(saveButton);

    popup.appendChild(buttonContainer);
    document.body.appendChild(popup);

    setTimeout(() => {
        document.addEventListener('click', handleClickOutside, true);
    }, 100);
}

function handleClickOutside(event) {
    if (popup && !popup.contains(event.target) && event.target.id !== 'learnhub-notification') {
        closePopup();
    }
}

function closePopup() {
     if (popup) {
        popup.remove();
        popup = null;
        document.removeEventListener('click', handleClickOutside, true);
    }
}

document.addEventListener('mouseup', (event) => {
    const targetElement = event.target;

    if (targetElement.closest && (targetElement.closest('.ytp-caption-segment') || targetElement.closest('#learnhub-popup') || targetElement.closest('#learnhub-notification'))) {
        return;
    }

    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length > 0 && selectedText.length < 1000) {
        createPopupAndFetch(selectedText, event.pageX, event.pageY);
    } else {
       if (popup && !popup.contains(event.target)) {
            closePopup();
       }
    }
});

function getInputType(text) {
    return text.includes(' ') ? 'sentence' : 'word';
}

async function fetchDefinition(text) {
    const inputType = getInputType(text);
    const apiUrl = 'http://127.0.0.1:8000/lookup';
    const contentDiv = document.getElementById('learnhub-content');
    const saveButton = document.getElementById('learnhub-save-button');

    if (!contentDiv || !saveButton) {
         if (popup) closePopup();
         return;
    }
    saveButton.disabled = true;
    contentDiv.textContent = 'Fetching definition...';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
            body: JSON.stringify({ text: text, input_type: inputType })
        });

        if (!document.getElementById('learnhub-popup')) return;

        if (!response.ok) {
            let errorMsg = `Error: ${response.status}`;
            try { const errorData = await response.json(); errorMsg += ` - ${errorData.detail || 'Unknown error'}`; } catch (e) {}
            throw new Error(errorMsg);
        }
        const data = await response.json();

        const currentContentDiv = document.getElementById('learnhub-content');
        const currentSaveButton = document.getElementById('learnhub-save-button');
        if (!currentContentDiv || !currentSaveButton) return;

        currentContentDiv.innerHTML = `
            <strong>Explanation:</strong><p>${data.explanation.replace(/\n/g, '<br>')}</p>
            <strong>Examples:</strong><ul>${data.examples.map(ex => `<li>${ex}</li>`).join('')}</ul>
            <strong>Usage Contexts:</strong><ul>${data.usage_contexts.map(ctx => `<li>${ctx}</li>`).join('')}</ul>`;

        currentSaveButton.disabled = false;
        const newSaveButton = currentSaveButton.cloneNode(true);
        currentSaveButton.parentNode.replaceChild(newSaveButton, currentSaveButton);
        newSaveButton.addEventListener('click', () => {
            saveDefinition(currentSelection, getInputType(currentSelection), data);
        });

    } catch (error) {
        console.error('LearnHub Error:', error);
        const errorContentDiv = document.getElementById('learnhub-content');
        const errorSaveButton = document.getElementById('learnhub-save-button');
        if (errorContentDiv) { errorContentDiv.textContent = `Could not fetch definition. ${error.message}`; }
        if (errorSaveButton) { errorSaveButton.disabled = true; }
    }
}

async function saveDefinition(text, inputType, llmResponse) {
    const saveButton = document.getElementById('learnhub-save-button');
    const closeButton = document.getElementById('learnhub-close-button');
    if (!saveButton || !closeButton) return;
    saveButton.textContent = 'Saving...';
    saveButton.disabled = true;
    closeButton.disabled = true;
    let tag = 'general';
    try {
        const currentUrl = window.location.href;
        const urlObject = new URL(currentUrl);
         if (urlObject.hostname === 'googleusercontent.com' && urlObject.pathname.startsWith('/youtube.com/')) {
             tag = 'youtube.com';
        } else if (urlObject.hostname) {
            tag = urlObject.hostname.replace(/^www\./, '');
        }
    } catch (e) {
        console.warn("Could not parse current URL for tagging:", e);
        tag = 'general';
    }
    const apiUrl = 'http://127.0.0.1:8000/save-word';
    try {
        const tokenResponse = await chrome.runtime.sendMessage({ action: "getToken" });
        if (chrome.runtime.lastError) { throw new Error(`Messaging error: ${chrome.runtime.lastError.message}`); }
        if (tokenResponse.error) { throw new Error(`Could not retrieve token: ${tokenResponse.error}`); }
        const token = tokenResponse.token;
        if (!token) { throw new Error("Not logged in. Please log in via the extension icon."); }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', 'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                text: text, input_type: inputType,
                explanation: llmResponse.explanation, examples: llmResponse.examples,
                usage_contexts: llmResponse.usage_contexts, tag: tag
            })
        });
        if (!response.ok) {
            let errorMsg = `Save Error: ${response.status}`;
            try { const errorData = await response.json(); errorMsg += ` - ${errorData.detail || 'Unknown error'}`; if (response.status === 401) { errorMsg += " (Maybe token expired?)" } } catch (e) {}
            throw new Error(errorMsg);
        }
        const result = await response.json();
        console.log('LearnHub Save Result:', result);
        showNotification(`Saved "${text}" (Tag: ${tag})`);
        closePopup();
    } catch (error) {
        console.error('LearnHub Save Error:', error);
        showNotification(`Error saving: ${error.message}`);
        const finalSaveButton = document.getElementById('learnhub-save-button');
        const finalCloseButton = document.getElementById('learnhub-close-button');
        if (finalSaveButton) {
            finalSaveButton.textContent = 'Save & Close';
            finalSaveButton.disabled = false;
        }
        if (finalCloseButton) {
            finalCloseButton.disabled = false;
        }
    }
}

function createPopupAndFetch(text, x, y) {
    currentSelection = text;
    createPopup(x, y);
    fetchDefinition(text);
}

window.learnhub = {
    showPopup: createPopupAndFetch,
    closePopup: closePopup
};