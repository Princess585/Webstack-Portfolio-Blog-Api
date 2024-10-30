const { DataTypes, Model } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

const { sequelize } = require("../database/database");

class Blog extends Model { }

Blog.init({
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: () => uuidv4().toString(),
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
        references: {
            model: "users",
            key: "id",
        },
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'Blog',
    tableName: "blogs",
    indexes: [
        {
            fields: ["id"],
        },
        {
            fields: ["user_id"],
        }
    ],
});

// `sequelize.define` also returns the model
console.log(Blog === sequelize.models.Blog); // true

module.exports = Blog;
