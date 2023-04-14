import { Box, Button, Center, Heading, HStack, Input, InputGroup, InputRightElement, Stack, StackDivider } from "@chakra-ui/react";
import { Card,Text, CardHeader, CardBody, CardFooter } from '@chakra-ui/react'
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function Channel(props:{}){
    let [channel,setChannel] = useState("")
    let [randomN,setRandomN] = useState(7)
    useEffect(()=>{
        setRandomN(Math.trunc(Math.random()*100))
    },[])
    return <Center>
        <Head>
            <title>自由会议频道</title>
        </Head>
        <Card w={["full","xl"]}>
            <CardHeader>
                <Heading size='md'>自由会议频道</Heading>
            </CardHeader>

            <CardBody>
                <Stack divider={<StackDivider />} spacing='4'>
                <Box>
                    <Heading size='xs' textTransform='uppercase'>
                        频道是什么?
                    </Heading>
                    <Text pt="2" fontSize="sm">频道类似一个房间，相同的频道名称可在一起音视频通话。另一个朋友输入相同的频道名称即可加入通话,或者复制当前页面链接给朋友亦可加入。无需登陆。</Text>
                </Box>
                <Box>
                    <Heading size='xs' textTransform='uppercase'>
                         私人频道
                    </Heading>
                    <Box h="4" ></Box>
                    <InputGroup>
                        <Input type='text' placeholder='输入频道名称' value={channel} onInput={e=>setChannel(e.currentTarget.value)}  />
                        <InputRightElement width="3em">
                            <Link href={"/meeting/" + channel} passHref>
                                <Button as="a" size="sm" mr="1" colorScheme="teal" isDisabled={channel == ""}> 进入</Button>
                            </Link>
                        </InputRightElement>
                    </InputGroup>
                </Box>
                <Box>
                    <Heading size='xs' textTransform='uppercase'>
                        固定频道
                    </Heading>
                    <Box h="4" ></Box>
                    <HStack>
                        <Link href={"/meeting/public"} passHref>
                            <Button as="a" variant="link" colorScheme={"blue"} > public</Button>
                        </Link>
                        <Link href={"/meeting/share"} passHref>
                            <Button as="a" variant="link" colorScheme={"blue"} > share</Button>
                        </Link>
                        <Link href={"/meeting/random-"+randomN} passHref>
                            <Button as="a" variant="link" colorScheme={"blue"} > random-{randomN}</Button>
                        </Link>
                    </HStack>
                </Box>
                </Stack>
            </CardBody>
            </Card>

    </Center>
}