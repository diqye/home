import { Button, Center, Heading, Stack, VStack, Wrap, WrapItem,Text, InputLeftAddon, Input, InputGroup, FormControl, FormLabel, InputRightElement } from '@chakra-ui/react'
import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'


const Home : NextPage = () => {

  return <Stack>
    <Head>
      <title>第七页(diqye)个人工具箱</title>
      <meta name="keywords" content="免费在线演奏乐器,免费在线会议,免费在线传输助手,免费金融管理" />
      <meta name="description" content="diqye的个人网站" />
    </Head>
    <VStack bg="teal.400" color="whiteAlpha.900" padding="4">
      <Heading w="full">
       第七页(diqye)的个人工具
      </Heading>
      <Text w="full">这里的所有工具均为绿色原则，即无登陆、无广告和无安装。打开链接即可用，分享链接即共享。</Text>
    </VStack>
    <Wrap spacing="5" padding="4">
      <WrapItem w="xs" borderRadius="2xl" boxShadow="outline">
        <VStack alignItems="flex-start" padding="4" >
          <Heading size="md">信息在线传输</Heading>
          <Text>一个链接即可在多个设备之间传递信息。</Text>
          <Link href={"/channel"} passHref>
            <Button as="a" colorScheme="teal"> 进入</Button>
          </Link>
        </VStack>
      </WrapItem>
      <WrapItem w="xs" borderRadius="2xl" boxShadow="outline">
        <VStack alignItems="flex-start" padding="4">
          <Heading size="md">自由会议</Heading>
          <Text>只需分享一个链接，即可开启多人会议，支持音频、视频和共享桌面。支持录制为webm文件，亦可作为录屏工具使用。</Text>
          <Link href={"/meeting"} passHref>
            <Button as="a" colorScheme="teal"> 进入</Button>
          </Link>
        </VStack>
      </WrapItem>
      <WrapItem w="xs" borderRadius="2xl" boxShadow="outline">
        <VStack w="xs" alignItems="flex-start" padding="4">
          <Heading size="md">简易版在线演奏乐器</Heading>
          <Text>根据提示符即可用键盘演奏出常见的流行音乐</Text>
          <Link href={"/music"} passHref>
            <Button colorScheme="pink" as="a">简易版在线演奏乐器</Button>
          </Link>
        </VStack>
      </WrapItem>
      <WrapItem borderRadius="2xl" boxShadow="outline" w="xs">
        <VStack alignItems="flex-start" padding="4">
          <Heading size="md">专业版在线演奏乐器</Heading>
          <Text>支持更多的音阶、更细腻的音距控制、更多的乐器选择</Text>
          <Link href={"/music/expert"} passHref>
            <Button as="a" colorScheme="pink">专业版在线演奏乐器 - do re mi</Button>
          </Link>
        </VStack>
      </WrapItem>
      <WrapItem w="xs" borderRadius="2xl" boxShadow="outline">
        <VStack alignItems="flex-start" padding="4">
          <Heading size="md">英语强化练习</Heading>
          <Text>个人使用的强化练习用语的工具，需要装一个chrome扩展，主要功能是对输入的每一行中文或英文分成一个个单独页面,利用语音合成技术朗读文字，支持倍速功能。</Text>
          <Link href={"/words"} passHref>
            <Button colorScheme="teal" as="a">Words</Button>
          </Link>
        </VStack>
      </WrapItem>
      <WrapItem w="xs" borderRadius="2xl" boxShadow="outline">
        <VStack alignItems="flex-start" padding="4">
          <Heading size="md">金融数据实时监控与提醒</Heading>
          <Text>对金融产品价格实时监控，可以设置价格提醒，可以模拟策略自动开仓，手动开仓，止盈止损，以上节点提示都会发动到手机上。</Text>
          <Link href={"/finance"} passHref>
            <Button colorScheme="teal" as="a">finance</Button>
          </Link>
        </VStack>
      </WrapItem>
      <WrapItem w="xs" borderRadius="2xl" boxShadow="outline">
        <VStack alignItems="flex-start" padding="4">
          <Heading size="md">在线生成图表</Heading>
          <Text>根据JSON数据生成折线图</Text>
          <Link href={"/chart"} passHref>
            <Button colorScheme="teal" as="a">chart</Button>
          </Link>
        </VStack>
      </WrapItem>
    </Wrap>
    <VStack bg="teal.400" color="whiteAlpha.900" padding="4">
      <a href="https://beian.miit.gov.cn/" target="_blank">京ICP备2023026876号-1</a>
    </VStack>
  </Stack>
}
export default Home
