// import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider, ThemeComponents} from '@chakra-ui/react'
import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
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
  </ChakraProvider>
  )
}

export default MyApp
