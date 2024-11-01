const request = require("supertest");
const bcrypt = require("bcrypt");

const app = require("../../app");
const User = require("../models/user");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const redis = require("../database/redisDatabase");


let testUser, testBlog, authToken, testComment;

beforeAll(async () => {
    // Create a test user and blog for comments
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("Password@123", saltRounds);

    // Create new user
    testUser = new User({
        first_name: "Test",
        last_name: "User",
        email: "testuser@gmail.com",
        password: hashedPassword
    });
    await testUser.save();

    testBlog = await Blog.create({
        title: "Sample Blog",
        content: "Sample blog content.",
        user_id: testUser.id
    });

    // Authenticate the user to get an authorization token
    const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testUser.email, password: "Password@123" });

    authToken = response.body.token;
});

afterAll(async () => {
    // Cleanup
    await Comment.destroy({ where: { blog_id: testBlog.id } });
    await Blog.destroy({ where: { id: testBlog.id } });
    await User.destroy({ where: { id: testUser.id } });

    app.off;
    redis.quit();
});

describe("Comment End-to-End Tests", () => {
    describe("POST /comments - Create Comment", () => {
        it("should create a comment successfully", async () => {
            const response = await request(app)
                .post(`/api/v1/blogs/${testBlog.id}/comments`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    content: "This is a test comment",
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe("Comment created successfully");
            expect(response.body.comment.content).toBe("This is a test comment");

            // Store the created comment for later tests
            testComment = response.body.comment;
        });

        it("should return 400 if content is missing", async () => {
            const response = await request(app)
                .post("/api/v1/blogs/${testBlog.id}/comments")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    blog_id: testBlog.id,
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("\"content\" is required");
        });
    });

    describe("GET /comments/:blog_id - Fetch Comments for Blog", () => {
        it("should fetch comments for a blog", async () => {
            const response = await request(app)
                .get(`/api/v1/blogs/${testBlog.id}/comments`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data[0].content).toBe("This is a test comment");
        });
    });

    describe("PUT /comments/:id - Update Comment", () => {
        it("should update a comment's content", async () => {
            const response = await request(app)
                .put(`/api/v1/blogs/${testBlog.id}/comments/${testComment.id}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ content: "Updated comment content" });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Comment updated successfully");
            expect(response.body.comment.content).toBe("Updated comment content");

            // Verify in DB
            const updatedComment = await Comment.findByPk(testComment.id);
            expect(updatedComment.content).toBe("Updated comment content");
        });

        it("should return 400 if content is empty", async () => {
            const response = await request(app)
                .put(`/api/v1/blogs/${testBlog.id}/comments/${testComment.id}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ content: "" });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("\"content\" is not allowed to be empty");
        });
    });

    describe("DELETE /comments/:id - Delete Comment", () => {
        it("should delete a comment", async () => {
            const response = await request(app)
                .delete(`/api/v1/blogs/${testBlog.id}/comments/${testComment.id}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Comment deleted successfully");

            // Verify in DB
            const deletedComment = await Comment.findByPk(testComment.id);
            expect(deletedComment).toBeNull();
        });

        it("should return 404 if comment does not exist", async () => {
            const response = await request(app)
                .delete(`/api/v1/blogs/${testBlog.id}/comments/${testComment.id}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe("Comment not found");
        });
    });
});
