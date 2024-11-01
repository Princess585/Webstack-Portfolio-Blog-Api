const { createCommentSchema } = require("../utils/validationSchema");
const Comment = require("../models/comment");
const Blog = require("../models/blog");
const redis = require("../database/redisDatabase");

const createComment = async (req, res) => {
    try {
        const { blog_id } = req.params;
        // Validate the comment data
        const { error, value } = createCommentSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { content } = value;

        if (!blog_id) {
            return res.status(404).json({ error: "Missing blog_id" });
        }

        // check if blog exists
        const blog = await Blog.findOne({ where: { id: blog_id } });
        if (!blog) return res.status(404).json({ error: "Blog not found" });

        // Create the comment
        const newComment = await Comment.create({
            content,
            user_id: req.user.id, // The authenticated user
            blog_id
        });

        // Invalidate the cache for a specific blog's comments
        await redis.del(`comments:${blog_id}`); // Remove cached comments for that blog

        return res.status(201).json({ message: "Comment created successfully", comment: newComment });
    } catch (error) {
        console.error("Create comment error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const fetchComment = async (req, res) => {
    try {
        const { comment_id, blog_id } = req.params;

        if (!blog_id) {
            return res.status(404).json({ error: "Missing blog_id" });
        }

        // check if blog exists
        const blog = await Blog.findOne({ where: { id: blog_id } });
        if (!blog) return res.status(404).json({ error: "Blog not found" });

        if (comment_id) {
            // Fetch a single comment by ID
            const comment = await Comment.findOne({ where: { id: comment_id } });
            if (!comment) return res.status(404).json({ error: "Comment not found" });
            return res.json({ message: "comment retrieved successfully", data: comment });
        }
        const cacheKey = `comments:${blog_id}`; // Cache key with blog ID
        const cachedComments = await redis.get(cacheKey);

        if (cachedComments) {
            // If cache exists, return cached data
            return res.json(JSON.parse(cachedComments));
        }

        // If cache doesn't exist, fetch from database
        // Fetch all comments for a specific blog post
        const comments = await Comment.findAll({ where: { blog_id } });
        await redis.set(cacheKey, JSON.stringify(comments), 'EX', 3600); // Cache for 1 hour

        return res.json({ message: "comments retrieved successfully.", data: comments });
    } catch (error) {
        console.error("Fetch comment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateComment = async (req, res) => {
    try {
        const { blog_id, comment_id } = req.params;

        if (!blog_id) {
            return res.status(404).json({ error: "Missing blog_id" });
        }
        if (!comment_id) {
            return res.status(404).json({ error: "Missing comment_id" });
        }

        // Validate the comment data
        const { error, value } = createCommentSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { content } = value;

        // check if blog exists
        const blog = await Blog.findOne({ where: { id: blog_id } });
        if (!blog) return res.status(404).json({ error: "Blog not found" });

        // Fetch the comment
        const comment = await Comment.findOne({ where: { id: comment_id } });
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        // Check if the logged-in user is the owner of the comment
        if (comment.user_id !== req.user.id) {
            return res.status(403).json({ error: "Forbidden: You cannot edit this comment" });
        }
        // Invalidate the cache for a specific blog's comments
        await redis.del(`comments:${blog_id}`); // Remove cached comments for that blog

        // Update the comment
        await comment.update({ content });
        return res.json({ message: "Comment updated successfully", comment });
    } catch (error) {
        console.error("Update comment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { blog_id, comment_id } = req.params;

        if (!blog_id) {
            return res.status(404).json({ error: "Missing blog_id" });
        }

        // check if blog exists
        const blog = await Blog.findOne({ where: { id: blog_id } });
        if (!blog) return res.status(404).json({ error: "Blog not found" });

        // Fetch the comment
        const comment = await Comment.findOne({ where: { id: comment_id } });
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        // Check if the logged-in user is the owner of the comment
        if (comment.user_id !== req.user.id) {
            return res.status(403).json({ error: "Forbidden: You cannot delete this comment" });
        }

        // Delete the comment
        await comment.destroy();

        // Invalidate the cache for a specific blog's comments
        await redis.del(`comments:${blog_id}`); // Remove cached comments for that blog

        return res.json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Delete comment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { createComment, fetchComment, updateComment, deleteComment };
