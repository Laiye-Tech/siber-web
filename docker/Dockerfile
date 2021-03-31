# build
FROM registry-vpc.cn-beijing.aliyuncs.com/laiye-devops/siber-web:builder as builder

COPY . .

RUN NODE_ENV='development' yarn \
  && yarn build

FROM registry-vpc.cn-beijing.aliyuncs.com/laiye-devops/siber-web:baseimg

# 项目文件
COPY --from=builder /home/works/program/pm2.json .
COPY --from=builder /home/works/program/package.json .
COPY --from=builder /home/works/program/yarn.lock .
COPY --from=builder /home/works/program/config/ ./config
COPY --from=builder /home/works/program/server/ ./server
COPY --from=builder /home/works/program/dist/ ./dist
COPY --from=builder /home/works/program/docker/start.sh /start.sh

# 再执行一次 yarn，只需确保 dependencies 是最新即可，因此不需要 NODE_ENV='development'
RUN yarn \
  && chmod +x /start.sh \
  && yarn cache clean \
  && rm -rf /tmp/*

CMD ["/start.sh"]
