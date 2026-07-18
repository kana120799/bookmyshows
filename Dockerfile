
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
 # no in this copy local present node-module not copy bcz i put this folder in .dockerignore file
COPY . .         
RUN npx prisma generate
RUN npm run build
# Remove unnecessary files.
RUN rm -rf ./app ./tests ./components ./lib ./tsconfig.json
 
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public  
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/prisma ./prisma
# node_modules from builder stage,includes both dependencies and devDependencies. with this we install dependencies listed in package.json. 
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]


