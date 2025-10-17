#!/bin/bash
# Entrypoint script for Laravel application with FrankenPHP

set -e

echo "Starting Laravel application with FrankenPHP..."

# Wait for database to be ready (if DATABASE_URL is set)
if [ -n "$DB_HOST" ] && [ "$DB_CONNECTION" != "sqlite" ]; then
    echo "Waiting for database at $DB_HOST:${DB_PORT:-3306}..."
    
    max_attempts=30
    attempt=0
    
    until nc -z "$DB_HOST" "${DB_PORT:-3306}" 2>/dev/null || [ $attempt -eq $max_attempts ]; do
        attempt=$((attempt + 1))
        echo "Database not ready yet... attempt $attempt/$max_attempts"
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        echo "Warning: Could not connect to database after $max_attempts attempts"
    else
        echo "Database is ready!"
    fi
fi

# Run migrations (if AUTO_MIGRATE is set)
if [ "$AUTO_MIGRATE" = "true" ]; then
    echo "Running database migrations..."
    php artisan migrate --force --no-interaction
fi

# Run seeders (if AUTO_SEED is set)
if [ "$AUTO_SEED" = "true" ]; then
    echo "Running database seeders..."
    php artisan db:seed --force --no-interaction
fi

# Clear and cache configurations
echo "Optimizing Laravel application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ensure storage link exists
if [ ! -L /app/public/storage ]; then
    echo "Creating storage symlink..."
    php artisan storage:link
fi

echo "Laravel application ready!"
echo "Starting FrankenPHP with worker mode..."

# Execute the main command
exec "$@"
