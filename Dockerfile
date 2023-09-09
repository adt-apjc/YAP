# stage1 - build react app first 
FROM node:16.14-slim as builder
WORKDIR /app
COPY ./package.json /app
RUN npm install
COPY . /app
RUN npm run build

# stage 2 - build the final image and copy the react build files
FROM nginx
COPY --from=builder /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/conf.d
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]