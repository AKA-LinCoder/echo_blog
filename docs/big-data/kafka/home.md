---
title: 相关命令
lastUpdated: true
---

## 主题命令

### 主题命令参数(在 Kafka 目录下)

```
 bin/kafka-topics.sh
```

```
参数 描述
--bootstrap-server <String: server toconnect to> 连接的 Kafka Broker 主机名称和端口号。
--topic <String: topic> 操作的 topic 名称。
--create 创建主题。
--delete 删除主题。
--alter 修改主题。
--list 查看所有主题。
--describe 查看主题详细描述。
--partitions <Integer: # of partitions> 设置分区数。
--replication-factor<Integer: replication factor> 设置分区副本。
--config <String: name=value> 更新系统默认的配置。
```

### 常用主题命令(在 Kafka 目录下)

```
#创建分区
#Kafka3.0之后不需要手动创建分区和备份 默认会创建一个
bin/kafka-topics.sh --bootstrap-server hadoop102:9092 --create --topic topic_name --partitions 1 --replication-factor 3
#查看所有分区
bin/kafka-topics.sh --bootstrap-server hadoop102:9092 --list
#查看单个分区
bin/kafka-topics.sh --bootstrap-server hadoop102:9092 --describe --topic topic_name
#删除分区
bin/kafka-topics.sh --bootstrap-server hadoop102:9092 --delete --topic topic_name
#修改分区
#分区数只能增大不能减小
bin/kafka-topics.sh --bootstrap-server hadoop102:9092 --alter --topic topic_name --partitions 2
```

## 生产者命令

```
bin/kafka-console-producer.sh --bootstrap-server hadoop102:9092 --topic topic_name
#接下来就可以在控制台输入数据，然后回车发送到 Kafka 集群
```

## 消费者命令

```
## 读取增量数据，默认基于当前位置，历史的可以设置从分区的开始位置
bin/kafka-console-consumer.sh --bootstrap-server hadoop102:9092 --topic topic_name
## 读取全部数据
bin/kafka-console-consumer.sh --bootstrap-server hadoop102:9092 --topic topic_name --from-beginning
```
