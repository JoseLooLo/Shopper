import { RequestHandler } from "express";

export const pathConfirm: RequestHandler = async (req, res, next) => {
    return res
        .status(200)
        .json({
            message: "#TODO confirm"
        })
}