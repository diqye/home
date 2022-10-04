import { Button, Center, Wrap, WrapItem } from '@chakra-ui/react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'


const Home : NextPage = () => {
  return <Center paddingTop="10">
    <Wrap spacing="5">
      <WrapItem>
        <Link href={"/channel/home"}>
          <Button colorScheme="teal">Go to home channel</Button>
        </Link>
      </WrapItem>
      <WrapItem>
        <Link href={"/channel/share"}>
          <Button colorScheme="teal">Go to share channel</Button>
        </Link>
      </WrapItem>
      <WrapItem>
        <Link href={"/finance"}>
          <Button colorScheme="teal">finance</Button>
        </Link>
      </WrapItem>
      <WrapItem>
        <Link href={"/music"}>
          <Button colorScheme="pink">music</Button>
        </Link>
      </WrapItem>
    </Wrap>
  </Center>
}
export default Home