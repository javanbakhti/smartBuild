## SmartEntry7 Backend

### Environment Variables

Create a `.env` file in this directory with the following keys:

```
PORT=5500
MONGODB_URI=mongodb://127.0.0.1:27017/smartentry7
JWT_SECRET=replace_me_with_a_long_random_string
CORS_ORIGIN=http://127.0.0.1:3000,http://localhost:3000
```

Adjust `CORS_ORIGIN` if your frontend runs on a different host.

### Development

```bash
cd server
npm install
npm run dev
```

The API will be available at `http://127.0.0.1:5500/api`.

### Running MongoDB via Docker

A `docker-compose.yml` is provided to spin up MongoDB quickly:

```bash
cd server
docker compose up -d
```

This starts a Mongo 6 container on port `27017` with a named volume `mongo-data`.  
Update your `.env` to point at the container URI, for example:

```
MONGODB_URI=mongodb://smartentry7:smartentry7pass@127.0.0.1:27017/smartentry7?authSource=admin
```

Stop the container with `docker compose down` (add `-v` to remove the data volume if you want a clean slate).

