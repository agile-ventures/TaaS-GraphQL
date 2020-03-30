FROM node:13.12.0-alpine3.11

# Default Env variables
ENV PORT 3000
ENV HOST 0.0.0.0
ENV TEZOS_NODE https://api.tezos.org.ua 
ENV MAX_BLOCKS 5
ENV ENABLE_GRAPHQL_PLAYGROUND=true
ENV ENABLE_GHRAPHQL_INTROSPECTION=true

WORKDIR /home/node/app
COPY package*.json ./
ENV NODE_ENV=production

#RUN npm ci --only=production
RUN npm i
COPY . .
RUN npm run build
USER node
COPY /dist .
EXPOSE 3000
CMD [ "npm", "run", "start" ]