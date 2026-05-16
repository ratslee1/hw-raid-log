FROM nginx:alpine
COPY index.html login.html log.html raid.html /usr/share/nginx/html/
EXPOSE 80
