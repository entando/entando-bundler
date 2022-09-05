FROM node:14.17-alpine

RUN apk add --no-cache openssh-client git && \
    mkdir -p /root/.ssh && \
    touch /root/.ssh/known_hosts

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY . .
# COPY ./lib ./
# COPY ./bin ./
# COPY docker-entrypoint.sh ./
ENV REGISTRY=http://registry.npmjs.org
#ENV VCS_SERVER=github.com
#ENV GIT_REPOSITORY=git@github.com:entando/project.git
#ENV NAMESPACE=entando
#ENV BUNDLE_NAME=mio-bundle
#ENV DRY_RUN=--dry-run

#ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh"]

CMD ssh-agent sh -c "ssh-add ~/.my-key; ssh-keyscan $VCS_SERVER >> ~/.ssh/known_hosts 2>/dev/null; node ./bin/index.js from-git --repository=$GIT_REPOSITORY --namespace=$NAMESPACE --name=$BUNDLE_NAME $DRY_RUN"
