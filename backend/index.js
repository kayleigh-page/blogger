require("dotenv").config();
const express = require("express");
const { createHandler } = require("graphql-http/lib/use/express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const schema = require("./schema");
const apiRoutes = require("./routes");
const path = require("path");

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(helmet());

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};
mongoose
  .connect(process.env.MONGO_URI, clientOptions)
  /* */
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));
/**/

app.all(
  "/graphql",
  createHandler({
    schema: schema,
    context: (req) => ({ req }),
  })
);

app.use("/api", apiRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
