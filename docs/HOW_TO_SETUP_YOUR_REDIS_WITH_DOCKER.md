# Run Redis Container with `.env.redis`

## Step 1: Make sure Docker is installed
If Docker is not installed, you can download it from the [official Docker website](https://www.docker.com/products/docker-desktop/).

---

## Step 2: Create your `.env.redis` file
Create a `.env.redis` file in your project root with the following variables:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password_here
REDIS_DB=0
```

---

## Step 3: Make sure you're in the folder that contains your `.env.redis` file

---

## Step 4: Run the Redis Docker container using environment variables

```bash
docker rm redis-container  # elimina el contenedor anterior (si es necesario)
docker run -d \
  --name redis-container \
  --env-file .env.redis \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --requirepass "${REDIS_PASSWORD}"
```

### Alternative: Run Redis without password (for development only)
```bash
docker rm redis-container  # elimina el contenedor anterior (si es necesario)
docker run -d \
  --name redis-container \
  -p 6379:6379 \
  redis:7-alpine
```

---

## Step 5: Verify Redis is running

### Check container status:
```bash
docker ps
```

### Test Redis connection:
```bash
docker exec -it redis-container redis-cli ping
```

If Redis is running correctly, you should see `PONG` as response.

### Test with password (if you set one):
```bash
docker exec -it redis-container redis-cli -a your_secure_password_here ping
```

---

## Step 6: Configure your NestJS application

Make sure your `.env` file (or wherever you store your environment variables) contains:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password_here
REDIS_DB=0
```

Your existing `RedisConfig` service will automatically pick up these environment variables.

---

## Useful Docker Commands

### Stop Redis container:
```bash
docker stop redis-container
```

### Start Redis container:
```bash
docker start redis-container
```

### View Redis logs:
```bash
docker logs redis-container
```

### Remove Redis container:
```bash
docker rm redis-container
```

### Access Redis CLI:
```bash
docker exec -it redis-container redis-cli
```

---

## Notes

- **Redis 7-alpine**: Uses the lightweight Alpine Linux image for better performance
- **Port 6379**: Standard Redis port
- **Password protection**: Recommended for production environments
- **Data persistence**: By default, Redis data will be lost when container is removed. Add `-v redis-data:/data` to persist data

### For production with data persistence:
```bash
docker run -d \
  --name redis-container \
  --env-file .env.redis \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:7-alpine \
  redis-server --requirepass "${REDIS_PASSWORD}" --appendonly yes
```