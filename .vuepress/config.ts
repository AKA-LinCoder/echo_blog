import { defineUserConfig } from "vuepress";
import type { DefaultThemeOptions } from "vuepress";
import recoTheme from "vuepress-theme-reco";

export default defineUserConfig({
  title: "周五摆烂",
  description: "学习学习",
  head: [
    // 设置浏览器标签页图标
    ["link", { rel: "icon", href: "/logo.png" }],
    [
      "meta",
      {
        name: "viewport",
        content: "width=device-width,initial-scale=1,user-scalable=no",
      },
    ],
  ],
  theme: recoTheme({
    style: "@vuepress-reco/style-default",
    logo: "/logo.png",
    author: "AKA-LinCoder",
    authorAvatar: "/head.png",
    docsRepo: "https://github.com/AKA-LinCoder",
    docsBranch: "main",
    docsDir: "example",
    lastUpdatedText: "上次更新",
    notFound: [
      "这里什么都没有",
      "我们怎么到这来了？",
      "这是一个 404 页面",
      "看起来我们进入了错误的链接",
    ],
    backToHome: "返回首页",

    // series 为原 sidebar
    series: {
      "/docs/theme-reco/": [
        {
          text: "module one",
          children: ["home", "theme"],
        },
        {
          text: "module two",
          children: ["api", "plugin"],
        },
      ],
      "/docs/flutter/": [
        {
          text: "flutter",
          children: ["home", "theme"],
        },
        {
          text: "高德地图相关",
          children: ["location"],
        },
      ],
      "/docs/big-data/kafka": [
        {
          text: "概念",
          children: ["info",],
        },
        {
          text: "环境相关",
          children: ["environment",],
        },
        {
          text: "kafka",
          children: ["home","simple-use"],
        },
       
          ]
    },
    navbar: [
      { text: "主页", link: "/" },
      {
        text: "面试",
        link: "/blogs/other/guide",
      },
      { text: "目录", link: "/categories/reco/1/" },
      {
        text: "大数据",
        children: [
          { text: "Kafka", link: "/docs/big-data/kafka/info" }, 
          { text: "Hadoop", link: "/docs/flutter/home" },
        ],
      },
      {
        text: "软考",
        children: [
          { text: "系统架构设计师", link: "/docs/software-engineering-examination/architect" }, 
          { text: "Hadoop", link: "/docs/flutter/home" },
        ],
      },
      { text: "鸿蒙", link: "/docs/harmony-os/home" },
      { text: "测试", link: "/docs/python-test/home" },
      {
        text: "app",
        children: [
          { text: "flutter", link: "/docs/flutter/home" }, 
          { text: "ios", link: "/blogs/other/guide" },
          { text: "Android", link: "/blogs/other/guide" },
        ],
      },
    ],
    bulletin: {
      body: [
        {
          type: "text",
          content: `🎉🎉🎉 学不完真的学不完`,
          style: "font-size: 12px;",
        },
      ],
    },
    // commentConfig: {
    //   type: 'valie',
    //   // options 与 1.x 的 valineConfig 配置一致
    //   options: {
    //     // appId: 'xxx',
    //     // appKey: 'xxx',
    //     // placeholder: '填写邮箱可以收到回复提醒哦！',
    //     // verify: true, // 验证码服务
    //     // notify: true,
    //     // recordIP: true,
    //     // hideComments: true // 隐藏评论
    //   },
    // },
  }),
  // debug: true,
  lang: "zh-CN",
});
