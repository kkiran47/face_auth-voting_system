require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
console.log("Connecting to MongoDB URI:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vote", require("./routes/voteRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/logout", require("./routes/logoutRoute"));
app.use("/api/elections", require("./routes/electionRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
