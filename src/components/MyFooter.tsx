import { Link, VStack,Text, useColorModeValue, Box } from "@chakra-ui/react";
import { FC } from "react";

let MyMusicFooter : FC = props => {
  return <>
  <Box h="100px"></Box>
 <VStack
  w="full"
  position="absolute"
  bottom={0}
  left={0}
  background={useColorModeValue("gray.200","gray.700")}
  p="4"
  >
    <Text w="full" colorScheme="gray" fontSize="xs">
      如有建议可
      <Link color="teal.700" href="/channel/doremi" target="music">在线留言</Link>
      ，我会不定时查看；
    </Text>
    <Text w="full" colorScheme="gray" fontSize="xs">
      有超过1000字的想法可以发邮件 diqye@foxmail.com;
    </Text>
  </VStack>
  </>
}

export default MyMusicFooter