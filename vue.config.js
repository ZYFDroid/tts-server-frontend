const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,

  devServer: {
    // 设置代理
    proxy: {
      // 'http://localhost:3000' // 接口服务器
      '/tts-ms': {
        // /api/users 的请求会将请求代理到 http://localhost:3000/api/users
        target: 'http://localhost:14141'
      }

    }

  }
})
