const express = require("express");

const { register, login } = require("../controllers/AuthController");
const { createBlog, fetchBlog, updateBlog, deleteBlog } = require("../controllers/BlogController");
const authorizeMiddleware = require("../middleWare/authentication")
const { createComment, fetchComment, updateComment, deleteComment } = require("../controllers/CommentController");
const { deleteUser, updateUser } = require("../controllers/UserController");


const router = express.Router();

router.get("/", (req, res) => {
    res.set("Content-Type", "application/json");
    return res.status(200).json({ message: "Welcome to Blog Post API!!!" })
})

router.post("/api/v1/auth/register", register);
router.post("/api/v1/auth/login", login);

router.put("/api/v1/users", authorizeMiddleware, updateUser);
router.delete("/api/v1/users", authorizeMiddleware, deleteUser);

router.post("/api/v1/blogs", authorizeMiddleware, createBlog);
router.get("/api/v1/blogs/:blog_id?", fetchBlog);
router.put("/api/v1/blogs/:blog_id", authorizeMiddleware, updateBlog);
router.delete("/api/v1/blogs/:blog_id", authorizeMiddleware, deleteBlog);

router.post("/api/v1/blogs/:blog_id/comments", authorizeMiddleware, createComment);
router.get("/api/v1/blogs/:blog_id/comments/:comment_id?", fetchComment);
router.put("/api/v1/blogs/:blog_id/comments/:comment_id", authorizeMiddleware, updateComment);
router.delete("/api/v1/blogs/:blog_id/comments/:comment_id", authorizeMiddleware, deleteComment);

module.exports = router;
