# Dockerfile for Laravel + React + Inertia with FrankenPHP Worker Mode
# Multi-stage build for optimized production image

# Stage 1: Build frontend assets
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --prefer-offline --no-audit

# Copy frontend source files
COPY resources ./resources
COPY public ./public
COPY vite.config.ts tsconfig.json components.json ./
COPY postcss.config.js tailwind.config.js eslint.config.js .prettierrc .prettierignore ./

# Build production assets
RUN npm run build

# Stage 2: Production image with FrankenPHP
FROM dunglas/frankenphp:1-php8.3-alpine AS production

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    bash \
    curl \
    git \
    icu-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    libzip-dev \
    oniguruma-dev \
    postgresql-dev \
    sqlite-dev \
    mysql-client \
    && docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
        bcmath \
        exif \
        gd \
        intl \
        mbstring \
        opcache \
        pdo_mysql \
        pdo_pgsql \
        pdo_sqlite \
        pcntl \
        zip

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy composer files
COPY composer.json composer.lock ./

# Install PHP dependencies (production only)
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader

# Copy application code
COPY . .

# Copy built frontend assets from previous stage
COPY --from=frontend-builder /app/public/build ./public/build

# Set proper permissions
RUN chown -R www-data:www-data /app \
    && chmod -R 755 /app/storage /app/bootstrap/cache

# Run Laravel optimizations
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache \
    && php artisan event:cache

# Configure PHP for production
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Copy custom PHP configuration
COPY docker/php.ini "$PHP_INI_DIR/conf.d/99-custom.ini"

# Copy Caddyfile for FrankenPHP configuration
COPY docker/Caddyfile /etc/caddy/Caddyfile

# Create entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Expose port
EXPOSE 80
EXPOSE 443

# Set user
USER www-data

# Entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Start FrankenPHP in worker mode
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
