import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import userRoutes from "./src/routes/users.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRoutes from "./src/routes/admin.routes.js";
import complaintRoutes from "./src/routes/complaints.routes.js";
import aiRoutes from "./src/routes/ai.routes.js";
import dns from 'dns'

dotenv.config();
dns.setServers(["1.1.1.1" , "8.8.8.8"])

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/", userRoutes);
app.use("/admin", adminRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/ai", aiRoutes);

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`⚙️ Server is running at port: ${port}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB connection failed !!!", err);
  });