# Troubleshooting Guide

## 500 Internal Server Error on Signup

If you're getting a 500 error when trying to sign up, check these:

### 1. Check your `.env` file

Make sure `/var/www/smartentry7/server/.env` exists and has:

```env
PORT=5500
MONGODB_URI=mongodb://127.0.0.1:27017/smartentry7
JWT_SECRET=your-random-secret-key-here
```

**Important:** `JWT_SECRET` is REQUIRED. Generate a random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Check MongoDB is running

```bash
# If using Docker:
cd /var/www/smartentry7/server
docker compose up -d

# Or check if MongoDB service is running:
sudo systemctl status mongod
```

### 3. Check backend logs

When you run `npm run dev`, you should see:
- ✅ `MongoDB connected: ...`
- ✅ `SmartEntry7 API running on port 5500`

If you see errors, they will now be logged to the console.

### 4. Test the API directly

```bash
curl -X POST http://127.0.0.1:5500/api/managers/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Manager",
    "email": "test@example.com",
    "password": "test123",
    "buildingUid": "TEST-001"
  }'
```

This will show you the exact error message.

### 5. Common Issues

- **Missing JWT_SECRET**: Backend will crash when generating tokens
- **MongoDB not running**: Connection will fail
- **Wrong MONGODB_URI**: Check your connection string matches your setup
- **CORS blocking**: Check browser console for CORS errors

