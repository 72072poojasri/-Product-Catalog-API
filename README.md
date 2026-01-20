# Product Catalog API

A production-ready REST API for managing a product catalog, built using Node.js and Express.
This project implements full CRUD operations with PostgreSQL, Redis caching, rate limiting,
global error handling, Swagger documentation, and Docker-based setup.

---

## 🚀 Features

- Create, read, update, and delete products (CRUD)
- Get all products with pagination (limit & offset)
- Get single product by ID
- PostgreSQL for persistent storage
- Redis caching for GET products API
- Cache invalidation on create, update, and delete
- Rate limiting to prevent API abuse
- Global error handling middleware
- Swagger (OpenAPI) documentation
- Fully Dockerized using Docker Compose

---

## 🛠️ Tech Stack

- Backend: Node.js, Express
- Database: PostgreSQL
- Cache: Redis
- API Documentation: Swagger (OpenAPI)
- Containerization: Docker, Docker Compose

---

## 📂 Project Structure

product-catalog-api/
│── src/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── utils/
│   └── app.js
│── config/
│── tests/
│── docker-compose.yml
│── Dockerfile
│── init.sql
│── .env.example
│── README.md

---

## ⚙️ Setup & Run Instructions

### Prerequisites
- Docker
- Docker Compose

### Run the application

docker compose up --build

The server will start at:
http://localhost:8080

---

## 📌 API Endpoints

### Health Check
GET /health

---

### Create Product
POST /api/v1/products

Request Body:
{
  "name": "iPhone 15",
  "description": "Apple mobile phone",
  "price": 79999,
  "stock_quantity": 10
}

---

### Get All Products (Pagination)
GET /api/v1/products?limit=10&offset=0

---

### Get Product by ID
GET /api/v1/products/{productId}

---

### Update Product
PUT /api/v1/products/{productId}

Request Body:
{
  "price": 75000,
  "stock_quantity": 15
}

---

### Delete Product
DELETE /api/v1/products/{productId}

Response:
204 No Content

---

## 📘 Swagger API Documentation

Swagger UI is available at:
http://localhost:8080/api/v1/docs

You can:
- View all endpoints
- Test APIs directly from the browser
- Inspect request and response schemas

---

## 🔐 Rate Limiting

- Limits number of requests per client within a time window
- Protects APIs from abuse
- Configurable via environment variables

---

## 🧠 Error Handling

- Centralized global error handler
- Proper HTTP status codes (400, 404, 500)
- Consistent and clean error responses

---

## 📦 Environment Variables

Example .env.example:

DATABASE_URL=postgres://user:password@localhost:5432/products_db
REDIS_URL=redis://localhost:6379
APP_PORT=8080
CACHE_TTL_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=50
RATE_LIMIT_WINDOW_SECONDS=60

---

## 🧪 Testing

- APIs tested using Swagger UI
- APIs tested using Postman

---

## ✅ Project Status

✔ Full CRUD APIs implemented  
✔ Redis caching with invalidation  
✔ Dockerized setup  
✔ Swagger documentation enabled  
✔ Production-style backend behavior  

---

## 👤 Author

Poojasri Kurru

---

## 📜 License

This project is created for educational and evaluation purposes.
