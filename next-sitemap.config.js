let config= {
  siteUrl: "https://www.diqye.com",
  generateRobotsTxt:true,
  sitemapSize: 1000,
  async additionalPaths(config){
    return []
    // return [{
    //   loc: "/channel/public"
    // },{
    //   loc: "/meeting/public"
    // }]
  }
}

module.exports = config;
