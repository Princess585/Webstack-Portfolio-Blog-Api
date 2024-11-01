const request = require("supertest");
const bcrypt = require("bcrypt");

const app = require("../../app");
const User = require("../models/user");
const Blog = require("../models/blog");
const redis = require("../database/redisDatabase");

let testUser, authToken, testBlog;

beforeAll(async () => {
    // Create a test user for authentication
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

    // Authenticate the user to get an authorization token
    const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testUser.email, password: "Password@123" });

    authToken = response.body.token;
});

afterAll(async () => {
    // Cleanup
    await Blog.destroy({ where: { user_id: testUser.id } });
    await User.destroy({ where: { id: testUser.id } });

    app.off;
    redis.quit();
});

describe("Blog End-to-End Tests", () => {
    describe("POST /blogs - Create Blog", () => {
        it("should create a blog successfully", async () => {
            const response = await request(app)
                .post("/api/v1/blogs")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    title: "Sample Blog",
                    content: "This is a sample blog content.",
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe("Blog created successfully");
            expect(response.body.blog.title).toBe("Sample Blog");

            // Store the created blog for later tests
            testBlog = response.body.blog;
        });

        it("should return 400 if title or content is missing", async () => {
            const response = await request(app)
                .post("/api/v1/blogs")
                .set("Authorization", `Bearer ${authToken}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toContain("\"title\" is required");
        });
    });

    describe("GET /blogs/:id - Fetch Blog", () => {
        it("should fetch a blog by ID", async () => {
            const response = await request(app)
                .get(`/api/v1/blogs/${testBlog.id}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.title).toBe(testBlog.title);
            expect(response.body.data.content).toBe(testBlog.content);
        });

        it("should return 404 if blog does not exist", async () => {
            const response = await request(app)
                .get("/api/v1/blogs/99999")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe("Blog not found");
        });
    });

    describe("PUT /blogs/:id - Update Blog", () => {
        it("should update a blog successfully", async () => {
            const response = await request(app)
                .put(`/api/v1/blogs/${testBlog.id}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Updated Blog", content: "Updated blog content" });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Blog updated successfully");
            expect(response.body.data.title).toBe("Updated Blog");

            // Verify in DB
            const updatedBlog = await Blog.findByPk(testBlog.id);
            expect(updatedBlog.title).toBe("Updated Blog");
        });

        it("should return 400 if title or content is empty", async () => {
            const response = await request(app)
                .put(`/api/v1/blogs/${testBlog.id}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "", content: "" });

            expect(response.status).toBe(403);
            expect(response.body.error).toContain("Bad Request: no title or content provided.");
        });
    });

    describe("DELETE /blogs/:id - Delete Blog", () => {
        it("should delete a blog successfully", async () => {
            const response = await request(app)
                .delete(`/api/v1/blogs/${testBlog.id}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Blog deleted successfully");

            // Verify in DB
            const deletedBlog = await Blog.findByPk(testBlog.id);
            expect(deletedBlog).toBeNull();
        });

        it("should return 404 if trying to delete a non-existent blog", async () => {
            const response = await request(app)
                .delete(`/api/v1/blogs/${testBlog.id}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe("Blog not found");
        });
    });
});
