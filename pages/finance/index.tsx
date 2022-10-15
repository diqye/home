import MoonButton from "@c/MoonButton";
import { HamburgerIcon, SettingsIcon } from "@chakra-ui/icons";
import { Button, VStack,Text, HStack, WrapItem, Wrap, Box, IconButton, Menu, MenuButton, MenuList, MenuItem, Link, ResponsiveValue, LinkProps, useColorModeValue, Heading, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import { NextPage } from "next";
import Head from "next/head";
import NLink from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState,useLayoutEffect, FC } from "react";
import { cm, useCurrent } from "src/kit";


type StackViewProps = {

}
let StockView : FC<StackViewProps> = props => {
  return <WrapItem
      role="group"
      borderRadius="md"
      flex={["0 0 100%","0 0 200px"]}
      p="4"
      flexDirection="column"
      boxShadow="outline"
      >
    <HStack justify="space-between" w="full">
      <Text
      colorScheme="red"
      fontWeight="bold"
      fontSize="xl">0.88778</Text>
      <Text
      colorScheme="red"
      textAlign="right"
      fontSize="sm">+100</Text> 
      <Text
      colorScheme="red"
      flexBasis="16"
      textAlign="right"
      fontSize="md">+0.80%</Text>
    </HStack>
    <HStack justify="space-between" w="full" spacing={0}>
      <Link
      href="/finance/XAUUSD"
      colorScheme="teal"
      target="_blank">XAUUSD</Link>
      <StockMenu />
    </HStack>
  </WrapItem>
}

let StockMenu : FC = props => {
  return <Menu modifiers={[]}>
  <MenuButton
    visibility="hidden"
    _groupHover={{visibility:"visible"}}
    size="sm"
    as={IconButton}
    icon={<HamburgerIcon />}
    variant='outline'
  />
  <MenuList>
    <MenuItem
    onClick={()=>alert("setting")}
    icon={<SettingsIcon />}>
      价格提醒
    </MenuItem>
  </MenuList>
</Menu>
}
function makeSocketIterator():AsyncIterable<string>{
  let ok =  (a:any) => void 0
  let err =  (a:any) => void 0
  document.addEventListener("keyup",e=>{
    if(e.key == "A"){
      err({done:true,value:e.key})
    }else{
      ok({value:e.key})
    }
  })
  return {
    [Symbol.asyncIterator](){
      return {
        next:()=> new Promise<any>((resolve ,reject)=>{
          ok = resolve as any
          err = reject as any
        }),
        return:(v)=> {
          console.log("return...",v)
          return Promise.resolve({done:true,value:"return-value"})
        }
      }
    }
  }
}

let Index : NextPage = props =>{
  let [count,setCount] = useState(0)
  useEffect(()=>{
  
  },[])
  return <VStack>
    <Head>
      <title>金融实时数据 | 第七页</title>
      <meta name="keywords" content="黄金实时数据" />
      <meta name="description" content="金融实时数据" />
    </Head>
    <HStack
    borderBottom="1px solid tomato"
    borderColor={cm("red")}
    justify="flex-end" w="full" p="4" pb="1">
      <MoonButton />
    </HStack>
    <Wrap
    borderBottom="1px solid tomato"
    borderColor={cm("red")}
    p="4"
    pb="1"
    spacing="4" w="full" justify="center">
        <StockView />
        <StockView />
        <StockView />
        <StockView />
        <StockView />
        <StockView />
        <StockView />
    </Wrap>
    <Tabs size='md' w="full" variant='enclosed'>
      <TabList>
        <Tab>全部</Tab>
        <Tab>当前操作</Tab>
        <Tab>操作记录</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <p>one!</p>
        </TabPanel>
        <TabPanel>
          <p>two!</p>
        </TabPanel>
        <TabPanel>
          <p>Three</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </VStack>
}
export default Index
