FROM node:20-alpine as builder

WORKDIR /usr/src/app

RUN apk add --no-cache bash make gcc g++ python3 openssl

COPY package*.json ./

COPY . .

RUN npx prisma generate

RUN npm install -g npm

RUN npm install
 
RUN npm run start:dev

RUN npm install run build

RUN npm install -g npm && \
    npm install --production
    
EXPOSE 3500

ENTRYPOINT ["./start.sh"]