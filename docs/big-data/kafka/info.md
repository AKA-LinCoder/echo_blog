---
title: 概念
lastUpdated: true
---

- Kafka 传统定义：Kafka 是一个分布式的基于发布/订阅模式的消息队列（Message Queue），主要应用于大数据实时处理领域。
- 发布/订阅：消息的发布者不会将消息直接发送给特定的订阅者，而是将发布的消息分为不同的类别，订阅者可以表达对多个类别的兴趣，从而能够接收感兴趣的消息。
- Kafka 最新定义：Kafka 是一个开源的分布式事件流平台，被数千家公司用于高性能数据管道，流分析，数据集成和关键任务应用
- 传统的消息队列的主要应用场景：缓冲/消峰，解耦和异步通信
- 缓冲/消峰：有助于控制和优化数据流经过系统的速度，解决生产消息和消费消息的处理速度不一致的情况。
- 解耦：允许独立的拓展或修改两边的处理过程，只要确保它们遵守同样的接口约束。
- 异步通信：允许用户把一个消息放入队列，但并不立即处理它。待后续再处理这个消息。
- 消息队列的两种模式

  - 点对点模式（一对一，消费者主动拉取数据，消息收到后清除）
  - 发布/订阅模式（一对多，消费者消费消息后会持久化保存）
    - 可以有多个 topic 主题
    - 消费者消费数据之后，不会删除数据
    - 每个消费者相互独立，都可以消费到数据

- Kafka 基础架构

  - Producer：消息生产者，就是向 Kafka broker 发消息的客户端
  - Consumer：消息消费者，向 Kafka broker 取消息的客户端
  - Consumer Group（CG）：消费者组，由多个 consumer 组成。消费者组内每个消费者负责消费不同分区的数据，一个分区(partition)只能由一个组内的一个消费者消费；消费者组之间互不影响。所有的消费者都属于某个消费者组，即消费者组是逻辑上的一个订阅者。
  - Broker：一台 Kafka 服务器就是一个 broker。一个集群由多个 broker 组成。一个 broker 可以容纳多个 topic。
  - Topic：可以理解为一个队列，生产者和消费者面向的都是一个 topic。
    - 为方便扩展，并提高吞吐量，一个 topic 分为多个 partition(分区)
  - 为提高可用性，为每个分区都提供多个副本(replica)，一般设置为 2 个副本
    - 副本分为两种：
      - leader 副本：可以处理读写请求
      - follower 副本：只能处理读请求，不能处理写请求，会向 leader 副本同步消息,只有在 leader 挂掉的时候才会使用
  - Zookeeper：Kafka 集群依赖 Zookeeper 来保存集群的元数据信息，并选举 Kafka broker 的 leader。Zookeeper 中记录谁是 leader，Kafka2.8.0 以后也可以配置不采用 zk

- 分区的好处

  - 便于合理使用存储资源，负载均衡
  - 提高并行度，生产者可以以分区为单位发送数据；消费者可以以分区为单位消费数据，提高并发能力

  - 分区策略（等用新的 3.5 版本以上需要重新测试喜爱）
    - 指定了分区的情况下，直接将消息发送到指定分区；
    - 没有指定分区，但是指定了 key 就拿 key 的 hash 值与分区数进行取余，得到结果为要去的分区；
    - 既没有指定分区，也没有 key,采用粘性分区策略，会随机选在一个分区，并尽可能一直使用这个分区，直到该分区的 batch 已满或者已完成，Kafka 在重新选择一个和上次不一样的分区（如果选到上一个就会重新选择;

### 生产者如何提高吞吐量

- batch.size：提高批次大小，默认 16k->32K(生产者缓冲大小，缓冲区中的数据达到一定量的时候，就会发送给 broker)
- linger.ms：默认时间为 0ms,修改为 5-100ms，修改过大会导致延迟太大 (生产者发送数据给 broker，如果发现缓冲区中的数据没有达到 batch.size，就会等待一段时间，如果时间到了，就会发送给 broker)
- compression.type: 默认值为 none，可以设置为 snappy、gzip、lz4,进行数据压缩
- RecordAccumulator：缓冲区大小，默认 32M ->修改为 64M

- 生成者发送数据到集群流程
  - 生产者在 main 线程通过 send 方法发送数据，经过拦截器，序列化器，分区器到达队列，队列在达到 batch.size 或者 linger.ms 的时候，就会发送给 sender 线程，sender 线程将数据发送给 broker

### 数据可靠

- 数据可靠 = asks=-1+分区副本大于等于 2+isr 中应答的最小副本大于等于 2
  - acks=0：生产者发送数据之后，不需要等待 broker 的响应，broker 写入本地磁盘就算成功，不需要等待其他 follower 副本的响应
  - acks=1：生产者发送数据之后，需要等待 leader 副本的响应，不需要等待其他 follower 副本的响应
  - acks=all/-1：生产者发送数据之后，leader 和 isr（isr 是所有能跟上 leader 同步的 follower+leader 的一个集合）队列里面的所有节点收齐数据后应答（ 需要等待 leader 副本的响应，还需要等待所有 follower 副本的响应），可能会造成数据重复（在已经存储了数据然后等待应答的时候，leader 挂了，这时候生产者重新发送数据，就又会保存一份数据）
  - acks=0，可能出现的问题
    - 生产者发送数据到 broker，broker 写入本地磁盘，但是还没有来得及返回 ack 给生产者，此时 broker 宕机，数据丢失
  - acks=1，可能出现的问题
    - 生产者发送数据到 broker，broker 写入本地磁盘，返回 ack 给生产者，此时 broker 宕机（虽然写入了磁盘，但还没有同步给 follower 副本，但是因为 leader 挂了，随机一个 follower 变成了 leader，这时之前发送的数据就丢失了）
  - acks=all，可能出现的问题
    - leader 收到数据，所有的 follower 开始同步数据，但是有一个 follower 挂了，leader 没有收到 follower 的响应，此时数据就丢失了（Kafka 的解决：如果 follower 长时间未向 leader 发送通信请求或者同步请求，则该 follower 将被提出 isr,默认 30s,但这种解决方式只有在副本不是 1 的情况或者 isrz 中应答的最小副本不为 1 下能解决，如果副本数为 1，那么和 asks=1 是一样的）
  - 数据完全可靠条件：asks=-1+分区副本大于等于 2+isr 中应答的最小副本大于等于 2

### 数据传递

- 至少一次 = ack=-1+分区副本大于等于 2+isr 中应答的最小副本大于等于 2，保证数据不丢失，但是不能保证数据不重复
- 最多一次 = acks=0 保证数据不重复，但是不能保证数据不丢失
- 精确一次 = 幂等性 + 至少一次

### 数据重复

- 幂等性：生成者不论向 broker 发送多少次数据，broker 端都只会持久化一条，不会重复持久化。幂等性只能保证单分区内数据不重复
  - 生产者开启幂等性：enable.idompotence=true，默认为 true
  - 重复数据的判断标准：具有<PID，Partition，SeqNumber> 相同主键的信息提交时，broker 只会持久化一条；
    - PID：生产者 ID，每个生产者都有一个唯一的 PID,kafka 每次重启都会分配一个新的
    - Partition：分区号，一个 topic 可以分为多个分区，一个分区就是一个有序的队列
    - SeqNumber：序号，每个分区下的消息都有一个从 0 开始递增的序号，即 SeqNumber
- 事务：生产者开启事务（初始化事务、准备数据、提交数据、回滚数据），生产者事务性提交数据，生产者事务性回滚数据，开启事物，必须开启幂等性
  - 生产者在使用事物功能前，必须自定义一个唯一的 Transaction ID（Producer ID + 序列号），有了 Transaction ID，生产者就可以开启一个事务，然后就可以向 broker 发送数据了，即使客户端挂掉了，重启之后也能继续处理未完成的事务

### 数据有序，数据乱序

- 在 Kafka1.x 之前保证单分区有序
  ```
  max.in.flight.requests.per.connection=1
  ```
- 在 Kafka1.x 之后保证单分区有序
  - 未开启幂等性
  ```
  max.in.flight.requests.per.connection=1
  ```
  - 开启幂等性
  ```
  max.in.flight.requests.per.connection=小于等于5
  ```
- 如果开启了幂等性且缓存的请求个数小于 5，会在服务端重新排序
- 在 Kafka1.x 版本中，Kafka 默认使用的是**不可靠的**消息传输，即**消息可能会丢失**，但是从 Kafka 0.11.0.0 版本开始，Kafka 引入了**幂等性**机制来保证消息不会丢失。kafka 服务端会缓存生产者发来的最近 5 个 request 的元数据，所以无论如何，都可以保证最近的 5 个 request 的数据都是有序的

### zookeeper 中存储的重要的 Kafka 信息

- /Kafka/brokers/ids/[0...N] 记录有哪些服务器
- /Kafka/brokers/topics/[topic]/partitions/[0...N] 记录每个分区对应的主机
- /Kafka/brokers/topics/[topic]/partitions/[0...N]/state 记录每个分区的 leader 和 ISR ，记录谁是 leader，有哪些服务器可用
- /Kafka/controllers/[0...N] 记录当前谁是 controller,辅助选举 leader

- AR：Kafka 分区中的所有副本的统称
- ISR：Kafka 分区中所有副本中，与 leader 副本保持同步的副本集合
- OSR：Kafka 分区中所有副本中，与 leader 副本不同步的副本集合

### broker 总体工作流程

- broker 启动后在 zk 中注册 写入到/brokers/ids/[0...N]
- controller 选举，选举出 controller，谁先注册谁就是 controller
- controller 启动后，会读取/brokers/ids/[0...N]中的所有 broker 信息，监听 brokers 节点变化,并更新到 isr 中
- controller 决定 leader 选举，选举规则：在 isr 中存活为前提，按照 AR 中排在前面的优先
- controller 将选举出来的 leader 告诉 zk,zk 更新到/brokers/topics/[topic]/partitions/[0...N]/state 节点中
- 其他 controller 从 zk 同步信息
- 生产者发送信息
- 如果 leader 挂了，controller 通知 zk，zk 更新/brokers/topics/[topic]/partitions/[0...N]/state 节点，并通知其他 controller
- 重新选举新的 leader

### 节点服役和退役

### 虚拟机克隆

- 关机要克隆的虚拟机
- 右键克隆虚拟机，选择创建完整克隆
- 克隆完成之后还需要修改虚拟机的名称等信息
- 使用 root 登陆
- vim /etc/sysconfig/netword-scipts/ifcfg-ens33 修改 IP
- vim /etc/hostname 修改主机名称
- 重启 reboot
- 删除一些克隆电脑的信息，比如 Kafka 里面的 datas 和 logs 目录（因为这里面存了唯一的 brokeid）
