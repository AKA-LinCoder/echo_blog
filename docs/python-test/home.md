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
