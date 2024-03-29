// import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider, defineStyle, defineStyleConfig, StyleFunctionProps, ThemeComponents} from '@chakra-ui/react'
import { extendTheme, type ThemeConfig } from '@chakra-ui/react'
import Head from 'next/head'
import Script from 'next/script'

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: true,
}
function cmode(props:Pick<StyleFunctionProps,"colorMode">){
  return (a:string,b:string) => props.colorMode == "light" ? a : b
}
let textVariant = {
  colorv:defineStyle(props=>{
    let mode = cmode(props)
    if(props.colorScheme == "gray"){
      return {
        color: mode("gray","whiteAlpha.900")
      }
    }else if(props.colorScheme){
      return {
        color: mode(`${props.colorScheme}.600`,`${props.colorScheme}.200`)
      }
    }else{
      return {
      }
    }
  })
}
const components: ThemeComponents = {
  Text:defineStyleConfig({
    variants:textVariant,
    defaultProps:{
      variant: "colorv"
    }
  }),
  Heading:{
    variants:textVariant,
    defaultProps:{
      variant: "colorv"
    }
  },
  Link:{
    variants:textVariant,
    defaultProps:{
      variant: "colorv"
    }
  }
}
const theme = extendTheme({ config, components })

function GoogleAnalytics(){
  return <>
    <Head>
      <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0" />
    </Head>
    {/*  Google tag (gtag.js) */}
    <Script strategy="afterInteractive"  src="https://www.googletagmanager.com/gtag/js?id=G-S3464XHW9P"></Script>
    <Script dangerouslySetInnerHTML={{__html:`
        window.dataLayer = window.dataLayer || [];
        function gtag(){ dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-S3464XHW9P',{ 'transport_type': 'beacon'});
    `}}>
    </Script>
  </>
}
function MyApp({ Component, pageProps }: AppProps) {
  return (
  <ChakraProvider theme={theme}>
    <GoogleAnalytics />
     <Component {...pageProps} />
  </ChakraProvider>
  )
}

export default MyApp
