import * as mammoth from 'mammoth';

export const lineLengthChanging = (text: string, message: string): string[] => {
    const binaryMessage = convertStringToBinary(message);
    let messageIndex = 0;
    const lines = text.split('\n');
    if (lines.length < binaryMessage.length) {
        throw new Error('Invalid text length');
    }

    const encodedLines: string[] = [];

    lines.forEach(line => {
        if (messageIndex < binaryMessage.length) {
            if (binaryMessage[messageIndex] === '1') {
                encodedLines.push(line + ' ');
            } else {
                encodedLines.push(line);
            }
            messageIndex++;
        } else {
            encodedLines.push(line);
        }
    });

    return encodedLines;
}

export const extractMessageLL = (encodedText: string): string => {
    const lines = encodedText.split('\n\n');
    let binaryMessage = '';

    lines.forEach(line => {
        if (line.endsWith(' ')) {
            binaryMessage += '1';
        } else {
            binaryMessage += '0';
        }
    });

    let message = '';
    for (let i = 0; i < binaryMessage.length; i += 8) {
        const byte = binaryMessage.slice(i, i + 8);
        if (byte.length === 8) {
            message += String.fromCharCode(parseInt(byte, 2));
        }
    }

    return message;
}

export const modifyKerning = (text: string, message: string): string => {
    let encodedText = '';
    const binaryMessage = convertStringToBinary(message);

    if (text.length < binaryMessage.length) {
        throw new Error(`Invalid text length`);
    }

    for (let i = 0; i < text.length; i++) {
        encodedText += text[i];
        if (+binaryMessage[i]) {
            encodedText += '\u200A';
        }
    }

    return encodedText;
};

export const extractTextFromDocx = async (filePath: string): Promise<string> => {
    const result = await mammoth.extractRawText({path: filePath});
    return result.value;
};

export const extractMessageKerning = (text: string): string => {
    let message = '';
    let bitSequence: string = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i + 1];
        if (char === '\u200A') {
            bitSequence += '1';
            ++i;
        } else {
            bitSequence += '0';
        }

        if (bitSequence.length === 8) {
            const charCode = parseInt(bitSequence, 2);
            if (charCode === 0) break;
            message += String.fromCharCode(charCode);
            bitSequence = '';
        }
    }

    return message;
};

export const convertStringToBinary = (str: string): string => {
    let binaryString = "";
    for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i).toString(2);
        charCode = charCode.length < 8 ? charCode.padStart(8, '0') : charCode;
        binaryString += charCode;
    }

    return binaryString;
}