FROM node:18-alpine
WORKDIR /app
COPY . /app/
RUN yarn && \
  yarn build
CMD [ "npm", "run", "start:prod" ]