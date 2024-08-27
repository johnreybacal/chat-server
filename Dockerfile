FROM node:20-bookworm as build
WORKDIR /app

COPY . /app

RUN npm ci
RUN npm install typescript -g
RUN npm run build

EXPOSE 4000
CMD npm run serve
