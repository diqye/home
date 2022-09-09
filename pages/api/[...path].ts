import { createProxyMiddleware } from 'http-proxy-middleware';
import { NextApiRequest, NextApiResponse } from 'next';

let proxy= createProxyMiddleware('/api/**', {
  target: "http://localhost:8899",
  ws: true, // enable proxying WebSockets
  pathRewrite: { "^/api": "" }, // remove `/api/proxy` prefix
}) as any;

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  proxy(req, res, (err:any) => {
      if (err) {
          throw err;
      }
      throw new Error(`Local proxy received bad request for ${req.url}`);
  });
}