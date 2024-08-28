import express from "express";
export const router = express.Router();

import { postUploadImage } from "./controller/uploadController.js";
import { pathConfirm } from "./controller/confirmController.js";
import { getCustomerList } from "./controller/customerListController.js";

router.get('/', (req, res) => res.status(200).send("Welcome"));

router.post('/upload', postUploadImage);
router.patch('/confirm', pathConfirm);
router.get('/:customer_code/list', getCustomerList);