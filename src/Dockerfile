FROM node:13-alpine

LABEL maintainer "Ojaswa Sharma <https://github.com/ojaswa1942>"

RUN apk --no-cache -v --update add curl jq bash vim

WORKDIR /app

COPY . .
RUN yarn

EXPOSE 3000

ENTRYPOINT ["yarn", "start"] 