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

Docker 就是对 Linux 容器的封装，提供了一些简单的接口；Linux 容器的优点：资源占用少。启动速度快，体积很小，就是一个进程，可以方便启动
Docker 将应用程序以及依赖包打在一个文件中，当运行这个文件的时候就会生成一个 Linux 容器，程序在容器中运行和在物理机上运行效果一样
Docker 三大用途

1. 提供一次性的环境
2. 提供弹性的云服务
3. 组建微服务架构

##

1. Docker 安装

```
curl -sSL https://get.daocloud.io/docker | sh
上面的一句不能使用了
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
点击回车
```

2. 启动 Docker

```
systemctl start docker
```

## Image 文件

Docker 把应用程序以及依赖包打包到 Image 文件中，Image 文件本身也是一个文件，是一个特殊的文件系统，通过 Image 文件可以创建 Docker 容器，Image 文件可以看作是容器的模板，一个 Image 文件可以创建多个同时运行的容器

## Docker 常见命令

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

## 实战 Docker 搭建交易系统

需要五个容器分别存放

- MySql 数据库
- Minio 对象存储
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

赋予 docker-compose 可执行权限

```
chmod +x /usr/local/bin/docker-compose
```

验证 Docker Compose 是否安装成功

```
docker-compose --version
docker login --username=fengzx120_tcpjw registry.cn-shanghai.aliyuncs.com
fzx19890120
```

导入 docker-compose.yml 文件

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

修改其中 minio 的 IP 为虚拟机本机 IP
直接命令

```
docker-compose up -d
```

关闭防火墙

```
firewall-cmd --state
systemctl stop firewalld.service
```

新建的云服务器需要把 IP 那些添加到安全组，否则无法连接

到 minio 中新建一个 bucket
新建了 bucket 后需要将这个 bucket 的 Access Pollcy 的权限设置为 public

minio 的账号密码在 docker-compose.yml 里面找到

连接 mysql 数据库并倒入 sql
密码 william

## 处理 IP 变化后需要重新部署的情况

- 先查看当前 docker

```
docker ps -a
```

- 强制删除容器

```
docker rm -f 容器id
```

- 查看是否删除成功

```
docker ps -a
```

- 删除镜像

```
docker images #查看镜像
docker rmi 镜像id
docker images #查看镜像
```

- 重启虚拟机
- 修改 docker-compose.yml 文件中 minio 的 IP
- 检查防火墙状态
- 进入 docker-compose.yml 所在文件夹，删除除了 docker-compose.yml 以外的所有文件

```
rm -rf xxx/
```

- 重新启动 docker

```
systemctl start docker
```

- 重新 docker-compose up -d

### Pycharm 简单学习
# 代码格式化
# windows：Ctrl+Alt+L
# Mac:Command+Option+L
# 快速异常捕获，选中代码块
# windows：Ctrl+Alt+T
# Mac:Command+Option+T

# 向右向左缩进制表位
# 向左 Shift+Tab
# 向右:Tab

# 向上插入新行
# windows：Ctrl+Alt+Enter
# Mac:Command+Option+Enter

# 向下 插入新行
# Shift+Enter

# 快速切换文件
 Ctrl+E

文件头注释
打开设置 -> Editor -> File and Code Templates -> Python Script 天津注释
```
# @Time    : ${DATE} 
# @Author  : ${USER}
# @File    : ${NAME}.py
```
## 下载Selenium
打开Pycharm，点击File->Settings->Project->Project Interpreter，点击+，搜索Selenium，点击Install Package，等待安装完成。