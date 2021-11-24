FROM node:14.18-alpine

RUN apk add git

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY . .
# COPY ./lib ./
# COPY ./bin ./
# COPY docker-entrypoint.sh ./
ENV REGISTRY=http://registry.npmjs.org

ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh"]
