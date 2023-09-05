---
title: Selenium3+Pytest+Allure自动化测试
lastUpdated: true
---

## 知识点概要

python 3.7
Selenium3
Pytest
Allure
YAML
XPATH
图像识别 
Jenkins
Mysql
Redis

# Docker

Docker就是对Linux容器的封装，提供了一些简单的接口；Linux容器的优点：资源占用少。启动速度快，体积很小，就是一个进程，可以方便启动
Docker将应用程序以及依赖包打在一个文件中，当运行这个文件的时候就会生成一个Linux容器，程序在容器中运行和在物理机上运行效果一样
Docker三大用途
1. 提供一次性的环境
2. 提供弹性的云服务
3. 组建微服务架构

## 

1. Docker安装

```
curl -sSL https://get.daocloud.io/docker | sh
上面的一句不能使用了
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
点击回车
```
2. 启动Docker
```
systemctl start docker
```
## Image 文件
Docker把应用程序以及依赖包打包到Image文件中，Image文件本身也是一个文件，是一个特殊的文件系统，通过Image文件可以创建Docker容器，Image文件可以看作是容器的模板，一个Image文件可以创建多个同时运行的容器

## Docker常见命令
```
    docker commit -m="提交信息" -a="作者" 容器id 镜像名:版本号
    docker cp 容器id:容器内路径 本地路径 #将容器内文件拷贝到本地
    docker build -t 镜像名:版本号 . #基于Dockerfile构建镜像
    docker search centos #搜索镜像
    docker pull centos #下载镜像
    docker images #查看本地镜像
    docker tag 镜像id 镜像名:版本号 新镜像名:版本号 #修改镜像名
    docker run -itd  --name=XX  IMAGE ID #创建并启动容器
    docker ps #查看正在运行的容器
    docker ps -a #查看所有容器,包括已经停止的
    docker start test #启动容器
    docker start CONTAINER ID(容器ID) #启动容器
    docker stop CONTAINER ID(容器ID) #停止容器
    docker exec -it 容器id /bin/bash #进入容器
    exit 退出
    docker logs CONTAINER ID(容器ID) #查看日志
    docker rm test #删除容器
    docker rmi -f 镜像id #删除镜像
    docker run -it ubuntu /bin/bash #启动一个容器
```
## 实战Docker搭建交易系统

需要五个容器分别存放 
- MySql数据库
- Minio对象存储
- 校园二手交易系统后端
- 校园二手交易系统前端
- Redis

### docker-compose
安装
```
 curl -L "https://get.daocloud.io/docker/compose/releases/latest/download/1.27.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

上面的一句不能使用了
 sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

```
赋予docker-compose可执行权限
```
chmod +x /usr/local/bin/docker-compose
```
验证 Docker Compose 是否安装成功
```
docker-compose --version
docker login --username=fengzx120_tcpjw registry.cn-shanghai.aliyuncs.com
fzx19890120
```
导入docker-compose.yml文件
```
version: '3.3'
services:
    trading_system_redis:
        container_name: trading_system_redis
        restart: always
        image: redis:latest
        ports:
            - 6379:6379
    trading_system_mysql:
        container_name: trading_system_mysql
        restart: always
        image: mysql:5.7
        volumes:
            - /root/trading_system_docker/db_data:/var/lib/mysql
        environment:
            MYSQL_ROOT_PASSWORD: william
            MYSQL_DATABASE: trading_system
        ports:
            - 3306:3306
        command:
            --max_connections=1000
            --character-set-server=utf8mb4
            --collation-server=utf8mb4_general_ci
            --default-authentication-plugin=mysql_native_password


    minio:
        container_name: trading_system_minio
        restart: always
        image: minio/minio
        volumes:
            - /root/trading_system_docker/minio_data:/data
            - /root/trading_system_docker/minio_config:/root/.minio
        ports:
            - 9000:9000
            - 9090:9090
        environment:
            MINIO_ACCESS_KEY: fengzhaoxi
            MINIO_SECRET_KEY: fzx19890120
        command: server /data --console-address ":9000" --address ":9090"
        privileged: true

    trading_system:
        container_name: trading_system
        restart: always
        image: registry.cn-shanghai.aliyuncs.com/fengzx120/trading_system:latest
        depends_on:
            - trading_system_mysql
            - minio
        environment:
            MYSQL_IP: localhost
            MYSQL_PORT: 3306
            MYSQL_USER: root
            MYSQL_PWD: william
            # 更改为同学们自己虚拟机的IP
            MINIO_IP: 192.168.2.171
        network_mode: "host"
        
    trading_system_frontend:
        container_name: trading_system_frontend
        restart: always
        image: registry.cn-shanghai.aliyuncs.com/fengzx120/trading_system_frontend:latest
        depends_on:
            - trading_system
        network_mode: "host"
```
修改其中minio的IP为虚拟机本机IP
直接命令
```
docker-compose up -d
```

关闭防火墙
```
firewall-cmd --state
systemctl stop firewalld.service
```
到minio中新建一个bucket
连接mysql数据库并倒入sql