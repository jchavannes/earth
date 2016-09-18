FROM phusion/baseimage

MAINTAINER Jason Chavannes <jason.chavannes@gmail.com>

RUN apt-get update
RUN apt-get -y upgrade
RUN apt-get -y install apache2 php5 libapache2-mod-php5 php5-mysql

RUN a2enmod php5
RUN a2enmod rewrite

CMD /usr/sbin/apache2ctl -D FOREGROUND

ADD apache.conf /etc/apache2/sites-available/000-default.conf
