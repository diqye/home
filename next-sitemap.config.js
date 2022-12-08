let config= {
  siteUrl: "http://www.diqye.com",
  generateRobotsTxt:true,
  sitemapSize: 1000,
  async additionalPaths(config){
    return [{
      loc: "/channel/home"
    }]
  }
}

module.exports = config;