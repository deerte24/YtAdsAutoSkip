console.log("content script autoskip aktif di:", location.href);

const SKIP_SELECTORS = [
    ".ytp-skip-ad-button",
    ".ytp-ad-skip-button",
    ".ytp-ad-skip-button-modern",
    ".ytp-ad-skip-button-container button",
    "button[class*='skip-ad']",
    "button[class*='ad-skip']",
];

function isVisible(el) {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0"
    );
}

function findSkipButton() {
    for (const sel of SKIP_SELECTORS) {
        for (const el of document.querySelectorAll(sel)) {
            if (isVisible(el)) return el;
        }
    }
    return null;
}

function realClick(el) {
    const rect = el.getBoundingClientRect();
    const opts = {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        button: 0,
    };
    ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach(
        (type) => {
            const Ev = type.startsWith("pointer") ? PointerEvent : MouseEvent;
            el.dispatchEvent(new Ev(type, opts));
        }
    );
}

function isAdShowing() {
    return !!document.querySelector(".html5-video-player.ad-showing");
}

let lastClick = 0;

function trySkip() {
    if (!isAdShowing()) return;

    const btn = findSkipButton();
    if (!btn) return;

    if (Date.now() - lastClick < 100) return;
    lastClick = Date.now();

    console.log(
        "[Auto Skip] Mencoba klik:",
        btn.className,
        "| teks:",
        (btn.innerText || btn.getAttribute("aria-label") || "").trim()
    );

    realClick(btn);
    btn.click();

    setTimeout(() => {
        const video = document.querySelector("video.html5-main-video");
        if (isAdShowing() && video && isFinite(video.duration)) {
            console.log("Klik tidak berhasil, lompat ke akhir iklan");
            video.currentTime = video.duration;
        }
    }, 400);
}

setInterval(trySkip, 500);