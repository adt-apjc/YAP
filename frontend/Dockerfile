# stage1 - build react app first 
FROM node:16.14-slim as builder
WORKDIR /app
COPY ./package.json /app
RUN npm install
COPY . /app
VOLUME ./my-public-assets /app/public/assets
EXPOSE 3000
CMD ["npm", "start"]