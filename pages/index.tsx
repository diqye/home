import { Button, Center, Wrap, WrapItem } from '@chakra-ui/react'
import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'


const Home : NextPage = () => {
  return <Center paddingTop="10">
    <Head>
      <title>第七页</title>
      <meta name="keywords" content="无需登陆聊天频道,在线钢琴,在线八音盒,在线古筝,金融数据" />
      <meta name="description" content="第七页的个人网站" />
    </Head>
    <Wrap spacing="5">
      <WrapItem>
        <Link href={"/channel/home"} passHref>
          <Button colorScheme="teal" as="a">home channel</Button>
        </Link>
      </WrapItem>
      <WrapItem>
        <Link href={"/finance"} passHref>
          <Button colorScheme="cyan" as="a">finance</Button>
        </Link>
      </WrapItem>
      <WrapItem>
        <Link href={"/music"} passHref>
          <Button colorScheme="pink" as="a">八音盒模拟器儿童版</Button>
        </Link>
      </WrapItem>
      <WrapItem>
        <Link href={"/music/expert"} passHref>
          <Button as="a" colorScheme="green">钢琴模拟器do re mi</Button>
        </Link>
      </WrapItem>
    </Wrap>
  </Center>
}
export default Home