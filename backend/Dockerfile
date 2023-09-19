FROM node:16.14-alpine

WORKDIR '/app'

COPY ./package.json /app
RUN npm install
COPY . /app
RUN npm run build

EXPOSE 5001
ENTRYPOINT [ "npm", "run" ]
CMD ["start"]