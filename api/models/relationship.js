const User = require("./user");
const Blog = require("./blog");
const Comment = require("./comment");


User.hasMany(Blog, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

User.hasMany(Comment, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

Blog.belongsTo(User, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    "onUpdate": "CASCADE"
});

Blog.hasMany(Comment, {
    foreignKey: "blog_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

Comment.belongsTo(User, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    "onUpdate": "CASCADE"
});

Comment.belongsTo(Blog, {
    foreignKey: "blog_id",
    onDelete: "CASCADE",
    "onUpdate": "CASCADE"
});

module.exports = { User, Blog, Comment };
