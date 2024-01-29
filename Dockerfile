FROM node as builder 

COPY ./ ./
RUN npm install
RUN npm i --save @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome
RUN npm run build

FROM nginx
COPY --from=builder ./build /usr/share/nginx/html