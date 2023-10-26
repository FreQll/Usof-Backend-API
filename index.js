const express = require("express");
const config = require("./config.json");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const userRouter = require("./routes/UserRouter");
const postRouter = require("./routes/PostRouter");
const authRouter = require("./routes/AuthRouter");
const categoriesRouter = require("./routes/CategoriesRouter");
const commentsRouter = require("./routes/CommentsRouter");

app.use(express.json());
app.use(cookieParser());
app.use(cors());
require("dotenv").config();

app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/auth", authRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/comments", commentsRouter);

app.listen(config.port, config.host, () => {
  console.log(`Server is alive on http://${config.host}:${config.port}`);
});
