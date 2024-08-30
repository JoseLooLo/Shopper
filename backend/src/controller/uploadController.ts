import { RequestHandler } from "express";
import { base64ToImage } from "../utility/Image.js";
import { public_path } from "../app.js";
import { z } from 'zod';
import { run } from "../utility/Gemini.js"

import {
    MeasureFilterParams,
    getFilteredMeasuresByMonth,
    MeasureInsertParams,
    insertMeasure
} from "../database/models/measureModel.js"

const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

const querrySchema = z.object({
    image: z
        .string({ required_error: "image is required" }),
        //.refine((val) => Base64.isValid(val), { message: "image must be a base64 value" }), WHY THIS IS NOT WORKING !??
        //OK lets go to regex *sign*
        //.refine((val) => base64Regex.test(val), { message: "image must be a base64 value" }),
        //It was not working because the raw message in base64 change the '+' to ' ' then the verification fails
        //Just ignore this for now and check after fix the base64 raw message later
    customer_code: z
        .string({ required_error: "customer_code is required" })
        .min(1, {message : "customer_code should not be empty"}),
    measure_datetime: z
        .string({ required_error: "measure_datetime is required" })
        .date("measure_datetime must be a date"),
    measure_type: z
        .string({ required_error: "measure_type is required" })
        .min(1, {message: "measure_type should not be empty"})
});


export const postUploadImage: RequestHandler = async (req, res, next) => {

    const parserdQuerry = querrySchema.safeParse(req.query);
    if (!parserdQuerry.success) 
        return res.status(400).json(getInvalidDataStruct(parserdQuerry.error.issues.at(0)?.message));
    
    const {image, customer_code, measure_datetime, measure_type} = parserdQuerry.data;
    if (!validateMeasureType(measure_type))
        return res.status(400).json(getInvalidDataStruct("measure_type must be Water or Gas"));

    const filters: MeasureFilterParams = {
        customer_code: customer_code,
        measure_type: measure_type
    };

    const measures = await getFilteredMeasuresByMonth(filters, new Date(measure_datetime));
    if (measures.length > 0)
        return res.status(409).json(DOUBLE_REPORT);

    const random_uuid = crypto.randomUUID();

    const fixed_image = fixBase64Raw(image);

    const image_path = await base64ToImage(fixed_image, random_uuid);
    if (!image_path)
        return res.status(400).json(getInvalidDataStruct("bad image. Try a .jpge image"));

    const content = await run(public_path + image_path);
    if (!content)
        return res.status(400).json(getInvalidDataStruct("Error with gemini"));

    const measured_value = validadeContent(content);
    if (!measured_value)
        return res.status(400).json(getInvalidDataStruct("bad image. Failed to read the values on the meter"));

    const params: MeasureInsertParams = {
        measure_uuid: random_uuid,
        image: image_path,
        measure_value: measured_value,
        customer_code: customer_code,
        measure_type: measure_type,
        measure_datetime: new Date(measure_datetime),
        has_confirmed: false
    };

    insertMeasure(params);
        
    return res
        .status(200)
        .json({
            "image_url": "localhost:3000/" + image_path,
            "measure_value": measured_value,
            "measure_uuid": random_uuid
        });
}

function validadeContent(content: string) : number | null {
    const value = Number(content);
    if (!value || value === -1)
        return null
    return value
}

function validateMeasureType(measure_type: String): boolean {
    if (measure_type.toLowerCase() === "water")
        return true
    if (measure_type.toLowerCase() === "gas")
        return true
    return false
}

function fixBase64Raw(base64: string): string {
    return base64.replace(/ /g, '+');
}

function getInvalidDataStruct(message: string | undefined) {
    return {
        INVALID_DATA,
        "error_description": message
    }
}

const INVALID_DATA = {
    "error_code": "INVALID_DATA",
};

const DOUBLE_REPORT = {
    "error_code": "DOUBLE_REPORT",
    "error_description": "Leitura do mês já realizada"
};