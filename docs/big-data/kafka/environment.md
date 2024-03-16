---
title: Kafka环境配置相关
lastUpdated: true
---

## 下载安装

- [下载需要的版本](https://kafka.apache.org/downloads)
  ![下载](/assets/big-data/kafka/environment/download1.png)
- 进行解压并放到需要的目录
  ```
  tar -zxvf kafka_2.13-2.8.1.tgz -C /opt/module/
  ```
- 修改名称
  ```
  mv kafka_2.13-2.8.1/ kafka
  ```
- 进入 Kafka 目录
  - bin 目录 存放命令脚本
  - config 目录 存放配置信息
    - server.properties 配置 Kafka 的一些基础信息
    - log4j.properties 日志配置
    - zookeeper.properties 配置 Kafka 与 Zookeeper 相关的信息
    - producer.properties 生产者配置
    - consumer.properties 消费者配置
  - libs 目录 存放依赖的 jar 包

## 相关配置

### server.properties 配置

- broker.id: kafka 在集群中的唯一标识,不能重复
- log_dirs: kafka 日志存放的路径,默认是存放在 /tmp/kafka-logs 一个临时目录下的 ，一般修改到自定义目录，比如 /opt/module/kafka/datas 下
- zookeeper.connect: 默认连接的是 localhost:2181，需要修改到自己的 zookeeper 集群地址 比如 hadoop102:2181,hadoop103:2181,hadoop104:2181/kafka
  - 这样写的话的原因：zookeeper 采用的是目录树的结构，根目录下有个 zookeeper 节点，如果不采用里面创建一个 Kafka 目录的方式，那样 Kafka 的信息就会打散存储在 zookeeper 中，不方便后续统一管理
- 保存退出 server.properties,并将整个 Kafka 目录分发到其他机器上，并且在其他机器的 server.properties 中修改 broker.id

- 一些参数说明
  ```
  #broker的全局唯一编号，不能重复，只能是数字。
  broker.id=0
  #处理网络请求的线程数量
  num.network.threads=3
  #用来处理磁盘IO的线程数量
  num.io.threads=8
  #发送套接字的缓冲区大小
  socket.send.buffer.bytes=102400
  #接收套接字的缓冲区大小
  socket.receive.buffer.bytes=102400
  #请求套接字的缓冲区大小
  socket.request.max.bytes=104857600
  #kafka运行日志(数据)存放的路径，路径不需要提前创建，kafka自动帮你创建，可以配置多个磁盘路径，路径与路径之间可以用"，"分隔
  log.dirs=/opt/module/kafka/datas
  #topic在当前broker上的分区个数
  num.partitions=1
  #用来恢复和清理data下数据的线程数量
  num.recovery.threads.per.data.dir=1
  # 每个 topic 创建时的副本数，默认时 1 个副本
  offsets.topic.replication.factor=1
  #segment 文件保留的最长时间，超时将被删除
  log.retention.hours=168 #每个 segment 文件的大小，默认最大 1G
  log.segment.bytes=1073741824
  # 检查过期数据的时间，默认 5 分钟检查一次是否数据过期
  log.retention.check.interval.ms=300000 #配置连接 Zookeeper 集群地址（在 zk 根目录下创建/kafka，方便管理）
  zookeeper.connect=hadoop102:2181,hadoop103:2181,hadoop104:2181/kafka
  ```

### 环境变量配置

- 修改 /etc/profile.d/my.env.sh 文件，添加 Kafka 环境变量

```

#KAFKA_HOME
export KAFKA_HOME = /opt/module/kafka
exprot PATH = $PATH:$KAFKA_HOME/bin

```

- 使配置生效

```

source /etc/profile.d/my.env.sh

```

- 将 /etc/profile.d/my.env.sh 文件分发到其他机器上，并在其他机器上使用 source /etc/profile.d/my.env.sh 使配置生效

### 完成

- 配置脚本 kf.sh(在 home 目录下的 bin 目录里) 用于启动停止 Kafka

```

#! /bin/bash
case $1 in
"start"){
for i in hadoop102 hadoop103 hadoop104
do
echo " --------启动 $i Kafka-------"
ssh $i "/opt/module/kafka/bin/kafka-server-start.sh -daemon /opt/module/kafka/config/server.properties"
done
};;
"stop"){
for i in hadoop102 hadoop103 hadoop104
do
echo " --------停止 $i Kafka-------"
ssh $i "/opt/module/kafka/bin/kafka-server-stop.sh "
done
};;
esac

```

- 修改脚本权限

```

chmod 777 kf.sh

```

至此，Kafka 安装配置完成，接下来可以启动 Kafka(kf.sh start) 了，启动 Kafka 之前，需要先启动 Zookeeper
kafka 停止需要一定时间，
要先关 Kafka，等 Kafka 所有进程结束之后才能关 zk
