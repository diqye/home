// import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider, ThemeComponents} from '@chakra-ui/react'
import { extendTheme, type ThemeConfig } from '@chakra-ui/react'
import Head from 'next/head'

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: true,
}
const components: ThemeComponents = {
  textarea:{

  }
}
const theme = extendTheme({ config, components })

function MyApp({ Component, pageProps }: AppProps) {
  return (
  <ChakraProvider theme={theme}>
     <Component {...pageProps} />
     <Head>
      <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0" />
     </Head>
  </ChakraProvider>
  )
}

export default MyApp
