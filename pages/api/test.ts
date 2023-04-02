// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'


export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  res.status(200).json(threeNum([-1,0,1,2,-1,-4]))
}

function threeNum(nums:number[]):string{
  return "three num"
}