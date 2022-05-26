const joinDate: HTMLElement = document.querySelector("#joinDate")
const totalViews: HTMLElement = document.querySelector("#totalViews")
const locationTooltip: HTMLSpanElement = document.querySelector("#locationIcon .tooltip")
const alarmTooltip: HTMLSpanElement = document.querySelector("#alarmBtn .tooltip")
const subscribers: HTMLSpanElement = document.querySelector("#subscribers")
const aboutContent: HTMLElement = document.querySelector("#aboutPopupFrame p")
const addYoutuberPopup = document.getElementById("addYoutuberPopup")
const tuberListFrame = document.getElementById("tuberList")
const infoFrame = document.getElementById("infoFrame")
const paramInput: HTMLInputElement = document.querySelector("#paramInput")
const resultList = document.getElementById("resultList")
const contentFrame = document.getElementById("contentFrame")
const loading = document.getElementById("contentLoading")
const reloadBtn: HTMLDivElement = document.querySelector("#reloadBtn img")
const reloadBtnTooltip: HTMLSpanElement = document.querySelector("#reloadBtn .tooltip")
const liveListFrame: HTMLDivElement = document.querySelector("#liveList")
const videoListFrame: HTMLDivElement = document.querySelector("#videoList")
const profileImg: HTMLImageElement = document.querySelector("#profileImg")
const channelName: HTMLElement = document.querySelector("#channelName")
const removeBtn: HTMLDivElement = document.querySelector("#removeBtn")
const subscriberFrame = document.getElementById("subscriberFrame")
const liveListTitle: HTMLDivElement = document.querySelector("#liveTitle")
const videoListTitle: HTMLDivElement = document.querySelector("#videoTitle")
const homeSection: HTMLTableSectionElement = document.querySelector(".homeSection")

let addYoutuberBtn = document.getElementById("addYoutuberBtn")

const AUTO_RELOAD_DELAY = "auto_reload_delay"
const AUTO_RELOAD_ENABLE = "auto_reload_enable"
const BOTTOM_YOUTUBER_LIST = "bottom_youtuber_list"
const ENABLE_DEVTOOLS = "enable_devtools"
const SLOW_ANIMATION = "slow_animation"
const DISABLE_ANIMATION = "disable_animation"
const RELOAD_DELAY = "reload_delay"
const MAX_AUTO_RELOAD_COUNT = "max_auto_reload_count"

let showingYoutuber: string = ""
let reloadInterval: NodeJS.Timeout
let isReloading: Boolean = false
let autoReloadedYoutuber: Array<string> = []
let autoReloadingYoutuber: Array<string> = []
let loadingYoutuber: string = ""
let showingTimeout: NodeJS.Timeout
let reloadingYoutuber: string = ""

function showLives(data: any) {
    if (data["live"].length != 0) { // Live
        if (data["live"] == undefined) {
            liveListFrame.style.display = "none"
            document.getElementById("liveTitle").style.display = "none"
            return
        }
        liveListFrame.style.display = "flex"
        showElement(document.querySelector("#liveTitle"))
        advencedPlayAnimation(document.querySelector("#liveTitle"), {
            animationName: "showList",
            animationDuration: 300,
            removeClassName: "hideList"
        })
        const liveList: Array<any> = data["live"]
        liveList.forEach(livedata => {
            const frame = document.createElement("div")
            const hoveringContent = document.createElement("div")
            const title = document.createElement("p")

            frame.classList.add("liveContent")
            frame.style.background = `url("${livedata["img"]}") no-repeat`
            hoveringContent.classList.add("hoveringContent")
            title.classList.add("videoTitle")
            title.innerHTML = livedata["title"]

            frame.addEventListener("mouseover", () => {
                showElementWithAnimation(hoveringContent)
            })
            
            frame.addEventListener("mouseleave", () => {
                hideElementWithAnimation(hoveringContent)
            })

            hoveringContent.appendChild(title)
            frame.appendChild(hoveringContent)
            liveListFrame.appendChild(frame)
            playAnimation(frame, "showVideo")
        })
    } else {
        hideElement(liveListFrame)
        hideElement(document.getElementById("liveTitle"))
    } 
}

function showVideos(data: any) {
    const videoListFrame: HTMLElement = document.querySelector("#videoList")
    if (data["video"].length != 0) { // Video
        if (data["video"] == undefined) {
            hideElement(videoListFrame)
            hideElement(document.getElementById("videoTitle"))
            return
        }
        if (document.getElementById("liveList").offsetHeight <= 0) { videoListFrame.style.height = "calc(100% - 69px)" }
        else { videoListFrame.style.height = `calc(100% - ${document.getElementById("liveList").offsetHeight+109}px)` }
        videoListFrame.style.display = "flex"
        showElement(document.querySelector("#videoTitle"))
        advencedPlayAnimation(document.querySelector("#videoTitle"), {
            animationName: "showList",
            animationDuration: 300,
            removeClassName: "hideList"
        })
        const videoList: Array<any> = data["video"]
        videoList.forEach(videodata => {
            const frame = document.createElement("div")
            const hoveringContent = document.createElement("div")
            const title = document.createElement("p")
            const info = document.createElement("p")

            frame.classList.add("videoContent")
            if (videodata["img"].length < 10) { frame.style.background = `url("${getThumbnail(videodata["link"])}") no-repeat` }
            else { frame.style.background = `url("${videodata["img"]}") no-repeat` }
            hoveringContent.classList.add("hoveringContent")
            title.classList.add("videoTitle")
            title.innerHTML = videodata["title"]
            info.classList.add("videoInfo")
            if (videodata["views"].includes("회")) { info.innerHTML = `조회수 ${videodata["views"]} · ${videodata["date"]} 전` }
            else { info.innerHTML = `조회수 ${videodata["views"]}회 · ${videodata["date"]} 전` }

            frame.addEventListener("mouseover", () => {
                showElementWithAnimation(hoveringContent)
            })
            frame.addEventListener("mouseleave", () => {
                hideElementWithAnimation(hoveringContent)
            })

            hoveringContent.appendChild(title)
            hoveringContent.appendChild(info)
            frame.appendChild(hoveringContent)
            videoListFrame.appendChild(frame)
            playAnimation(frame, "showVideo")
        })
    } else {
        hideElement(document.getElementById("videoTitle"))
        hideElement(videoListFrame)
    }
}

function showYoutuber(name: string, force=false): void {
    if (showingYoutuber == name && !force) { return }

    const data = window.getYoutuberFromStorage(name)

    reloadBtnTooltip.innerHTML = `최근 새로고침 : ${window.getYoutuberReloadTime(name)}`

    showingYoutuber = name
    window.setRecentYoutuberToStorage(name)
    if (loadingYoutuber != name) { reloadYoutuber() }

    setTimeout(() => {
        if (reloadingYoutuber == showingYoutuber && !reloadBtn.classList.contains("reloading")) {
            playAnimation(reloadBtn, "reloading")
            reloadBtnTooltip.innerHTML = "새로고침중..." 
        }
        else if (reloadingYoutuber != showingYoutuber && reloadBtn.classList.contains("reloading")) { reloadBtn.classList.remove("reloading") }
    }, 300)

    if (isMorePopupOpen) {
        isMorePopupOpen = hidePopup(moreBtnPopupFrame)
    }
    if (isAboutPopupOpen) {
        document.getElementById("aboutIcon").style.background = `url("./asset/comment.svg") no-repeat fixed`
        isAboutPopupOpen = hidePopup(aboutPopupFrame)
    }
    if (isSetNotification()) {
        alarmTooltip.innerHTML = "알람 설정 : 켜짐"
        alarmBtn.style.background = `url("./asset/bell_active.svg") no-repeat fixed`
    }
    else if (!isSetNotification()) {
        alarmTooltip.innerHTML = "알람 설정 : 꺼짐"
        alarmBtn.style.background = `url("./asset/bell.svg") no-repeat fixed`
    }

    playAnimation(liveListTitle, "hideList")
    playAnimation(videoListTitle, "hideList")

    playAnimation(channelName, "hideInfo")
    playAnimation(subscriberFrame, "hideInfo")
    playAnimation(profileImg, "hideInfo")
    hideElementWithAnimation(loading)
    hideElementWithAnimation(homeSection, true)

    playAnimation(infoFrame, "showInfoFrame")
    if (contentFrame.classList.contains("longWidth")) {
        advencedPlayAnimation(contentFrame, {
            animationName: "default",
            animationDuration: 300,
            removeClassName: "longWidth"
        })
    }

    showElementWithAnimation(videoListFrame)
    
    removeAllChild(liveListFrame, { transition: true })
    removeAllChild(videoListFrame, { transition: true })

    clearTimeout(showingTimeout)
    showingTimeout = setTimeout(() => { // 기본 정보
        playAnimation(channelName, "showInfo")
        playAnimation(subscriberFrame, "showInfo")
        playAnimation(profileImg, "showInfo")

        aboutContent.innerText = data["about"]["about"]

        profileImg.src = data["profileImg"]
        channelName.innerHTML = data["name"]
        subscribers.innerHTML = `구독자 ${data["subscribers"]}`
        joinDate.innerHTML = `가입일 : ${data["about"]["joindate"]}`
        totalViews.innerHTML = `총합 조회수 : ${data["about"]["totalviews"]}`
        if (data["about"]["location"] != undefined) { locationTooltip.innerHTML = data["about"]["location"] }
        else { locationTooltip.innerHTML = "알 수 없음" }

        if (loadingYoutuber == showingYoutuber) {
            showElementWithAnimation(loading)
        }

        if (loadingYoutuber != name) {
            showLives(data)
            showVideos(data)
        }
    }, 300)
}

function updateVideo(data: Array<any>) {
    const lists = videoListFrame.childNodes
    let index = 0
    lists.forEach((el: HTMLElement) => {
        const title = el.querySelector(".hoveringContent .videoTitle")
        const info = el.querySelector(".hoveringContent .videoInfo")

        title.innerHTML = data[index]["title"]
        info.innerHTML = `조회수 ${data[index]["views"]} · ${data[index]["date"]} 전`
        index += 1
    })
}

function updateLive(data: Array<any>) {
    const lists = liveListFrame.childNodes
    let index = 0
    lists.forEach((el: HTMLElement) => {
        const title = el.querySelector(".hoveringContent .videoTitle")

        title.innerHTML = data[index]["title"]
        index += 1
    })
}

function updateInfo(data: any) {
    profileImg.src = data["profileImg"]
    channelName.innerHTML = data["name"]
    subscribers.innerHTML = `구독자 ${data["subscribers"]}`
    joinDate.innerHTML = `가입일 : ${data["about"]["joindate"]}`
    totalViews.innerHTML = `총합 조회수 : ${data["about"]["totalviews"]}`
    if (data["about"]["location"] != undefined) { locationTooltip.innerHTML = data["about"]["location"] }
    else { locationTooltip.innerHTML = "알 수 없음" }
}
