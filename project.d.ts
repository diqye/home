declare function gtag<a extends GtagAction>(
  event:"event",
  action:a,
  props: a extends keyof GtagEventProps ? GtagEventProps[a] : GtagEventProps["click"]
  ):void
declare function gtag(event:"config",...args:any)

type GtagAction = keyof GtagEventProps | string & {}
type GtagEventProps = {
  "screen_view":{
    "app_name":string,
    "screen_name":string,
    "app_id"?:string,
    "app_version"?:string,
    "app_installer_id"?:string
  },
  "timing_complete":{
    "name":string,
    value:number, // ms
    event_category?:string,
    event_label:string
  },
  "exception":{
    description:string,
    fatal:bool
  },
  "click":{
    "event_category" : string,
    "event_label": string,
    "value":number
  }
}