FROM node:12.14

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY . .
# COPY ./lib ./
# COPY ./bin ./
# COPY docker-entrypoint.sh ./
ENV REGISTRY=http://registry.npmjs.org

ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh"]

