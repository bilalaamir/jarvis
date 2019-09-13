FROM node:11.1.0
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install -g nodemon && npm install
EXPOSE 3000
CMD [ "npm", "start" ]