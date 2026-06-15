/**
 * Utility functions for parsing questions and shuffling options.
 */

export function extractQuestionAndOptions(fullText) {
    if (!fullText) return { description: '', options: [] };
    const lines = fullText.split('\n');
    let questionDesc = '';
    const options = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        if (/^[A-Z]\s*[\.\-\)]\s*/i.test(trimmed)) {
            const match = trimmed.match(/^([A-Z])\s*[\.\-\)]\s*(.*)/i);
            if (match) {
                options.push({
                    letter: match[1].toUpperCase(),
                    text: match[2].trim()
                });
            }
        } else {
            if (options.length === 0) {
                if (questionDesc) questionDesc += '\n';
                questionDesc += trimmed;
            }
        }
    });

    return {
        description: questionDesc,
        options: options
    };
}

export function parseCorrectAnswers(answerStr, options) {
    if (!answerStr) return [];
    const optionLetters = (options || []).map(o => o.letter.toUpperCase());
    if (optionLetters.length === 0) return [answerStr.trim().toUpperCase()];

    const cleanStr = answerStr.toUpperCase()
        .replace(/^(ĐÁP ÁN ĐÚNG|ĐÁP ÁN|DAP AN DUNG|DAP AN|ANSWER|ANS|TRẢ LỜI|TRA LOI|LÀ|LA)\s*[:\-]?\s*/g, '')
        .trim();

    // Split by common delimiters
    const tokens = cleanStr.split(/[\s,;\/\+\-\&|]+/);
    let matches = [];

    tokens.forEach(token => {
        const trimmedToken = token.trim();
        if (optionLetters.includes(trimmedToken)) {
            matches.push(trimmedToken);
        } else if (trimmedToken.length > 1) {
            // Check if it's a concatenation of option letters (e.g. "AB", "ABC")
            const chars = trimmedToken.split('');
            const allAreOptions = chars.every(c => optionLetters.includes(c));
            if (allAreOptions) {
                matches.push(...chars);
            }
        }
    });

    // Remove duplicates and sort
    const uniqueMatches = Array.from(new Set(matches)).sort();
    return uniqueMatches.length > 0 ? uniqueMatches : [answerStr.trim().toUpperCase()];
}

export function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function formatShortDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

export function compressAndResizeImage(file, maxWidth, maxHeight, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onerror = (err) => reject(err);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onerror = (err) => reject(err);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(event.target.result);
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
        };
    });
}


