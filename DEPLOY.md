# Deployment Guide — Turn14 Auto Parts Catalog on VPS (Hostinger)

Complete step-by-step instructions to deploy the application on a Hostinger VPS (Ubuntu/Debian).

---

## 1. Initial VPS Setup

### Connect to your VPS via SSH

```bash
ssh root@YOUR_VPS_IP
```

### Update the system

```bash
apt update && apt upgrade -y
```

### Create a non-root user (recommended)

```bash
adduser deployer
usermod -aG sudo deployer
su - deployer
```

---

## 2. Install Docker

```bash
# Install prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker's GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add user to docker group (no sudo needed for docker commands)
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

---

## 3. Clone the Repository

```bash
cd /home/deployer
git clone <YOUR_REPO_URL> turn14-catalog
cd turn14-catalog
```

---

## 4. Configure Environment Variables

```bash
cp .env.example .env
nano .env
```

Edit the following values:

```env
# REQUIRED: Your Turn14 API credentials
TURN14_CLIENT_ID=your_actual_client_id
TURN14_CLIENT_SECRET=your_actual_client_secret
TURN14_API_BASE=https://api.turn14.com/v1
TURN14_ENV=production

# REQUIRED: Set a strong database password
POSTGRES_PASSWORD=your_strong_password_here
DATABASE_URL=postgresql://turn14user:your_strong_password_here@postgres:5432/turn14catalog

# Set your domain (or leave as-is for IP-based access)
DOMAIN=your-domain.com
```

Save and exit (Ctrl+X, Y, Enter).

---

## 5. Build and Start Containers

```bash
# Build all images and start services
docker compose up -d --build

# Verify all containers are running
docker compose ps

# Check logs for any startup errors
docker compose logs -f --tail=50
```

Expected output of `docker compose ps`:

```
NAME                    STATUS
turn14-catalog-postgres    Up (healthy)
turn14-catalog-backend     Up
turn14-catalog-frontend    Up
turn14-catalog-nginx       Up
```

---

## 6. Run Initial Data Sync

The database is created automatically. Now sync data from Turn14:

```bash
# Step 1: Sync brands and full catalog (may take hours for large catalogs)
docker compose exec backend node src/jobs/runSync.js catalog

# Step 2: Sync inventory levels
docker compose exec backend node src/jobs/runSync.js inventory

# Step 3: Sync pricing data
docker compose exec backend node src/jobs/runSync.js pricing

# Step 4: Sync vehicle fitment data (largest dataset, may take several hours)
docker compose exec backend node src/jobs/runSync.js fitment

# Step 5: Refresh materialized views
docker compose exec backend node src/jobs/runSync.js refresh-views
```

> **TIP**: For the initial sync of a large catalog, you can run these in a `screen` or `tmux` session so they continue if your SSH disconnects.

```bash
# Using screen
sudo apt install -y screen
screen -S sync
docker compose exec backend node src/jobs/runSync.js catalog
# Detach: Ctrl+A, D
# Reattach: screen -r sync
```

---

## 7. Verify the Application

```bash
# Check backend health
curl http://localhost:3001/api/health

# Check products endpoint
curl http://localhost:3001/api/products?limit=5

# Check via Nginx (port 80)
curl http://localhost/api/health
```

Open in browser: `http://YOUR_VPS_IP`

---

## 8. Set Up Domain & SSL (Optional but Recommended)

### Point your domain to VPS

In your domain registrar's DNS settings, create:
- `A` record: `your-domain.com` → `YOUR_VPS_IP`
- `A` record: `www.your-domain.com` → `YOUR_VPS_IP`

### Install Certbot for Let's Encrypt SSL

```bash
sudo apt install -y certbot

# Stop nginx temporarily
docker compose stop nginx

# Get certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Restart nginx
docker compose start nginx
```

Then update `nginx/nginx.conf` to include SSL configuration and mount the certificate files via docker-compose volumes.

---

## 9. Firewall Configuration

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

---

## 10. Monitoring & Maintenance

### View logs

```bash
# All services
docker compose logs -f --tail=100

# Specific service
docker compose logs -f backend
docker compose logs -f postgres
```

### Check sync status

```bash
curl http://localhost:3001/api/sync/status | python3 -m json.tool
```

### Manual sync

```bash
# Trigger via API
curl -X POST http://localhost:3001/api/sync/inventory

# Trigger via CLI
docker compose exec backend node src/jobs/runSync.js inventory
```

### Database backup

```bash
# Create backup
docker compose exec postgres pg_dump -U turn14user turn14catalog > backup_$(date +%Y%m%d).sql

# Restore backup
cat backup_20260309.sql | docker compose exec -T postgres psql -U turn14user turn14catalog
```

### Update application

```bash
cd /home/deployer/turn14-catalog
git pull origin main
docker compose up -d --build
```

### Restart services

```bash
docker compose restart
# or specific service
docker compose restart backend
```

---

## 11. Performance Tuning

### PostgreSQL memory (for VPS with 4GB+ RAM)

Add to `docker-compose.yml` under postgres service:

```yaml
command: >
  postgres
  -c shared_buffers=1GB
  -c effective_cache_size=2GB
  -c work_mem=16MB
  -c maintenance_work_mem=256MB
```

### Increase Node.js memory (if needed)

Add to backend service environment:

```yaml
environment:
  - NODE_OPTIONS=--max-old-space-size=1024
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Container won't start | `docker compose logs <service>` |
| Database connection error | Check `DATABASE_URL` in `.env`, verify postgres is healthy |
| Turn14 API 401 | Verify `TURN14_CLIENT_ID` and `TURN14_CLIENT_SECRET` |
| Turn14 API 429 | Rate limited — the app retries automatically |
| Port 80 in use | `sudo lsof -i :80` and stop conflicting service |
| Out of disk space | `docker system prune -a` to clean unused images |
