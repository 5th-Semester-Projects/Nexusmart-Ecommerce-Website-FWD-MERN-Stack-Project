# NexusMart API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get User Profile

```http
GET /auth/me
Authorization: Bearer <token>
```

### Products

#### Get All Products

```http
GET /products?page=1&limit=12&category=electronics&minPrice=100&maxPrice=1000&sort=price_asc
```

Query Parameters:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)
- `keyword` (optional): Search keyword
- `category` (optional): Category ID
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `minRating` (optional): Minimum rating
- `brand` (optional): Brand name
- `sort` (optional): Sort option (price_asc, price_desc, rating, newest, popular)

#### Get Single Product

```http
GET /products/:id
```

#### Create Product (Admin/Seller only)

```http
POST /products
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- name: Product name
- description: Product description
- price: Product price
- category: Category ID
- stock: Stock quantity
- images: Image files (multiple)
- videos: Video files (optional)
- model3D: 3D model file (optional)
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication endpoints: 5 requests per 15 minutes
- Password reset: 3 requests per hour

## Error Response Format

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Success Response Format

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```
