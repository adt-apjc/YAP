# stage1 - build react app first 
FROM node:16.14-slim as builder
WORKDIR /app
COPY ./package.json /app
RUN npm install
COPY . /app
EXPOSE 3000
CMD ["npm", "start"]