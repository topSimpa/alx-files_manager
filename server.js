import express from "express";
import router from "./routes/index";

const app = express();

app.use(express.json());

app.use("/", router);
app.listen(process.env.PORT || 5000);
