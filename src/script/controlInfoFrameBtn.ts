const moreBtnPopupFrame: HTMLDivElement = document.querySelector("#moreBtnPopupFrame")
const aboutPopupFrame: HTMLDivElement = document.querySelector("#aboutPopupFrame")

function hidePopup(target: HTMLElement): boolean {
    hideElementWithAnimation(target, true)
    return false
}

function showPopup(target: HTMLElement): boolean {
    showElementWithAnimation(target)
    return true
}

let isMorePopupOpen: boolean = false // 다른 유튜버로 전환시 FadeOut 효과 적용안됨
document.getElementById("moreBtn").addEventListener("click", () => {
    if (isMorePopupOpen) {
        isMorePopupOpen = hidePopup(moreBtnPopupFrame)
    } else {
        isMorePopupOpen = showPopup(moreBtnPopupFrame)
        if (isAboutPopupOpen) {
            isAboutPopupOpen = hidePopup(aboutPopupFrame)
            document.getElementById("aboutIcon").style.background = `url("./asset/comment.svg") no-repeat fixed`
        }
    }
})

let isAboutPopupOpen: boolean = false
document.getElementById("aboutIcon").addEventListener("click", () => {
    if (isAboutPopupOpen) {
        isAboutPopupOpen = hidePopup(aboutPopupFrame)
        document.getElementById("aboutIcon").style.background = `url("./asset/comment.svg") no-repeat fixed`
    } else {
        isAboutPopupOpen = showPopup(aboutPopupFrame)
        
        document.getElementById("aboutIcon").style.background = `url("./asset/comment_active.svg") no-repeat fixed`
        if (isMorePopupOpen) { isMorePopupOpen = hidePopup(moreBtnPopupFrame) }
    }
})
