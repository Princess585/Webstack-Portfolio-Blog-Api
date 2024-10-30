const { DataTypes, Model } = require("sequelize");
const { v4: uuidv4, stringify } = require("uuid");

const { sequelize } = require("../database/database");

class Comment extends Model { }

Comment.init({
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: () => uuidv4().toString(),
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    blog_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: "blogs",
            key: "id",
        },
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
    },
}, {
    sequelize,
    modelName: "Comment",
    tableName: "comments",
    indexes: [
        {
            fields: ["blog_id"], // Index on blog_id for efficient access
        },
        {
            fields: ["user_id"],
        }
    ],
}
);

console.log(Comment === sequelize.models.Comment); // true

module.exports = Comment;
