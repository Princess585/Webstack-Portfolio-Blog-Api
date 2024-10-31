const request = require("supertest");
const bcrypt = require("bcrypt");

const app = require("../../app");
const User = require("../models/user");
const redis = require("../database/redisDatabase");

let testUser;
let authToken;

beforeAll(async () => {
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
    // Authenticate the test user to get an authorization token
    const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testUser.email, password: "Password@123" });

    authToken = response.body.token; // Store token for authorized requests
});

afterAll(async () => {
    // Cleanup: Delete the test user
    await User.destroy({ where: { id: testUser.dataValues.id } });
    app.off;
    redis.quit();
});

describe("User End-to-End Tests", () => {
    describe("PUT /user - Update User", () => {
        it("should update user profile successfully", async () => {
            const updatedData = {
                first_name: "Updated",
                last_name: "User",
                email: "updateduser@example.com"
            };

            const response = await request(app)
                .put("/api/v1/users")
                .set("Authorization", `Bearer ${authToken}`)
                .send(updatedData);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("User profile updated successfully");
            expect(response.body.data.first_name).toBe(updatedData.first_name);
            expect(response.body.data.email).toBe(updatedData.email);

            // Verify in DB
            const updatedUser = await User.findByPk(testUser.id);
            expect(updatedUser.first_name).toBe(updatedData.first_name);
            expect(updatedUser.email).toBe(updatedData.email);
        });

        it("should return 401 if unauthorized", async () => {
            const response = await request(app)
                .put("/api/v1/users")
                .send({ first_name: "NewName" });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Unauthorized access");
        });
    });

    describe("DELETE /user - Delete User", () => {
        it("should delete the user account successfully", async () => {
            const response = await request(app)
                .delete("/api/v1/users")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("User account deleted successfully");

            // Verify in DB
            const deletedUser = await User.findByPk(testUser.id);
            expect(deletedUser).toBeNull();
        });

        it("should return 401 if unauthorized", async () => {
            const response = await request(app).delete("/api/v1/users");
            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Unauthorized access");
        });
    });
});
