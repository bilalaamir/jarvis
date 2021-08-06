FROM node:11.1.0
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
#COPY google-api-credentials.json google-api-credentials.json ##uncomment for local docker instance
ENV GOOGLE_APPLICATION_CREDENTIALS "/usr/src/app/google-api-credentials.json"
RUN npm install -g nodemon && npm install
EXPOSE 3000
CMD [ "npm", "start" ]