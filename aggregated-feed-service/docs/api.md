# API Documentation

## User Management API

### Get Followed Users
- **Endpoint**: `GET /api/followed-users`
- **Description**: Retrieve the list of followed users
- **Response**: Returns an array of followed users

### Add Followed User
- **Endpoint**: `POST /api/followed-users`
- **Description**: Add a new user to follow
- **Request Body**:
  ```json
  {
    "profileUrl": "string" // User profile URL
  }
  ```
- **Response**: Returns the newly added followed user information
- **Error**: Returns 400 error if profileUrl is not provided

### Remove Followed User
- **Endpoint**: `DELETE /api/followed-users/:userId`
- **Description**: Unfollow a specific user
- **Parameters**:
  - `userId`: ID of the user to unfollow
- **Response**: Returns the operation result

## Platform API

### Get Platforms
- **Endpoint**: `GET /api/platforms`
- **Description**: Retrieve the list of all supported platforms
- **Response**: Returns an array of platforms

## Feed API

### Get Feed Items
- **Endpoint**: `GET /api/feed`
- **Description**: Retrieve aggregated feed content
- **Query Parameters**:
  - `platforms`: Platform filter (optional, comma-separated string)
  - `timeRange`: Time range filter (optional)
  - `page`: Page number (optional, default: 1)
  - `pageSize`: Items per page (optional, default: 20)
- **Response**: Returns an array of FeedItemDTO objects

## General Information

All APIs follow RESTful design principles and use JSON format for data exchange. Error responses include appropriate HTTP status codes and error messages.

### Response Format
Successful responses are returned with HTTP status code 200 (OK) and contain the requested data in JSON format.

### Error Format
Error responses follow this structure:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error 