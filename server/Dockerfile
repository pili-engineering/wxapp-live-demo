FROM node:9.0

WORKDIR /app/wxapp-live

COPY ./ /app/wxapp-live

EXPOSE 8686

RUN npm install -g cnpm --registry=https://registry.npmmirror.com \
  && cnpm install \
  && cnpm install pm2 -g \
  && cd ./PLService \
  && cnpm install \
  && cd ../

CMD ["pm2-docker", "index.js"]
