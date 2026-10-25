import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("I,m From Category Routes");
});

router.post("/", (req, res) => {
  res.send("req.body");
});

export const categoryRoutes = router;
