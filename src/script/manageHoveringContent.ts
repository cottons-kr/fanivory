const content = document.querySelector(".videoContent")
const hoveringContent = document.querySelector(".videoContent .hoveringContent")

content.addEventListener("mouseover", () => {
    hoveringContent.classList.add("show")
    hoveringContent.classList.remove("hide")
})

content.addEventListener("mouseleave", () => {
    hoveringContent.classList.add("hide")
    hoveringContent.classList.remove("show")
})
