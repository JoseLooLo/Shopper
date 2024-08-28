import { RequestHandler } from "express";

export const postUploadImage: RequestHandler = async (req, res, next) => {
    return res
        .status(200)
        .json({
            message: "#TODO upload image"
        })
}