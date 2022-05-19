function hideElement(el: HTMLElement) {
    el.style.display = "none"
}

function showElement(el: HTMLElement) {
    el.style.display = "block"
}

function hideElementWithAnimation(el: HTMLElement, displayNone: boolean = false, animationDuration: number = 300) {
    el.classList.add("hide")
    el.classList.remove("show")
    if (displayNone) {
        setTimeout(() => { el.style.display = "none" }, animationDuration)
    }
}

function showElementWithAnimation(el: HTMLElement) {
    el.style.display = "block"
    el.classList.add("show")
    el.classList.remove("hide")
}

function advencedPlayAnimation(el: HTMLElement, param={
    animationName: "",
    animationDuration: 300,
    removeClassName: ""
}) {
    el.classList.remove(param.removeClassName)
    el.classList.add(param.animationName)
}

function playAnimation(el: HTMLElement, animationName: string) {
    if (animationName.includes("hide")) {
        el.classList.remove(animationName.replace("hide", "show"))
    }
    else if (animationName.includes("show")) {
        el.classList.remove(animationName.replace("show", "hide"))
    }
    el.classList.add(animationName)
}

function removeAllChild(el: HTMLElement, param={ transition: false }) {
    if (param.transition) {
        el.childNodes.forEach((e: any) => {
            if (e.tagName) {
                advencedPlayAnimation(e, {
                    animationName: "hideVideo",
                    animationDuration: 300,
                    removeClassName: "showVideo"
                })
            }
        })
        setTimeout(() => { while (el.firstChild) { el.removeChild(el.lastChild) } }, 300)
    }
    else { while (el.firstChild) { el.removeChild(el.lastChild) } }
}
