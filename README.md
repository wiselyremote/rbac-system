# RBAC System Backend

This is an Express-based API that provides CRUD operations for the resources "user" and "booking". Access rights are controlled through roles and policies, implementing a robust RBAC (Role-Based Access Control) system.

The API uses a MongoDB database, managed locally through Docker Compose.

## Prerequisites

Before running the application, make sure you have the following tools installed:

- Docker
- Docker Compose
- Yarn

## Authentication

To interact with the `/users` and `/bookings` endpoints, you first need to authenticate by sending a POST request to `/login` with a body containing valid `email` and `password`.

Example request to login:

```bash
POST /login
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

If the credentials are valid, the server will return a token in the response. You will need to include this token as a Bearer token in the `Authorization` header for subsequent requests.

Example of a successful response:

```bash
{
  "token": "your-jwt-token"
}
```

Once you have the token, you can use it to make authenticated requests to the `/users` and `/bookings` endpoints.

Example of a request with Bearer token:

```bash
GET /users
Authorization: Bearer your-jwt-token
```

## Commands

### Development Setup

To start the application locally, run the following command:

```bash
yarn dev
```

This will execute the following steps:

- `docker:up`: Builds and starts the backend using Docker.
- `docker:watch`: Streams logs to the console.

### First Time Setup

On the first run only, execute the following in a separate terminal window to seed the database:

```bash
yarn seed
```

### Other Useful Commands

- **Build the project**:
```bash
  yarn build
```

- **Stop the Docker containers**:
```bash
  yarn docker:stop
  ```

- **Access the Docker container shell**:
```bash
  yarn docker:bash
  ```

- **Run the application**:
```bash
  yarn start
  ```

- **Run tests**:
```bash
  yarn test
  ```

- **Run tests in watch mode**:
```bash
  yarn test:watch
  ```

### Development Command

To start the development environment with auto-reloading, use:
```bash
yarn start:dev
```

This command runs the application with `nodemon` and auto-fixes ESLint issues before running.
