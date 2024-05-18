// @ts-ignore
import Jimp from 'jimp';

export enum Method {
    ROWS = "rows",
    COLS = "cols"
}

export const getColorMatrix = async (imagePath: string, outputPath: string) => {
    const image = await Jimp.read(imagePath);
    const newImage = new Jimp(image.getWidth(), image.getHeight());

    image.scan(0, 0, image.getWidth(), image.getHeight(), (x: number, y: number, idx: number) => {
        const red = image.bitmap.data[idx];
        const green = image.bitmap.data[idx + 1];
        const blue = image.bitmap.data[idx + 2];

        const newRed = red & 0x01;
        const newGreen = green & 0x01;
        const newBlue = blue & 0x01;

        newImage.setPixelColor(Jimp.rgbaToInt(newRed * 255, newGreen * 255, newBlue * 255, 255), x, y);
    });

    await newImage.writeAsync(outputPath);
}


export const embedMessage = async (containerPath: string, message: string, outputImagePath: string, method: Method) => {
    const containerImage = await Jimp.read(containerPath);

    const messageBytes = Buffer.from(message, 'utf8');
    const messageBits = buf2bin(messageBytes);

    const maxMessageBits = (containerImage.getWidth() * containerImage.getHeight()) * 3;
    if (messageBits.length > maxMessageBits)
        throw new Error("Message is too large for the container");

    let messageBitIndex = 0;
    let endZeroGroup = 0;

    let xMax = 0;
    let yMax = 0;

    switch (method) {
        case Method.ROWS:
            xMax = containerImage.getWidth();
            yMax = containerImage.getHeight();
            break;
        case Method.COLS:
            xMax = containerImage.getHeight();
            yMax = containerImage.getWidth();
            break;
    }
    for (let y = 0; y < yMax; y++) {
        for (let x = 0; x < xMax; x++) {
            let pixelColor: number = 0;
            switch (method) {
                case Method.ROWS:
                    pixelColor = containerImage.getPixelColor(x, y);
                    break;
                case Method.COLS:
                    pixelColor = containerImage.getPixelColor(y, x);
                    break;
            }

            const red: number = Jimp.intToRGBA(pixelColor).r;
            const green: number = Jimp.intToRGBA(pixelColor).g;
            const blue: number = Jimp.intToRGBA(pixelColor).b;

            let newRed: number = 0;
            let newGreen: number = 0;
            let newBlue: number = 0;

            if (messageBitIndex < messageBits.length) {
                if (+messageBits[messageBitIndex]) {
                    newRed = red | 1;
                } else {
                    newRed = red & ~1;
                }

                messageBitIndex++;

                if (messageBitIndex < messageBits.length) {
                    if (+messageBits[messageBitIndex]) {
                        newGreen = green | 1;
                    } else {
                        newGreen = green & ~1;
                    }
                    messageBitIndex++;
                }

                if (messageBitIndex < messageBits.length) {
                    if (+messageBits[messageBitIndex]) {
                        newBlue = blue | 1;
                    } else {
                        newBlue = blue & ~1;
                    }
                    messageBitIndex++;
                }

                switch (method) {
                    case Method.ROWS:
                        containerImage.setPixelColor(Jimp.rgbaToInt(newRed, newGreen, newBlue, 255), x, y);
                        break;
                    case Method.COLS:
                        containerImage.setPixelColor(Jimp.rgbaToInt(newRed, newGreen, newBlue, 255), y, x);
                        break;
                }
            } else {
                if (endZeroGroup >= 3) {
                    break;
                } else {
                    newRed = red & ~1;
                    newGreen = green & ~1;
                    newBlue = blue & ~1;
                    switch (method) {
                        case Method.ROWS:
                            containerImage.setPixelColor(Jimp.rgbaToInt(newRed, newGreen, newBlue, 255), x, y);
                            break;
                        case Method.COLS:
                            containerImage.setPixelColor(Jimp.rgbaToInt(newRed, newGreen, newBlue, 255), y, x);
                            break;
                    }
                    endZeroGroup++;
                }
            }
        }

        if (messageBitIndex >= messageBits.length) {
            break;
        }
    }

    await containerImage.writeAsync(outputImagePath);
};

export const extractMessage = async (imagePath: string, method: Method) => {
    const containerImage = await Jimp.read(imagePath);
    let messageBits: string = "";

    const messageBitsLength = (containerImage.getWidth() * containerImage.getHeight()) * 3;

    let messageBitIndex = 0;
    let endZeroGroup = 0;
    let xMax = 0;
    let yMax = 0;

    switch (method) {
        case Method.ROWS:
            xMax = containerImage.getWidth();
            yMax = containerImage.getHeight();
            break;
        case Method.COLS:
            xMax = containerImage.getHeight();
            yMax = containerImage.getWidth();
            break;
    }
    for (let y = 0; y < yMax; y++) {
        for (let x = 0; x < xMax; x++) {
            let pixelColor: number = 0;
            switch (method) {
                case Method.ROWS:
                    pixelColor = containerImage.getPixelColor(x, y);
                    break;
                case Method.COLS:
                    pixelColor = containerImage.getPixelColor(y, x);
                    break;
            }

            const red = Jimp.intToRGBA(pixelColor).r;
            const green = Jimp.intToRGBA(pixelColor).g;
            const blue = Jimp.intToRGBA(pixelColor).b;

            messageBits += red & 1;
            messageBitIndex++;

            if (messageBitIndex < messageBitsLength) {
                messageBits += green & 1;
                messageBitIndex++;
            }

            if (messageBitIndex < messageBitsLength) {
                messageBits += blue & 1;
                messageBitIndex++;
            }
            if (messageBits.slice(messageBits.length - 3) === "000") {
                endZeroGroup++;
            } else {
                endZeroGroup = 0;
            }
            if (messageBitIndex >= messageBitsLength) {
                break;
            }
            if (endZeroGroup >= 3) {
                break;
            }
        }

        if (messageBitIndex >= messageBitsLength) {
            break;
        }
        if (endZeroGroup >= 3) {
            break;
        }
    }

    return convertBinaryToString(messageBits);
}

const buf2bin = (buffer: Buffer) => {
    return BigInt('0x' + buffer.toString('hex')).toString(2).padStart(buffer.length * 8, '0');
}

export const convertBinaryToString = (binaryString: string): string => {
    let text = '';
    for (let i = 0; i < binaryString.length; i += 8) {
        const byte = binaryString.slice(i, i + 8);
        const charCode = parseInt(byte, 2);
        const char = String.fromCharCode(charCode);
        text += char;
    }
    return text;
}

