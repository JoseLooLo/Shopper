import express from "express";
import path from "path";
import {router} from "./router.js"

export const public_path = "public/"

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.resolve() + "/" + public_path));
app.use(router)


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});