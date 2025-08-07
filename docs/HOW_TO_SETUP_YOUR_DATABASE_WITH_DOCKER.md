# Run MySQL Container with `.env.example`

## Step 1: Make sure Docker is installed

If Docker is not installed, you can download it from the [official Docker website](https://www.docker.com/products/docker-desktop/).

---

## Step 2: Make sure you're in the folder that contains your `.env.example` file

## Step 3: Run the MySQL Docker container using environment variables for mysql

```bash
docker rm mysql-container  # elimina el contenedor anterior (si es necesario)
docker run -d \
  --name mysql-container \
  --env-file .env.mysql \
  -p 3306:3306 \
  mysql:8.0
``` 