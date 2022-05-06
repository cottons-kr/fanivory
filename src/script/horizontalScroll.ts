const liveListFrame: HTMLDivElement = document.querySelector("#liveList")

liveListFrame.addEventListener("wheel", (e) => {
    liveListFrame.scrollLeft += e.deltaY*2
})
