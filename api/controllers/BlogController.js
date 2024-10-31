const { createBlogSchema, contentSchema, titleSchema } = require("../utils/validationSchema");
const Blog = require("../models/blog");
const redis = require("../database/redisDatabase");


const createBlog = async (req, res) => {
    try {

        const { error, value } = createBlogSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { title, content } = value;

        // Validate request data
        if (!title || !content) {
            return res.status(400).json({ error: "Title and content are required" });
        }

        // Create a new blog post associated with the logged-in user
        console.log("req.user.id: ", req.user);
        const blog = await Blog.create({
            title,
            content,
            user_id: req.user.id, // User ID from the token
        });

        // Invalidate the cache after creating a new blog
        await redis.del('blogs'); // Remove cached blogs


        res.status(201).json({ message: "Blog created successfully", blog });
    } catch (err) {
        console.error("Blog creation error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const fetchBlog = async (req, res) => {
    try {
        const { blog_id } = req.params;

        if (blog_id) {
            // Fetch a single blog post by ID
            const blog = await Blog.findOne({ where: { id: blog_id } });
            if (!blog) return res.status(404).json({ error: "Blog not found" });
            return res.json({ message: "Blog retrieved successfully", data: blog });
        }
        // define a key for caching in redis
        const cacheKey = "blogs";
        const cachedBlods = await redis.get(cacheKey);

        if (cachedBlods) {
            // If cache exists, return cached data
            return res.json(JSON.parse(cachedBlods));
        }

        // If cache doesn't exist, fetch from database
        // Fetch all blog posts
        const blogs = await Blog.findAll();
        await redis.set(cacheKey, JSON.stringify(blogs), 'EX', 3600); // Cache for 1 hour

        return res.json({ message: "Blogs retrieved successfully", data: blogs });
    } catch (error) {
        console.error("Fetch blog error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateBlog = async (req, res) => {
    try {
        const { blog_id } = req.params;
        let { title, content } = req.body;
        if (title && !content) {
            const { error, value } = titleSchema.validate({ title });
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            title = value.title;
        }
        if (content && !title) {
            const { error, value } = contentSchema.validate({ content });
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            content = value.content;
        }
        if (title && content) {
            const { error, value } = createBlogSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            title = value.title;
            content = value.content;
        }
        if (!title && !content) {
            return res.status(403).json({ error: "Bad Request: no title or content provided." });
        }

        // Fetch the blog post
        const blog = await Blog.findOne({ where: { id: blog_id } });
        if (!blog) return res.status(404).json({ error: "Blog not found" });

        // Check if the logged-in user is the owner of the blog post
        if (blog.user_id !== req.user.id) {
            return res.status(403).json({ error: "Forbidden: You cannot edit this blog" });
        }

        // Update the blog post
        await blog.update({ title, content });

        // Invalidate the cache after creating a new blog
        await redis.del('blogs'); // Remove cached blogs


        return res.json({ message: "Blog updated successfully", data: blog });
    } catch (error) {
        console.error("Update blog error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const deleteBlog = async (req, res) => {
    try {
        const { blog_id } = req.params;

        // Fetch the blog post
        const blog = await Blog.findOne({ where: { id: blog_id } });
        if (!blog) return res.status(404).json({ error: "Blog not found" });

        // Check if the logged-in user is the owner of the blog post
        if (blog.user_id !== req.user.id) {
            return res.status(403).json({ error: "Forbidden: You cannot delete this blog" });
        }

        // Delete the blog post
        await blog.destroy();

        // Invalidate the cache after creating a new blog
        await redis.del('blogs'); // Remove cached blogs

        return res.json({ message: "Blog deleted successfully" });
    } catch (error) {
        console.error("Delete blog error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { createBlog, fetchBlog, updateBlog, deleteBlog };
