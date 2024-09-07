# base
FROM node:22.0 AS base

WORKDIR /usr/src/app

COPY package*.json ./
    
RUN npm install

COPY . .


# # for lint
# linting is showing some problem
# FROM base as linter

# WORKDIR /usr/src/app

# RUN npm run lint

# for build

FROM base as builder
# FROM linter as builder some problem with eslinter

WORKDIR /usr/src/app

RUN npm run build


# for production

FROM node:22.8-alpine3.20

WORKDIR /usr/src/app

COPY ["package*.json", ".env", "./"]

RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./

# Copy the .env file
# docker by default ignores copying files with .


EXPOSE 3001

ENTRYPOINT ["node","./server.js"]