
/**
 * 
 * @param {HTMLCanvasElement} canvas 
 * @param {string} name
 * @param {number} duration seconds
 * @returns {void}
 */
function downloadStickWebm(canvas,name,duration){
    let stream = canvas.captureStream()
    let mr = new MediaRecorder(stream)
    mr.addEventListener("dataavailable",e=>{
        let url = URL.createObjectURL(e.data)
        let aElement = document.createElement("a")
        aElement.setAttribute("href",url)
        aElement.setAttribute("download",name+".webm")
        aElement.dispatchEvent(new MouseEvent("click",{
            bubbles:true,
            cancelable:true
        }))
    })
    mr.start()
    setTimeout(() => {
       mr.stop() 
    }, duration * 1000);
}