export const addLineBreaksAfterPunctuation = (text: string): string => {
    // Define the punctuation marks that should trigger a new line
    const punctuation = /([.?!؟])/g;

    // Replace occurrences of punctuation marks followed by a space with the punctuation mark, a newline, and the space
    const formattedText = text.replace(punctuation, '$1\n').replace(/\n\s+/g, '\n').trim();

    return formattedText;
};

export const formatStringBySentence = (input: string): string => {
    const footnoteRegex = /^\((?:\d+|۱|۲|۳|۴|۵|۶|۷|۸|۹)\)\s/;
    const sentences = [];
    const lines = input.split('\n');
    let currentSentence = '';

    lines.forEach((line) => {
        const trimmedLine = line.trim();
        const isFootnote = footnoteRegex.test(trimmedLine);
        const isNumber = /^\(\d+\/\d+\)/.test(trimmedLine);

        if (isFootnote && !isNumber) {
            if (currentSentence) {
                sentences.push(currentSentence.trim());
                currentSentence = '';
            }
            sentences.push(trimmedLine);
        } else {
            currentSentence += `${trimmedLine} `;
            const lastChar = currentSentence.trim().slice(-1);
            if (/[.!؟]/.test(lastChar)) {
                sentences.push(currentSentence.trim());
                currentSentence = '';
            }
        }
    });

    // Add any remaining text to the output
    if (currentSentence) {
        sentences.push(currentSentence.trim());
    }

    return sentences.join('\n');
};
