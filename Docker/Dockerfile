FROM phusion/passenger-nodejs

ARG SOURCE_REPOSITORY_URL
ARG SOURCE_BRANCH

# Set correct environment variables.
ENV HOME /root

# Use baseimage-docker's init process.
CMD ["/sbin/my_init"]

# Expose Nginx HTTP service
EXPOSE 8080

# Enable nginx and remove the default site
RUN rm -f /etc/service/nginx/down \
    && rm /etc/nginx/sites-enabled/default

# copy playground website files
RUN curl -L https://github.com/devicehive/devicehive-playground/archive/master.tar.gz | tar -zxf- -C /tmp \
RUN curl -L "${SOURCE_REPOSITORY_URL:-https://github.com/devicehive/devicehive-playground}/archive/${SOURCE_BRANCH:-master}.tar.gz" | tar -zxf- -C /tmp \
    && mv /tmp/devicehive-playground-master /home/app/playground \
    && cd /home/app/playground \
    && npm install . \
    && npm cache clean \
    && chown -R app:app /home/app/playground

# register playground website in nginx
ADD playground.conf /etc/nginx/sites-enabled/playground.conf
