# Promocode API

A REST API for a promocode system built with Node.js, TypeScript, NestJS, Prisma, and PostgreSQL.

## Features

- **CRUD Operations**: Create, view, list, and delete promocodes.
- **Activation**: Link a promocode to a user's email.
- **Limits**: Each email can activate a specific promocode only once. Promocodes cannot be activated beyond their limit.
- **Race Condition Handling**: Uses database-level locking (`SELECT ... FOR UPDATE`) to prevent race conditions during concurrent activations.
- **Validation**: Strict input validation using `class-validator`.
- **Error Handling**: Global exception filter returning appropriate HTTP statuses (400, 404, 409, 422).

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) and Docker Compose (for the database)

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Clone the repository

```bash
git clone <repository-url>
cd promocode-api
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Set up environment variables

Copy the example environment file to create your local `.env` file:

```bash
cp .env.example .env
```

### 4. Start the database

Start the PostgreSQL container in the background:

```bash
yarn db:up
```

### 5. Run migrations and seed the database

Apply the database schema and populate it with initial mock data (valid, expired, and exhausted promocodes):

```bash
yarn db:setup
```

*(Note: If you ever need to wipe the database and reapply migrations and seeds, run `yarn db:reset`)*

### 6. Start the application

Run the application in development mode:

```bash
yarn start:dev
```

The server will start on `http://localhost:3000`.

## API Documentation

The API documentation is generated using Swagger. Once the application is running, you can view the interactive API docs at:

**[http://localhost:3000/docs](http://localhost:3000/docs)**

## Key Implementation Details

- **Race Condition Prevention**: The activation endpoint (`POST /api/v1/promocodes/:id/activate`) uses a Prisma `$transaction` with a raw SQL `SELECT * FROM "promocodes" WHERE id = $1 FOR UPDATE`. This locks the specific promocode row during the transaction, ensuring that concurrent requests do not exceed the activation limit.
- **Validation**: All incoming data is validated using `class-validator` decorators in DTOs. The global `ValidationPipe` is configured to throw a `422 Unprocessable Entity` error when validation fails (e.g., invalid email format, discount not between 1 and 100).
- **Unique Activations**: The database schema enforces a unique constraint on `[promocodeId, email]` in the `Activation` model, preventing the same email from activating the same promocode multiple times. This throws a `409 Conflict` error if attempted.
