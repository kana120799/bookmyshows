
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
RUN rm -rf ./src ./tests
 
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public  
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/prisma ./prisma
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]