// <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
//  <defs><style>.cls-1{fill:#ffd38d;}.cls-2{fill:#6d4135;}</style></defs>
//  <title>volume-filled</title>
//  <path class="cls-1" d="M21.33,277.33V234.67A42.67,42.67,0,0,1,64,192h42.67l106.67-85.33V405.33L106.67,320H64A42.67,42.67,0,0,1,21.33,277.33Z"/>
//  <path class="cls-2" d="M213.34,426.67A21.35,21.35,0,0,1,200,422L99.18,341.33H64a64.07,64.07,0,0,1-64-64V234.67a64.07,64.07,0,0,1,64-64H99.18L200,90a21.33,21.33,0,0,1,34.66,16.66V405.33a21.33,21.33,0,0,1-21.33,21.33ZM64,213.33a21.36,21.36,0,0,0-21.33,21.33v42.67A21.36,21.36,0,0,0,64,298.67h42.67A21.32,21.32,0,0,1,120,303.34l72,57.6V151.05l-72,57.6a21.32,21.32,0,0,1-13.33,4.68Z"/>
//  <path class="cls-2" d="M303.25,320.32a21.33,21.33,0,0,1-15.66-35.81,42.23,42.23,0,0,0,0-57,21.33,21.33,0,1,1,31.33-29,84.89,84.89,0,0,1,0,114.94A21.26,21.26,0,0,1,303.25,320.32Z"/>
//  <path class="cls-2" d="M363.62,380.7a21.33,21.33,0,0,1-15.39-36.1,127.61,127.61,0,0,0,0-177.19A21.33,21.33,0,0,1,379,137.87a170.26,170.26,0,0,1,0,236.27A21.28,21.28,0,0,1,363.62,380.7Z"/>
//  <path class="cls-2" d="M424.1,441.18a21.34,21.34,0,0,1-15.28-36.23,213.59,213.59,0,0,0,0-297.9,21.34,21.34,0,0,1,30.55-29.79,256.28,256.28,0,0,1,0,357.48A21.3,21.3,0,0,1,424.1,441.18Z"/>
// </svg>
import { createIcon } from '@chakra-ui/icons'
import { Icon, IconProps } from '@chakra-ui/react'
import { FC } from 'react'

// using `path`
// export const VolumeIcon = createIcon({
//   displayName: 'VolumeIcon',
//   viewBox: '0 0 512 512',
//   // path can also be an array of elements, if you have multiple paths, lines, shapes, etc.
//   path: (<>
//     <path fill="currentColor" d="M21.33,277.33V234.67A42.67,42.67,0,0,1,64,192h42.67l106.67-85.33V405.33L106.67,320H64A42.67,42.67,0,0,1,21.33,277.33Z"/>
//     <path fill="currentColor" d="M213.34,426.67A21.35,21.35,0,0,1,200,422L99.18,341.33H64a64.07,64.07,0,0,1-64-64V234.67a64.07,64.07,0,0,1,64-64H99.18L200,90a21.33,21.33,0,0,1,34.66,16.66V405.33a21.33,21.33,0,0,1-21.33,21.33ZM64,213.33a21.36,21.36,0,0,0-21.33,21.33v42.67A21.36,21.36,0,0,0,64,298.67h42.67A21.32,21.32,0,0,1,120,303.34l72,57.6V151.05l-72,57.6a21.32,21.32,0,0,1-13.33,4.68Z"/>
//     <path fill="currentColor" d="M303.25,320.32a21.33,21.33,0,0,1-15.66-35.81,42.23,42.23,0,0,0,0-57,21.33,21.33,0,1,1,31.33-29,84.89,84.89,0,0,1,0,114.94A21.26,21.26,0,0,1,303.25,320.32Z"/>
//     <path fill="currentColor" d="M363.62,380.7a21.33,21.33,0,0,1-15.39-36.1,127.61,127.61,0,0,0,0-177.19A21.33,21.33,0,0,1,379,137.87a170.26,170.26,0,0,1,0,236.27A21.28,21.28,0,0,1,363.62,380.7Z"/>
//     <path fill="currentColor" d="M424.1,441.18a21.34,21.34,0,0,1-15.28-36.23,213.59,213.59,0,0,0,0-297.9,21.34,21.34,0,0,1,30.55-29.79,256.28,256.28,0,0,1,0,357.48A21.3,21.3,0,0,1,424.1,441.18Z"/>
//   </>
//   ),
// })

export let VolumeIcon:FC<IconProps & {ratio:number}> = props => 
  <Icon viewBox='0 0 512 512'>
    <path fill="currentColor" d="M21.33,277.33V234.67A42.67,42.67,0,0,1,64,192h42.67l106.67-85.33V405.33L106.67,320H64A42.67,42.67,0,0,1,21.33,277.33Z"/>
    <path fill="currentColor" d="M213.34,426.67A21.35,21.35,0,0,1,200,422L99.18,341.33H64a64.07,64.07,0,0,1-64-64V234.67a64.07,64.07,0,0,1,64-64H99.18L200,90a21.33,21.33,0,0,1,34.66,16.66V405.33a21.33,21.33,0,0,1-21.33,21.33ZM64,213.33a21.36,21.36,0,0,0-21.33,21.33v42.67A21.36,21.36,0,0,0,64,298.67h42.67A21.32,21.32,0,0,1,120,303.34l72,57.6V151.05l-72,57.6a21.32,21.32,0,0,1-13.33,4.68Z"/>
    {props.ratio > 0.1 &&
    <path fill="currentColor" d="M303.25,320.32a21.33,21.33,0,0,1-15.66-35.81,42.23,42.23,0,0,0,0-57,21.33,21.33,0,1,1,31.33-29,84.89,84.89,0,0,1,0,114.94A21.26,21.26,0,0,1,303.25,320.32Z"/>
    }
    {props.ratio > 0.4 &&
    <path fill="currentColor" d="M363.62,380.7a21.33,21.33,0,0,1-15.39-36.1,127.61,127.61,0,0,0,0-177.19A21.33,21.33,0,0,1,379,137.87a170.26,170.26,0,0,1,0,236.27A21.28,21.28,0,0,1,363.62,380.7Z"/>
    }
    {props.ratio > 0.7 &&
    <path fill="currentColor" d="M424.1,441.18a21.34,21.34,0,0,1-15.28-36.23,213.59,213.59,0,0,0,0-297.9,21.34,21.34,0,0,1,30.55-29.79,256.28,256.28,0,0,1,0,357.48A21.3,21.3,0,0,1,424.1,441.18Z"/>
    }
  </Icon>


// OR using the `d` value of a path (the path definition) directly
// export let VolumeIcon = createIcon({
//   displayName: 'VolumeIcon',
//   viewBox: '0 0 512 512',
//   d: 'M213.34,426.67A21.35,21.35,0,0,1,200,422L99.18,341.33H64a64.07,64.07,0,0,1-64-64V234.67a64.07,64.07,0,0,1,64-64H99.18L200,90a21.33,21.33,0,0,1,34.66,16.66V405.33a21.33,21.33,0,0,1-21.33,21.33ZM64,213.33a21.36,21.36,0,0,0-21.33,21.33v42.67A21.36,21.36,0,0,0,64,298.67h42.67A21.32,21.32,0,0,1,120,303.34l72,57.6V151.05l-72,57.6a21.32,21.32,0,0,1-13.33,4.68Z',
// })
