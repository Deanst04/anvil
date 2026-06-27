FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build
EXPOSE 3000
CMD [ "npm", "start" ]