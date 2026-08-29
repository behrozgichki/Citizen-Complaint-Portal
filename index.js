import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import userRoutes from "./src/routes/users.routes.js";
import cors from 'cors'
import cookieParser from "cookie-parser";
import adminRoutes from "./src/routes/admin.routes.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(
  cors({
    origin:"http://localhost:5173",
    credentials: true
  })
)
app.use(cookieParser())

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/", userRoutes);
app.use("/admin", adminRoutes);

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`⚙️ Server is running at port: ${port}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB connection failed !!!", err);
  });