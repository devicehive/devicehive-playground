FROM phusion/passenger-nodejs

# Set correct environment variables.
ENV HOME /root

# Use baseimage-docker's init process.
CMD ["/sbin/my_init"]

# Expose Nginx HTTP service
EXPOSE 80

# Enable nginx and remove the default site
RUN rm -f /etc/service/nginx/down \
    && rm /etc/nginx/sites-enabled/default

# copy playground website files
RUN curl -L https://github.com/devicehive/devicehive-playground/archive/master.tar.gz | tar -zxf- -C /tmp \
    && mv /tmp/devicehive-playground-master /home/app/playground \
    && cd /home/app/playground \
    && npm install . \
    && npm cache clean \
    && chown -R app:app /home/app/playground

# copy landing page website files
RUN curl -L https://github.com/devicehive/devicehive-landing-page/archive/master.tar.gz | tar -zxf- -C /tmp \
    && mv /tmp/devicehive-landing-page-master /home/app/landingpage \
    && cd /home/app/landingpage \
    && npm install . \
    && npm cache clean \
    && chown -R app:app /home/app/landingpage

# copy freeboard website files
RUN curl -L https://github.com/devicehive/freeboard/archive/master.tar.gz | tar -zxf- -C /tmp \
    && mkdir /home/app/freeboard \
    && mv /tmp/freeboard-master /home/app/freeboard/dashboard \
    && cd /home/app/freeboard/dashboard \
    && npm install . \
    && npm install -g grunt-cli \
    && grunt \
    && npm cache clean \
    && curl -L https://github.com/devicehive/devicehive-freeboard-datasource/archive/master.tar.gz | tar -zxf- -C /tmp \
    && rm -rf /home/app/freeboard/dashboard/plugins/devicehive-freeboard-datasource \
    && mv /tmp/devicehive-freeboard-datasource-master /home/app/freeboard/dashboard/plugins/devicehive-freeboard-datasource \
    && chown -R app:app /home/app/freeboard/dashboard

# register playground website in nginx
ADD playground.conf /etc/nginx/sites-enabled/playground.conf

# register landing page website in nginx
ADD landingpage.conf /etc/nginx/sites-enabled/landingpage.conf

# tweak nginx
ADD nginx.conf /etc/nginx/conf.d/nginx.conf
ADD passenger-env.conf /etc/nginx/main.d/passenger-env.conf
