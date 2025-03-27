FROM node:20-alpine as builder

WORKDIR /usr/src/app

COPY . .

RUN npm install -g npm

RUN npm install
 
RUN npm install run build

EXPOSE 3500

CMD ["npm", "run", "start"]