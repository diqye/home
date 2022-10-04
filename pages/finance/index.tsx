import MoonButton from "@c/MoonButton";
import { HamburgerIcon, SettingsIcon } from "@chakra-ui/icons";
import { Button, VStack,Text, HStack, WrapItem, Wrap, Box, IconButton, Menu, MenuButton, MenuList, MenuItem, Link, ResponsiveValue, LinkProps, useColorModeValue, Heading, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import { NextPage } from "next";
import NLink from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState,useLayoutEffect, FC } from "react";
import { useCurrent } from "src/kit";

function uc(color:LinkProps["color"]):LinkProps["color"]{
  return useColorModeValue(color+".600",color+".200")
}
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
      color={uc("red")}
      fontWeight="bold"
      fontSize="xl">0.88778</Text>
      <Text
      color={uc("red")}
      flexBasis="16"
      textAlign="right"
      fontSize="md">+0.80%</Text>
    </HStack>
    <HStack justify="space-between" w="full" spacing={0}>
      <Link
      href="/finance/XAUUSD"
      color={uc("teal")} target="_blank">XAUUSD</Link>
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
let Index : NextPage = props =>{
  let [count,setCount] = useState(0)
  return <VStack>
    <HStack
    borderBottom="1px solid tomato"
    borderColor={uc("red")}
    justify="flex-end" w="full" p="4" pb="1">
      <MoonButton />
    </HStack>
    <Wrap
    borderBottom="1px solid tomato"
    borderColor={uc("red")}
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
