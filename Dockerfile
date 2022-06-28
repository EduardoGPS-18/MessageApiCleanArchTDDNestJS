FROM node:18-alpine

WORKDIR /app

COPY . .

RUN yarn && \
  yarn build

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]
