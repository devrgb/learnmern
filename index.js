import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import { productRoutes } from "./src/routes/productRoutes.js";
import { categoryRoutes } from "./src/routes/categoryRoute.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

//Middleware
app.use(express.json());

//Routes
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/category", categoryRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "server Runing",
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Page Not Found",
  });
});

try {
  await connectDB();
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
} catch (error) {
  console.error("Startup failed:", error.message);
  process.exit(1);
}
