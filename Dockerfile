FROM node:18-alpine
WORKDIR /app
COPY . /app/
RUN yarn && \
  yarn build
EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]