import { MoonIcon, SunIcon } from "@chakra-ui/icons"
import { IconButton, useColorMode } from "@chakra-ui/react"
import { FC } from "react"

let MoonButton : FC = props =>{
  let {colorMode,toggleColorMode} = useColorMode()
  let ColorModeIcon = colorMode == "light" ? <MoonIcon />  : <SunIcon />
  return <IconButton
          title="高亮/夜间模式"
          aria-label='高亮/夜间模式' size={"sm"} onClick={toggleColorMode} icon={ColorModeIcon} /> 
}

export default MoonButton