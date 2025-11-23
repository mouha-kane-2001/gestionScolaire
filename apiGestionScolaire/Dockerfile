FROM php:8.2-fpm

# Installer les extensions nécessaires
RUN apt-get update && apt-get install -y \
    libpq-dev \
    zip unzip \
    git \
    curl \
    libzip-dev \
    && docker-php-ext-install pdo pdo_pgsql zip

# Installer Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copier tout le projet Laravel
COPY . .

# Installer les dépendances Laravel
RUN composer install --no-interaction --optimize-autoloader

# Donner des permissions
RUN chmod -R 775 storage bootstrap/cache

# Créer la clé application si elle n'existe pas
RUN if [ ! -f .env ]; then \
        cp .env.example .env && \
        php artisan key:generate; \
    fi

EXPOSE 9000

CMD ["php-fpm"]
