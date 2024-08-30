import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import fs from "fs";
import 'dotenv/config'

function getModel(): GenerativeModel | null {
    const { GEMINI_API_KEY } = process.env;
    if (GEMINI_API_KEY) {
        var genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        return genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
          });
          
    }
    return null;
}

function getImageMimeType(image_base64: string): string {
    switch (image_base64.charAt(0)) {
        case '/':
            return "image/jpeg";
        case 'i':
            return "image/png";
        case 'U':
            return "image/webp";
        default:
            return ''
    }
}

function getImageStruct(image_path: string) {
    const base64 = Buffer.from(fs.readFileSync(image_path)).toString("base64")
    const mime = getImageMimeType(base64);

    if (!mime)
        return null

    return {
        inlineData: {
            data: base64,
            mimeType: mime
        },
    }
}

export async function run(image_path: string) {
    const model = getModel();
    if (!model) {
        return null
    }

    const prompt = "Check if the image is a water meter or a energy meter. If it is, return the only the numbers that appears on the meter, without the metric system or any aditional information. If its not a water meter or enermy meter, or if you can not read the numbers on the meter, return -1";
    const image = getImageStruct(image_path);

    if (!image) {
        return null
    }

    const content = await model.generateContent([prompt, image]);
    return content.response.text()
}