FROM node:14.17-alpine

ENV NPM_CONFIG_PREFIX_HOME=$HOME/.npm-global \
    PATH=$HOME/node_modules/.bin/:$HOME/.npm-global/bin/:$PATH

RUN apk add --no-cache openssh-client git && \
    mkdir -p /home/node/.ssh && \
    mkdir -p /home/node/app && \
    touch /home/node/.ssh/known_hosts

WORKDIR /home/node/app
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
RUN chown -R 1000:0 /home/node && chmod -R ug+rwx /home/node/app

USER 1000

CMD ssh-agent sh -c "ssh-add ~/.my-key; ssh-keyscan $VCS_SERVER >> ~/.ssh/known_hosts 2>/dev/null; node ./bin/index.js from-git --repository=$GIT_REPOSITORY --namespace=$NAMESPACE --name=$BUNDLE_NAME $DRY_RUN"
