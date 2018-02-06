# Demo 后台

API LIST 参见 [API.md](./API.md)

## 介绍
服务Demo小程序的后端程序，主要分为2个部分

### 对接七牛直播云
主要代码在 PLService 下，开放给小程序外部接口在routers/pili.js 下
主要功能是 获取推流/播放链接、管理流、查询流状态

### 对接微信
主要代码在 routers/wechat.js
下，主要是各种微信登录验证、解密数据、以及将微信的用户数据存储在内部的Mongo中

## 使用

### 配置直播云
修改 pili.js,
将AK，SK换成自己的七牛账户，修改域名host，把直播空间填成自己的直播空间

### 运行
推荐使用docker来运行，在当前目录下执行`docker-compose up`就可以运行该该服务。   
暴露的端口为8686，之后请自行配置nginx转发和https。   
*注！请误在生产环境直接使用此镜像，生产环境下请确认mongoDb的Auth已经开启*

### 自定义运行
`npm install`   
确保系统已经运行了mongodb   
修改index.js 将mongodb的地址修改为自己的地址   

`node index.js` （生产环境下请使用pm2 等方式来运行
