#### Stage BUILD ########################################################################################################
FROM node:17.5.0-alpine3.15 AS build

# Install tools, create app dir, add user and set rights
RUN set -ex && \
    mkdir -p /app

# Set work directory
WORKDIR /app

# copy package.json and lock file
COPY package*.json ./

# Install Build tools
RUN npm ci --no-update-notifier --only=production

# Copy sources
COPY . .

# Build static
RUN npm run build && \
    npm run build:fonts && \
    npm run build:views

#### Stage RELEASE #####################################################################################################
FROM nginx:1.21.5-alpine AS RELEASE

# copy generated static site
COPY --from=build /app/public /usr/share/nginx/html

# make readonly to nginx
RUN chown -R root:nginx /usr/share/nginx/html && \
    chmod -R go-w /usr/share/nginx/html

EXPOSE 80
