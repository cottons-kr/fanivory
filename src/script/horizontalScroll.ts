document.querySelector("#liveList").addEventListener("wheel", (e: WheelEvent) => {
    document.querySelector("#liveList").scrollLeft += e.deltaY*2
})
document.querySelector("#tuberListFrame").addEventListener("wheel", (e: WheelEvent) => {
    console.log(e)
    document.querySelector("#tuberList").scrollLeft += e.deltaY*2
})
