const Joi = require("joi");

const registerSchema = Joi.object({
    first_name: Joi.string().trim().min(3).max(40).required().normalize("NFKC"),
    last_name: Joi.string().trim().min(3).max(40).required().normalize("NFKC"),
    password: Joi.string().trim().min(6).max(40).required().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#_\-])[A-Za-z\d@$#_\-]{6,}$/),
    email: Joi.string().email().required(),
});

const loginSchema = Joi.object({
    password: Joi.string().trim().min(6).max(40).required().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#_\-])[A-Za-z\d@$#_\-]{6,}$/),
    email: Joi.string().email().required(),
});

const createBlogSchema = Joi.object({
    title: Joi.string().trim().min(3).max(255).required().normalize("NFKC"),
    content: Joi.string().trim().min(3).max(1200).required().normalize("NFKC"),
});

const titleSchema = Joi.object({
    title: Joi.string().trim().min(3).max(255).normalize("NFKC"),
});

const contentSchema = Joi.object({
    title: Joi.string().trim().min(3).max(255).normalize("NFKC"),
});

const createCommentSchema = Joi.object({
    content: Joi.string().trim().min(3).max(400).required().normalize("NFKC"),
});

const updateUserSchema = Joi.object({
    first_name: Joi.string().trim().min(3).max(40).normalize("NFKC"),
    last_name: Joi.string().trim().min(3).max(40).normalize("NFKC"),
    password: Joi.string().trim().min(6).max(40).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#_\-])[A-Za-z\d@$#_\-]{6,}$/),
    email: Joi.string().email(),
});


module.exports = { registerSchema, loginSchema, createBlogSchema, titleSchema, contentSchema, createCommentSchema, updateUserSchema }
