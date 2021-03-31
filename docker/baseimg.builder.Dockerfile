
FROM registry-vpc.cn-beijing.aliyuncs.com/laiye-devops/alinode-kube:5.13.0

COPY ./package.json .
COPY ./yarn.lock .

RUN NODE_ENV='development' yarn \
  && yarn cache clean \
  && rm -rf /tmp/*
