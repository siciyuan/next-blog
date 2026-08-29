---
title: 教你玩转cloudflare
date: 2026-03-07
categories:
  - 技术
  - cloudflare
  - 配置
  - 教程
  - 指南
---


# 将自定义域名托管到Cloudflare并使用Worker.js的教程

## 前言

Cloudflare作为全球领先的CDN和网络安全服务提供商，不仅提供DNS解析、DDoS防护等基础服务，还通过其强大的Worker平台支持无服务器函数计算。本文将详细介绍如何将自定义域名托管到Cloudflare，并配置Worker.js来实现自定义逻辑处理。

## 第一步：注册并配置Cloudflare账户

### 1.1 创建Cloudflare账户
1. 访问 [Cloudflare官网](https://www.cloudflare.com)
2. 点击"Sign Up"注册新账户
3. 填写邮箱地址和密码完成注册
4. 验证邮箱地址

### 1.2 添加您的域名
1. 登录Cloudflare控制面板
2. 在左侧导航栏找到"Workers"选项
3. 点击"Add a Site"按钮
4. 输入您的自定义域名（例如：example.com）
5. 选择合适的套餐计划（免费计划已足够大多数使用场景）

## 第二步：配置DNS解析

### 2.1 获取当前DNS记录
Cloudflare会自动扫描您域名当前的DNS记录，包括：
- A记录（IPv4地址映射）
- AAAA记录（IPv6地址映射）
- CNAME记录（别名映射）
- MX记录（邮件服务器）
- TXT记录（文本信息）
- NS记录（域名服务器）

### 2.2 修改域名服务器
1. 在Cloudflare中完成域名添加后，获取分配的Cloudflare DNS服务器地址
2. 登录您的域名注册商管理面板
3. 找到域名服务器（Nameservers）设置
4. 将原有DNS服务器替换为Cloudflare提供的服务器地址
5. 保存更改（DNS传播可能需要几小时到48小时）

### 2.3 验证DNS配置
```bash
# 使用nslookup命令验证DNS解析
nslookup example.com

# 使用dig命令查看详细DNS信息
dig example.com NS
```

## 第三步：创建Cloudflare Worker

### 3.1 访问Workers控制台
1. 登录Cloudflare控制面板
2. 在左侧导航栏找到"Workers & Pages"选项
3. 点击"Create"按钮，选择"Create Worker"

### 3.2 创建Worker服务
1. 输入Worker名称（例如：my-custom-worker）
2. 选择"Default"模板
3. 点击"Deploy"完成创建

### 3.3 编写Worker.js代码
在Worker编辑器中编写您的自定义逻辑：

```javascript
// 基础Worker.js示例
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 根据路径返回不同内容
    if (url.pathname === '/') {
      return new Response('Hello, Cloudflare Workers!', {
        headers: { 'content-type': 'text/plain' },
      });
    }
    
    if (url.pathname === '/api/time') {
      return new Response(new Date().toISOString(), {
        headers: { 'content-type': 'text/plain' },
      });
    }
    
    // 默认返回404
    return new Response('Not Found', { status: 404 });
  },
};
```

### 3.4 部署Worker
1. 点击"Save and Deploy"按钮
2. 等待部署完成
3. 记录分配的Worker子域名（例如：my-custom-worker.username.workers.dev）

## 第四步：配置自定义域名路由

### 4.1 添加自定义域
1. 在Worker设置页面找到"Triggers"选项卡
2. 点击"Add Custom Domain"
3. 输入您的自定义域名（例如：api.example.com）
4. 点击"Add Custom Domain"确认

### 4.2 验证SSL证书
Cloudflare会自动为您的自定义域名申请并配置SSL证书：
1. 系统会自动验证域名所有权
2. SSL证书通常在几分钟内生效
3. 您可以通过HTTPS访问您的Worker服务

### 4.3 DNS验证
确保您的域名DNS配置正确：
```bash
# 验证CNAME记录
dig api.example.com CNAME

# 验证SSL证书
openssl s_client -connect api.example.com:443 -servername api.example.com
```

## 第五步：高级Worker.js功能实现

### 5.1 环境变量配置
```javascript
// 使用环境变量
export default {
  async fetch(request, env) {
    const apiKey = env.API_KEY;
    const apiUrl = env.API_URL;
    
    // 使用环境变量进行API调用
    const response = await fetch(`${apiUrl}/data`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  }
};
```

### 5.2 请求路由处理
```javascript
// 复杂路由处理示例
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;
    
    // 路由分发
    switch (url.pathname) {
      case '/users':
        if (method === 'GET') return getUsers(env);
        if (method === 'POST') return createUser(request, env);
        break;
      case '/health':
        return new Response('OK', { status: 200 });
      default:
        return new Response('Not Found', { status: 404 });
    }
  }
};

async function getUsers(env) {
  // 获取用户列表逻辑
  return new Response(JSON.stringify([]), {
    headers: { 'content-type': 'application/json' }
  });
}

async function createUser(request, env) {
  // 创建用户逻辑
  const userData = await request.json();
  return new Response(JSON.stringify({ id: 1, ...userData }), {
    headers: { 'content-type': 'application/json' }
  });
}
```

### 5.3 缓存和性能优化
```javascript
// 使用Cloudflare缓存
export default {
  async fetch(request, env) {
    // 尝试从缓存获取
    const cache = caches.default;
    let response = await cache.match(request);
    
    if (!response) {
      // 缓存未命中，执行实际逻辑
      response = await fetch(request);
      
      // 缓存响应5分钟
      response = new Response(response.body, response);
      response.headers.append('Cache-Control', 's-maxage=300');
      await cache.put(request, response.clone());
    }
    
    return response;
  }
};
```

## 第六步：监控和日志配置

### 6.1 启用日志记录
```javascript
// 添加日志记录
export default {
  async fetch(request, env) {
    // 记录请求信息
    console.log(`Request: ${request.method} ${request.url}`);
    
    const startTime = Date.now();
    const response = await handleRequest(request, env);
    const duration = Date.now() - startTime;
    
    // 记录响应信息
    console.log(`Response: ${response.status} (${duration}ms)`);
    
    return response;
  }
};
```

### 6.2 错误处理
```javascript
// 统一错误处理
export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};
```

## 第七步：安全配置

### 7.1 CORS配置
```javascript
// 配置CORS头
function setCORSHeaders(response, origin = '*') {
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export default {
  async fetch(request, env) {
    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return setCORSHeaders(new Response(null, { status: 204 }));
    }
    
    const response = await handleRequest(request, env);
    return setCORSHeaders(response);
  }
};
```

### 7.2 请求频率限制
```javascript
// 简单的频率限制
export default {
  async fetch(request, env) {
    const ip = request.headers.get('CF-Connecting-IP');
    const key = `rate-limit:${ip}`;
    
    // 使用KV存储记录请求次数
    const count = await env.MY_KV.get(key) || 0;
    if (count > 100) { // 每分钟限制100次请求
      return new Response('Too Many Requests', { status: 429 });
    }
    
    // 增加计数器
    await env.MY_KV.put(key, parseInt(count) + 1, { expirationTtl: 60 });
    
    return await handleRequest(request, env);
  }
};
```

## 第八步：测试和验证

### 8.1 功能测试
```bash
# 测试基本功能
curl https://api.example.com/
curl https://api.example.com/api/time
curl https://api.example.com/health

# 测试POST请求
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"name": "test", "email": "test@example.com"}'
```

### 8.2 性能测试
```bash
# 使用wrk进行压力测试
wrk -t12 -c400 -d30s https://api.example.com/

# 使用ab进行基准测试
ab -n 1000 -c 100 https://api.example.com/
```

## 第九步：优化和维护

### 9.1 性能优化建议
1. 合理使用缓存策略
2. 压缩响应内容
3. 优化代码逻辑
4. 使用CDN边缘计算功能

### 9.2 监控告警设置
1. 配置Cloudflare Analytics监控
2. 设置自定义指标告警
3. 集成第三方监控服务
4. 定期审查访问日志

## 常见问题解决

### DNS解析问题
- 检查域名服务器是否正确配置
- 等待DNS传播完成
- 使用在线工具验证DNS解析

### SSL证书问题
- 确认域名所有权验证通过
- 检查DNS记录配置
- 联系Cloudflare支持团队

### Worker部署失败
- 检查代码语法错误
- 验证环境变量配置
- 查看部署日志信息

## 最佳实践建议

1. **安全第一**：始终验证输入数据，使用HTTPS加密传输
2. **性能优化**：合理使用缓存，避免不必要的计算
3. **错误处理**：完善的错误处理机制，友好的错误响应
4. **监控维护**：定期检查服务状态，设置告警机制
5. **版本管理**：使用版本控制管理Worker代码变更

通过以上步骤，您可以成功将自定义域名托管到Cloudflare并配置功能强大的Worker.js服务。Cloudflare Workers提供了无服务器架构的优势，让您可以专注于业务逻辑而无需关心服务器运维，同时享受全球CDN网络带来的性能提升。
