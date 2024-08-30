import { RequestHandler } from "express";
import { z } from 'zod'; 

import {
    MeasureFilterParams,
    getFilteredMeasures
} from "../database/models/measureModel.js"

const paramsSchema = z.object({
    customer_code: z.string()
});

const querrySchema = z.object({
    measure_type: z.string().optional(),
});

export const getCustomerList: RequestHandler = async (req, res, next) => {

    const parsedParams = paramsSchema.safeParse(req.params);
    if (!parsedParams.success)
        return res.status(404).json(MEASURES_NOT_FOUND);

    const parserdQuerry = querrySchema.safeParse(req.query);
    if (!parserdQuerry.success)
        return res.status(400).json(INVALID_TYPE_ERROR);

    const {measure_type} = parserdQuerry.data;
    if (measure_type && !validateMeasureType(measure_type))
        return res.status(400).json(INVALID_TYPE_ERROR);

    const {customer_code} = parsedParams.data

    const filters: MeasureFilterParams = {
        customer_code: customer_code,
        measure_type: measure_type
    };

    var measures = await getFilteredMeasures(filters);
    if (measures.length === 0)
        return res.status(404).json(MEASURES_NOT_FOUND);

    return res
        .status(200)
        .json({
            "customer_code": customer_code,
            "measures": measures
        })

}

function validateMeasureType(measure_type: String): boolean {
    if (measure_type.toLowerCase() === "water")
        return true
    if (measure_type.toLowerCase() === "gas")
        return true
    return false
}

const MEASURES_NOT_FOUND = {
    "error_code": "MEASURES_NOT_FOUND",
    "error_description": "Nenhuma leitura encontrada"
};

const INVALID_TYPE_ERROR = {
    "error_code": "INVALID_TYPE",
    "error_description": "Tipo de medição não permitida"
};