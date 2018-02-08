# API List

## 微信相关接口

### 获取用户登录信息
用户登录小程序后调用这个接口，后台存储session同时返回Openid给小程序端
```
GET /wechat/login/<code>

Response 200
{
  userId: <用户的OpenID>
}
```
`code` 为小程序端调用`wx.login`后获取到的`code`参数


### 更新用户信息
小程序端获取到用户详细信息后，通过这个接口将信息存在内部的数据表中
```
POST /wechat/api/user
Body
{
  userInfo: <微信获取的UserInfo>
  userId: <用户的OpenId>
}

Response 200
{
  status: 'ok'  
}
```

### 解密微信的加密数据
```
POST /wechat/api/decrypt
Body
{
  userId: <用户的OpenId>
  iv: <微信返回加密数据的iv>
  encryptedData: <微信返回加密数据的encryptedData>
}

Response 200
返回解密后的JSON对象
```

### 将用户加入内部的群组表
```
POST /wechat/api/group/add_member
Body
{
  userId: <用户的OpenId>
  groupId: <通过解密加密数据返回的GroupID>
}

Response 200
{
  status: 'ok'  
}
```

### 获取正在推流的用户
```
GET /wechat/api/activeuser/<groupId>

Response 200
{
  activeUser: [
    { ...userInfo, ...streamInfo },
    ...
  ]
}
```
如果没有提供`groupId`就会搜索所有用户，提供`groupID`只会在指定群组下搜索


## 直播云相关的接口

### 获取RTMP的推流或者播放地址
```
GET /pili/api/rtmp/<type>/<userId>

Response 200
{ url: <地址> }
```
`type`为 play 或者 publish分别对应播放和推流
