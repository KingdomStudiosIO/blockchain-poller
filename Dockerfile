FROM node:20

WORKDIR /app
COPY package*.json /app/

RUN npm ci

COPY index.js /app/
COPY src /app/src

ENTRYPOINT ["node", "index.js"]
