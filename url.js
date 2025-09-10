document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('url-input');
    const shortenBtn = document.getElementById('shorten-btn');
    const resultDiv = document.getElementById('result');
    
    shortenBtn.addEventListener('click', function() {
        const originalUrl = urlInput.value.trim();
        
        if (!isValidUrl(originalUrl)) {
            showResult('Please enter a valid URL (including http:// or https://)', 'error');
            return;
        }
        
        // Generate a short code
        const shortCode = generateShortCode();
        const shortUrl = `${window.location.origin}${window.location.pathname}#${shortCode}`;
        
        // Save to localStorage
        saveUrl(shortCode, originalUrl);
        
        // Show result
        showResult(`
            <div class="short-url">Short URL: <a href="${shortUrl}" target="_blank">${shortUrl}</a></div>
            <button class="copy-btn" data-url="${shortUrl}">Copy to Clipboard</button>
        `, 'success');
        
        // Clear input
        urlInput.value = '';
    });
    
    // Handle URL redirection if a hash is present
    if (window.location.hash) {
        const shortCode = window.location.hash.substring(1);
        const originalUrl = getOriginalUrl(shortCode);
        
        if (originalUrl) {
            window.location.href = originalUrl;
        } else {
            document.body.innerHTML = `
                <div class="container">
                    <h1>URL Not Found</h1>
                    <p>The shortened URL you're trying to access doesn't exist.</p>
                    <a href="${window.location.origin}${window.location.pathname}">Create a new short URL</a>
                </div>
            `;
        }
    }
    
    // Copy to clipboard functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('copy-btn')) {
            const url = e.target.getAttribute('data-url');
            copyToClipboard(url);
            e.target.textContent = 'Copied!';
            setTimeout(() => {
                e.target.textContent = 'Copy to Clipboard';
            }, 2000);
        }
    });
    
    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    function generateShortCode() {
        return Math.random().toString(36).substring(2, 8);
    }
    
    function saveUrl(shortCode, originalUrl) {
        const urls = getStoredUrls();
        urls[shortCode] = originalUrl;
        localStorage.setItem('shortenedUrls', JSON.stringify(urls));
    }
    
    function getOriginalUrl(shortCode) {
        const urls = getStoredUrls();
        return urls[shortCode];
    }
    
    function getStoredUrls() {
        return JSON.parse(localStorage.getItem('shortenedUrls') || '{}');
    }
    
    function showResult(message, type) {
        resultDiv.className = 'result ' + type;
        resultDiv.innerHTML = message;
    }
    
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
});