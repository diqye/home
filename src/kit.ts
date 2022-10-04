import { useRef } from "react"


export function useCurrent<T extends Record<string,Function>>(fns:T):T{
  let ref = useRef(fns)
  for(let key in fns){
    ref.current[key] = fns[key]
  }
  return ref.current
}
