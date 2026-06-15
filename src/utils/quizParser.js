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
        if (/^[A-D]\s*[\.\-\)]\s*/i.test(trimmed)) {
            const match = trimmed.match(/^([A-D])\s*[\.\-\)]\s*(.*)/i);
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
