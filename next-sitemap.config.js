let config= {
  siteUrl: "https://www.diqye.com",
  generateRobotsTxt:true,
  sitemapSize: 1000,
  async additionalPaths(config){
    return [{
      loc: "/channel/publick"
    },{
      loc: "/meeting/publick"
    }]
  }
}

module.exports = config;
