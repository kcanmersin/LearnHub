console.log("LearnHub YouTube Integration (Word Click Detection) Loaded.");

const SUBTITLE_SELECTOR = '.ytp-caption-segment';

function getWordAtOffset(node, offset) {
    if (!node || node.nodeType !== Node.TEXT_NODE || !node.textContent) {
        return null;
    }
    const text = node.textContent;
    let start = offset;
    let end = offset;
    if (start > 0 && !/\s/.test(text[start])) {
         while (start > 0 && !/\s/.test(text[start - 1])) {
            start--;
        }
    } else {
         while (start > 0 && /\s/.test(text[start - 1])) {
            start--;
         }
          while (start > 0 && !/\s/.test(text[start - 1])) {
             start--;
         }
    }
    while (end < text.length && !/\s/.test(text[end])) {
        end++;
    }
     if (start === end) {
         while (end < text.length && /\s/.test(text[end])) {
             end++;
         }
         start = end;
          while (end < text.length && !/\s/.test(text[end])) {
             end++;
         }
         if(start === end) return null;
     }
    let word = text.substring(start, end);
    word = word.replace(/^[.,!?;:"'()]*/, '').replace(/[.,!?;:"'()]*$/, '');
    return word;
}

function handleSubtitleClick(event) {
    const clickedElement = event.target.closest(SUBTITLE_SELECTOR);
    if (clickedElement) {
        const x = event.clientX;
        const y = event.clientY;
        let clickedWord = null;
        if (document.caretPositionFromPoint) {
            const range = document.caretPositionFromPoint(x, y);
            if (range && range.offsetNode) {
                 clickedWord = getWordAtOffset(range.offsetNode, range.offset);
            }
        } else if (document.caretRangeFromPoint) {
            const range = document.caretRangeFromPoint(x, y);
            if (range && range.startContainer) {
                clickedWord = getWordAtOffset(range.startContainer, range.startOffset);
            }
        }
        console.log("Detected Word:", clickedWord);
        if (clickedWord && clickedWord.length > 0 && clickedWord.length < 1000) {
            if (window.learnhub && typeof window.learnhub.showPopup === 'function') {
                window.learnhub.showPopup(clickedWord, event.pageX, event.pageY);
            } else {
                console.error("LearnHub showPopup function not found on window.");
            }
        }
    }
}

const observer = new MutationObserver((mutationsList, observer) => {
    const playerElement = document.querySelector('#movie_player');
    if (playerElement) {
        console.log("LearnHub: YouTube player found. Adding advanced click listener.");
        document.body.removeEventListener('click', handleSubtitleClick, true);
        document.body.addEventListener('click', handleSubtitleClick, true);
        observer.disconnect();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});