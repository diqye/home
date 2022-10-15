/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint:{
    ignoreDuringBuilds:true
  },
  webpack(config,{isServer}){
    // if(isServer)return config
    // else {
    //   config.module.rules.forEach(rule=>{
    //    if(rule.include&&rule.include.length > 0){
    //     rule.include.push("@chakra-ui")
    //    }
    //   })
    // }
    return config
  }
}

module.exports = nextConfig
