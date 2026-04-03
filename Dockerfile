#### Stage BUILD ########################################################################################################
FROM node:22-alpine AS build

# Install tools, create app dir, add user and set rights
RUN set -ex && \
    mkdir -p /app

# Set work directory
WORKDIR /app

# copy package.json and lock file
COPY package*.json ./
ADD scripts /app/scripts

# Install Build tools
RUN npm ci --no-update-notifier --only=production

# Copy sources
COPY . .

# Build static with placeholder for encryption key
# The placeholder will be replaced at runtime by the entrypoint script in deployment
RUN API_ENCRYPTION_KEY=__ENCRYPTION_KEY_PLACEHOLDER__ npm run build && \
    npm run build:fonts && \
    npm run build:views

#### Stage RELEASE #####################################################################################################
FROM nginx:1.29.5-alpine AS RELEASE

# copy generated static site
COPY --from=build /app/public /usr/share/nginx/html

# copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set ownership (permissions will be adjusted by entrypoint in deployment)
RUN chown -R root:nginx /usr/share/nginx/html

EXPOSE 80
