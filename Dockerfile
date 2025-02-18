FROM node:20-alpine as builder

WORKDIR /usr/src/app


COPY . .

RUN npm install -g npm

RUN npm install
 
RUN npx prisma generate

RUN npm run start:dev

RUN npm install run build

EXPOSE 3500

CMD [ "npm", "run", "start:dev" ]