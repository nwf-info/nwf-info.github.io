let isLocal;

if (window.location.href.includes('https')) {
    isLocal = false;
} else if (window.location.href.includes('http')) {
    isLocal = false;
} else {
    isLocal = true;
}