import { RequestHandler } from "express";
import { z } from 'zod';

import {
    getMeasuresByUUID,
    confirmMeasureValueByUUID
} from "../database/models/measureModel.js"

const querrySchema = z.object({
    measure_uuid: z
        .string()
        .uuid("measure_uuid must be a valid UUID"),
    confirmed_value: z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val), { message: "confirmed_value must be a valid number" })
});


export const pathConfirm: RequestHandler = async (req, res, next) => {

    const parsedParams = querrySchema.safeParse(req.query);
    if (!parsedParams.success)
        return res.status(400).json({
                    INVALID_DATA,
                    "error_description": parsedParams.error.issues.at(0)?.message
                });


    const {measure_uuid, confirmed_value} = parsedParams.data;

    var measure = await getMeasuresByUUID(measure_uuid);
    if (!measure) {
        return res.status(404).json(MEASURE_NOT_FOUND);
    }

    if (measure.has_confirmed) {
        return res.status(409).json(CONFIRMATION_DUPLICATE);
    }

    confirmMeasureValueByUUID(measure_uuid, confirmed_value);
    return res.status(200).json(CONFIRMATION_SUCCESS);
}

const MEASURE_NOT_FOUND = {
    "error_code": "MEASURE_NOT_FOUND",
    "error_description": "Leitura do mês ainda não foi realizada"
};

const INVALID_DATA = {
    "error_code": "INVALID_DATA",
};

const CONFIRMATION_DUPLICATE = {
    "error_code": "CONFIRMATION_DUPLICATE",
    "error_description": "Leitura do mês já confirmada"
};

const CONFIRMATION_SUCCESS = {
    "success": true
};