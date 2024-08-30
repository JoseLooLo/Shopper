import { public_path } from "../app.js";
import Jimp from "jimp"

function getBase64ImageType(image_base64: string): string {
    switch (image_base64.charAt(0)) {
        case '/':
            return ".jpeg";
        case 'i':
            return ".png";
        case 'U':
            return ".webp";
        default:
            return ''
    }
}

export async function base64ToImage(base64: string, save_name: string) {
    const buffer = Buffer.from(base64, "base64");
    const name = save_name + getBase64ImageType(base64);
    const path = "uploads/" + name;
    try {
        const image = await Jimp.read(buffer);
        await image.quality(20).writeAsync(public_path + path);
    } catch (e) {
        //THIS **** JIMP LIBRARY HAS A BUG THAT CRASH ON RANDOM IMAGES. IF IT CRASHED SEND ANOTHER ONE. GOOD LUCK, YOU WILL NEED IT.
        return null;
    }

    return path;
}