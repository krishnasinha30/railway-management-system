# Postman guide for Railway Management System

This guide explains how to use the Postman collection for the Railway Management System API.

## 1. Import the collection

1. Open Postman.
2. Click Import.
3. Choose the file:
   `postman/Railway-Management-System.postman_collection.json`
4. The collection will appear in your Postman workspace.

## 2. Set the environment variables

Create a Postman environment with these variables:

- `baseUrl` = `http://localhost:5000/api`
- `adminToken` = empty
- `employeeToken` = empty
- `passengerToken` = empty
- `trainId` = empty
- `stationId` = empty
- `bookingId` = empty
- `userId` = empty
- `pnrNumber` = empty

You can either set them manually or they will be filled automatically by the test scripts in the login and data requests.

## 3. Start the backend server

Before running requests, start the API server:

```bash
cd server
npm install
npm start
```

The server should run on:

```text
http://localhost:5000
```

## 4. Login and save tokens

Use the requests in the Authentication folder:

1. Login as passenger
2. Login as employee
3. Login as admin

Each login request has a Postman test script that saves the JWT token into the matching variable:

- `passengerToken`
- `employeeToken`
- `adminToken`

These tokens are used by later requests that require authentication.

## 5. Run the collection in order

For the best flow, run the requests in this order:

1. Authentication
2. Stations
3. Trains
4. Bookings
5. PNR
6. Wallet
7. Food Orders
8. Announcements
9. Employee Tasks
10. Admin Users
11. Dashboards
12. Security Testing

Some requests automatically set variables like:

- `stationId`
- `trainId`
- `bookingId`
- `pnrNumber`
- `userId`

This is important because later API calls depend on those values.

## 6. How the tests work

Each request has a Postman test script. The script checks:

- the expected HTTP status code
- whether the `success` field exists
- whether the expected `message` or `data` is returned

If a request fails, Postman will mark it as failed so you can immediately spot problems in the API.

## 7. What these requests demonstrate

### JWT authentication

Examples:

- Login as passenger
- Login as employee
- Login as admin
- Get current user
- Missing JWT
- Invalid JWT

These check that the JWT token is generated and correctly attached in the `Authorization` header.

### Role-based security

Examples:

- Passenger denied admin route
- Employee denied admin route
- Passenger restriction for another user PNR
- Blocked user request

These demonstrate that the backend checks the user's `role` and blocks unauthorized access.

### Validation

Examples:

- Invalid login
- Invalid form input

These confirm that validation is working and the server returns meaningful error responses.

## 8. Common problems

### Server not running

Make sure the backend is started before calling the collection.

### Variables empty

If `adminToken`, `employeeToken`, or `passengerToken` is blank, run the matching login request first.

### 401 or 403 errors

Check:

- token exists in the environment
- token is valid
- correct role is used for the request
- user is not blocked

## 9. Security testing summary

The Security Testing folder is designed to prove the following:

- missing JWT is rejected
- invalid JWT is rejected
- passenger cannot access admin APIs
- employee cannot access admin APIs
- blocked users are denied access
- invalid form submissions return validation errors

This matches the academic requirement for JWT and role-based authorization validation.
