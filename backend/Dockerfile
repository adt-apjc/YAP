FROM node:20.9-slim

WORKDIR '/app'

COPY ./package.json /app
RUN npm install
COPY . /app
RUN npm run build

EXPOSE 5001
ENTRYPOINT [ "npm", "run" ]
CMD ["start"]