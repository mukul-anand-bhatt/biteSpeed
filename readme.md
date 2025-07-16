# Bitespeed Identity Reconciliation Service

## Overview
This service helps identify and link customer contact information across multiple purchases, creating a unified customer identity when email or phone number matches are found.

**Base URL**: `https://bitespeed-k1va.onrender.com`

## API Endpoint

### Identify Contact
`POST /identify`

#### Request Headers
```
Content-Type: application/json
```

#### Sample Test Cases

### 1. Brand New Contact (Primary)
```json
{
    "email": "newuser@example.com",
    "phoneNumber": "1111111111"
}
```

### 2. Same Email, New Phone (Secondary)
```json
{
    "email": "existing@example.com",
    "phoneNumber": "2222222222"
}
```

### 3. Same Phone, New Email (Secondary)
```json
{
    "email": "newemail@example.com",
    "phoneNumber": "1111111111"
}
```

### 4. Bridge Two Existing Contacts (Merge)
```json
{
    "email": "user1@example.com",
    "phoneNumber": "2222222222"
}
```

### 5. Email Only
```json
{
    "email": "emailonly@example.com"
}
```

### 6. Phone Only
```json
{
    "phoneNumber": "9999999999"
}
```

### 7. Duplicate Submission
```json
{
    "email": "duplicate@example.com",
    "phoneNumber": "1212121212"
}
```

### 8. Update Existing Contact (Add Info)
```json
{
    "phoneNumber": "1313131313",
    "email": "addedlater@example.com"
}
```

### Error Cases:

#### Empty Request
```json
{}
```

#### Null Values
```json
{
    "email": null,
    "phoneNumber": "1231231231"
}
```

## Response Structure
Successful responses will follow this format:
```json
{
    "contact": {
        "primaryContatctId": 1,
        "emails": ["primary@example.com", "secondary@example.com"],
        "phoneNumbers": ["1111111111", "2222222222"],
        "secondaryContactIds": [23, 45]
    }
}
```

## Deployment Information
- **Platform**: Render
- **Runtime**: Node.js
- **Database**: PostgreSQL

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up database connection in `.env` file
4. Run migrations: `npm run prisma:migrate`
5. Start server: `npm start`

## Testing Tips
1. Use the test cases above in Postman/Insomnia
2. Verify responses match expected structure
3. Check logs for any errors during testing
