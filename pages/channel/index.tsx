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
            <title>信息传输频道</title>
        </Head>
        <Card w={["full","xl"]}>
            <CardHeader>
                <Heading size='md'>信息传输频道</Heading>
            </CardHeader>

            <CardBody>
                <Stack divider={<StackDivider />} spacing='4'>
                <Box>
                    <Heading size='xs' textTransform='uppercase'>
                        频道是什么?
                    </Heading>
                    <Text pt="2" fontSize="sm">频道类似一个房间，相同的频道名称可在一起共享信息。在频道里你可以发你想要共享的信息，在另一台设备输入相同的频道名称即可看到,便于多台设备之间数据传递。频道无需登陆、无需名称、进入即可发消息。</Text>
                </Box>
                <Box>
                    <Heading size='xs' textTransform='uppercase'>
                         私人频道
                    </Heading>
                    <Box h="4" ></Box>
                    <InputGroup>
                        <Input type='text' placeholder='输入频道名称' value={channel} onInput={e=>setChannel(e.currentTarget.value)}  />
                        <InputRightElement width="3em">
                            <Link href={"/channel/" + channel} passHref>
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
                        <Link href={"/channel/public"} passHref>
                            <Button as="a" variant="link" colorScheme={"blue"} > public</Button>
                        </Link>
                        <Link href={"/channel/share"} passHref>
                            <Button as="a" variant="link" colorScheme={"blue"} > share</Button>
                        </Link>
                        <Link href={"/channel/random-"+randomN} passHref>
                            <Button as="a" variant="link" colorScheme={"blue"} > random-{randomN}</Button>
                        </Link>
                    </HStack>
                </Box>
                </Stack>
            </CardBody>
            </Card>

    </Center>
}