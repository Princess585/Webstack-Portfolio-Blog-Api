Webstack-Portfolio-Blog-Api
# Blog API

## Overview

A RESTful API for managing blog posts, comments, and user authentication, built with Node.js, Express, Redis, and PostgreSQL. This API supports CRUD operations for blog posts, user management, and comment handling. The project is structured for scalability, with built-in authentication, validation, and error handling.

## Table of Contents
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Endpoints](#endpoints)
- [Technologies Used](#technologies-used)
- [Testing](#testing)
- [License](#license)

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Princess585/Webstack-Portfolio-Blog-Api.git
   cd Webstack-Portfolio-Blog-Api
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up PostgreSQL Database**:
   Create a PostgreSQL database and configure the environment variables accordingly.

4. **Run the API**:
   ```bash
   npm run dev
   ```
The Tables would be created immediately.

## Environment Variables

Create a `.env` file in the project root and configure the following:

```plaintext
PORT=5001
DATABASE_URL='postgres://username:password@localhost:5432/databasename'
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_url
```

## Scripts

- `npm run dev`: Start the server in development mode with `nodemon`.
- `npm test`: Run tests with Jest.
- `npm run lint`: Run linting checks using ESLint.
- `npm run check-lint`: Check linting in specific files.

## Endpoints

### Authentication

- **POST** `/api/v1/auth/register` - Register a new user.
- **POST** `/api/v1/auth/login` - Authenticate user and issue a JWT.

### User

- **PUT** `/api/v1/users` - Update user profile.
- **DELETE** `/api/v1/users` - Delete user account.

### Blog Posts

- **POST** `/api/v1/blogs` - Create a new blog post.
- **GET** `/api/v1/blogs` - Get all blog posts.
- **GET** `/api/v1/blogs/:blog_id` - Get a specific blog post by ID.
- **PUT** `/api/v1/blogs/:blog_id` - Update a blog post by ID.
- **DELETE** `/api/v1/blogs/:blog_id` - Delete a blog post by ID.

### Comments

- **POST** `/api/v1/blogs/:blog_id/comments` - Add a comment to a blog post.
- **GET** `/api/v1/blogs/:blog_id/comments` - Get comments for a blog post.
- **DELETE** `/api/v1/blogs/:blog_id/comments/:comment_id` - Delete a comment.

## Technologies Used

- **Node.js** - JavaScript runtime environment.
- **Express** - Web framework for building the API.
- **Sequelize** - ORM for database management.
- **PostgreSQL** - Relational database management system.
- **Redis** - In-memory data structure store for caching.
- **JSON Web Tokens (JWT)** - Token-based authentication.
- **Joi** - Data validation.
- **Supertest** - HTTP assertions and testing.
- **Jest** - Testing framework.

## Testing

Testing is handled by Jest and Supertest. To run the tests, use:

```bash
npm test
```

- The tests cover user authentication, blog post operations, and comment handling.
- **Note**: Make sure your test environment is configured properly in `.env` and that the `NODE_ENV` is set to `test`.

## License

This project is licensed under the ISC License.

--- 
