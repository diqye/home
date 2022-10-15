import { createProxyMiddleware } from 'http-proxy-middleware';
import { NextApiRequest, NextApiResponse } from 'next';

let proxy= createProxyMiddleware('/api/**', {
  target: "http://localhost:8899",
  ws: true, // enable proxying WebSockets
  pathRewrite: { "^/api": "" }, // remove `/api/proxy` prefix
}) as any;

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  console.log("api - " + req.url)
  proxy(req, res, (err:any) => {
      if (err) {
          throw err;
      }
      throw new Error(`Local proxy received bad request for ${req.url}`);
  });
}
export const config = {
  api: {
      // Proxy middleware will handle requests itself, so Next.js should 
      // ignore that our handler doesn't directly return a response
      externalResolver: true,
      // Pass request bodies through unmodified so that the origin API server
      // receives them in the intended format
      bodyParser: false,
  },
}