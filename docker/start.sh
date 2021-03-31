#!/bin/sh

if [[ x"$ENV" == x"test" ]];then
    CONF_NAME="test.conf"
else
    CONF_NAME="online.conf"
fi

npm run pm2 --conf=/apps/conf/${CONF_NAME}
