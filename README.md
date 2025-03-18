# EduLect API Server

This is the backend server for the EduLect educational platform. It provides RESTful API endpoints for managing courses, content, user authentication, and more.

## Technology Stack

- **Node.js** with Express framework
- **MongoDB** (with Mongoose ODM)
- **JWT** for authentication
- **Redis** for caching (optional)
- **Winston** for logging
- **Prometheus** for metrics

## Directory Structure

- `controllers/` - Request handlers for each entity
- `models/` - MongoDB schemas and models
- `routes/` - API route definitions
- `services/` - Business logic
- `utils/` - Helper functions and utilities
- `config/` - Configuration files
- `import-data/` - Scripts to import sample data

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB
- Redis (optional)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/Luka-md19/Education-API.git
   cd Education-API
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Configure environment variables
   - Create a `config.env` file based on `config.env.example`
   - Update with your actual MongoDB connection string, JWT secret, etc.

### Running the Server

```
npm start
```

For development with automatic restarts:
```
npm run dev
```

### Docker Support

The application comes with Docker support. Use the following command to start all services:

```
docker-compose up
```

## API Endpoints

### Authentication
- `POST /api/v1/users/signup` - Register a new user
- `POST /api/v1/users/login` - User login
- `GET /api/v1/users/logout` - User logout

### Faculties
- `GET /api/v1/faculties` - Get all faculties
- `POST /api/v1/faculties` - Create a new faculty
- `GET /api/v1/faculties/:id` - Get a specific faculty
- `PATCH /api/v1/faculties/:id` - Update a faculty
- `DELETE /api/v1/faculties/:id` - Delete a faculty

### Departments
- `GET /api/v1/departments` - Get all departments
- `POST /api/v1/departments` - Create a new department
- `GET /api/v1/departments/:id` - Get a specific department
- `PATCH /api/v1/departments/:id` - Update a department
- `DELETE /api/v1/departments/:id` - Delete a department

### Courses
- `GET /api/v1/courses` - Get all courses
- `POST /api/v1/courses` - Create a new course
- `GET /api/v1/courses/:id` - Get a specific course
- `PATCH /api/v1/courses/:id` - Update a course
- `DELETE /api/v1/courses/:id` - Delete a course

### And more...

## License

[MIT License](LICENSE)
