import YoutubePlayer from "youtube-player"
import { YouTubePlayer } from "youtube-player/dist/types"

let addYoutuberBtn = document.getElementById("addYoutuberBtn")
const addYoutuberPopup = document.getElementById("addYoutuberPopup")
const tuberListFrame = document.getElementById("tuberList")
const infoFrame = document.getElementById("infoFrame")
const paramInput: HTMLInputElement = document.querySelector("#paramInput")
const resultList = document.getElementById("resultList")
const contentFrame = document.getElementById("contentFrame")
const loading = document.getElementById("contentLoading")
const moreBtnPopupFrame: HTMLDivElement = document.querySelector("#moreBtnPopupFrame")
const reloadBtn: HTMLDivElement = document.querySelector("#reloadBtn img")
const reloadBtnTooltip: HTMLSpanElement = document.querySelector("#reloadBtn .tooltip")
const liveListFrame: HTMLDivElement = document.querySelector("#liveList")
const videoListFrame: HTMLDivElement = document.querySelector("#videoList")
const subscribers: HTMLSpanElement = document.querySelector("#subscribers")
const profileImg: HTMLImageElement = document.querySelector("#profileImg")
const channelName: HTMLElement = document.querySelector("#channelName")
const joinDate: HTMLElement = document.querySelector("#joinDate")
const totalViews: HTMLElement = document.querySelector("#totalViews")
const locationTooltip: HTMLSpanElement = document.querySelector("#locationIcon .tooltip")
const removeBtn: HTMLDivElement = document.querySelector("#removeBtn")
const subscriberFrame = document.getElementById("subscriberFrame")
const liveListTitle: HTMLDivElement = document.querySelector("#liveTitle")
const videoListTitle: HTMLDivElement = document.querySelector("#videoTitle")

let loadingYoutuber: string = ""
let showingYoutuber: string = ""
let showingTimeout: NodeJS.Timeout
let reloadInterval: NodeJS.Timeout
let isReloading: Boolean = false
let reloadingYoutuber: string = ""
let autoReloadedYoutuber: Array<string> = []
let autoReloadingYoutuber: Array<string> = []

const AUTO_RELOAD_DELAY = "auto_reload_delay"
const AUTO_RELOAD_ENABLE = "auto_reload_enable"
const BOTTOM_YOUTUBER_LIST = "bottom_youtuber_list"
const ENABLE_DEVTOOLS = "enable_devtools"
const SLOW_ANIMATION = "slow_animation"
const DISABLE_ANIMATION = "disable_animation"
const RELOAD_DELAY = "reload_delay"
const MAX_AUTO_RELOAD_COUNT = "max_auto_reload_count"

function getThumbnail(url: string) {
    return (`https://i.ytimg.com/vi/${url.replace(/^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/g,"$1")}/original.jpg`)
}

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

function loadSavedYoutubers() {
    if (localStorage["youtuber"]) { 
        removeAllChild(tuberListFrame)
        const youtubers: Array<any> = JSON.parse(localStorage["youtuber"])
        youtubers.forEach(data => { addContentToList(data["profileImg"], data["name"]) })
    }
    if (window.getYoutuberListFromStorage().length == 0) {
        const addBtnFrame = document.createElement("div")
        const addBtnImg = document.createElement("img")
        if (addYoutuberPopup.classList.contains("show")) {
            addBtnFrame.style.transform = "rotate(45deg)"
        } else if (addYoutuberPopup.classList.contains("hide")) {
            addBtnFrame.style.transform = "rotate(0deg)"
        }
        addBtnFrame.classList.add("tuberListContent")
        addBtnFrame.setAttribute("id", "addYoutuberBtn")
        addBtnImg.src = "../src/asset/add.svg"
        addBtnImg.alt = "Add YouTuber"
        addBtnFrame.appendChild(addBtnImg)
        addBtnFrame.addEventListener("click", addYoutuberBtnClickEffect)
        addYoutuberBtn = addBtnFrame
        setTimeout(() => { addYoutuberPopup.style.left = `${addBtnFrame.offsetLeft + 80}px` }, 100)
        
        tuberListFrame.appendChild(addBtnFrame)
    }
}

function showRecentYoutuber() {
    const status = window.getStatusFromStorage()
    let recentYoutuber = status["recentYoutuber"]
    if (recentYoutuber) { showYoutuber(recentYoutuber) }
    else if (localStorage["youtuber"]) {
        if (JSON.parse(localStorage["youtuber"]).length != 0) {
            recentYoutuber = JSON.parse(localStorage["youtuber"])[0]["name"]
            showYoutuber(recentYoutuber)
        }
    }
}

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
    isMorePopupOpen = false
    window.setRecentYoutuberToStorage(name)
    if (loadingYoutuber != name) { reloadYoutuber() }

    setTimeout(() => {
        if (reloadingYoutuber == showingYoutuber && !reloadBtn.classList.contains("reloading")) {
            playAnimation(reloadBtn, "reloading")
            reloadBtnTooltip.innerHTML = "새로고침중..." 
        }
        else if (reloadingYoutuber != showingYoutuber && reloadBtn.classList.contains("reloading")) { reloadBtn.classList.remove("reloading") }
    }, 300)


    playAnimation(liveListTitle, "hideList")
    playAnimation(videoListTitle, "hideList")

    playAnimation(channelName, "hideInfo")
    playAnimation(subscriberFrame, "hideInfo")
    playAnimation(profileImg, "hideInfo")
    hideElementWithAnimation(loading)
    setTimeout(() => { hideElement(moreBtnPopupFrame) }, 300)

    playAnimation(infoFrame, "showInfoFrame")
    if (contentFrame.classList.contains("longWidth")) {
        advencedPlayAnimation(contentFrame, {
            animationName: "default",
            animationDuration: 300,
            removeClassName: "longWidth"
        })
    }

    if (moreBtnPopupFrame.classList.contains("show")) {
        hideElementWithAnimation(moreBtnPopupFrame)
    }

    document.querySelectorAll("#contentFrame .welcome").forEach((el: HTMLElement) => {
        console.log(el)
        hideElementWithAnimation(el, true)
    })
    showElementWithAnimation(videoListFrame)
    
    removeAllChild(liveListFrame, { transition: true })
    removeAllChild(videoListFrame, { transition: true })

    clearTimeout(showingTimeout)
    showingTimeout = setTimeout(() => { // 기본 정보
        playAnimation(channelName, "showInfo")
        playAnimation(subscriberFrame, "showInfo")
        playAnimation(profileImg, "showInfo")

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

function addContentToList(imgSrc: string, name: string) {
    if (tuberListFrame.hasChildNodes()) { tuberListFrame.removeChild(document.querySelector("#addYoutuberBtn")) }

    const contentFrame = document.createElement("div")
    const contentImg = document.createElement("img")
    contentFrame.classList.add("tuberListContent")
    contentFrame.setAttribute("aria-label", name)
    contentImg.src = imgSrc
    contentFrame.addEventListener("click", () => {showYoutuber(name)})
    contentFrame.appendChild(contentImg)
    tuberListFrame.appendChild(contentFrame)

    const addBtnFrame = document.createElement("div")
    const addBtnImg = document.createElement("img")
    if (addYoutuberPopup.classList.contains("show")) {
        addBtnFrame.style.transform = "rotate(45deg)"
    } else if (addYoutuberPopup.classList.contains("hide")) {
        addBtnFrame.style.transform = "rotate(0deg)"
    }
    addBtnFrame.classList.add("tuberListContent")
    addBtnFrame.setAttribute("id", "addYoutuberBtn")
    addBtnImg.src = "../src/asset/add.svg"
    addBtnImg.alt = "Add YouTuber"
    addBtnFrame.appendChild(addBtnImg)
    addBtnFrame.addEventListener("click", addYoutuberBtnClickEffect)
    addYoutuberBtn = addBtnFrame
    setTimeout(() => { addYoutuberPopup.style.left = `${addBtnFrame.offsetLeft + 80}px` }, 100)
    
    tuberListFrame.appendChild(addBtnFrame)
}

async function addYoutuber(url: string) {
    hideElementWithAnimation(addYoutuberPopup)
    addYoutuberBtn.style.transform = "rotate(0deg)"

    let data = await window.getYoutuber(url)
    addContentToList(data["profileImg"], data["name"])
    window.saveYoutuberToStorage(data)
    loadingYoutuber = data["name"]
    showYoutuber(data["name"], true)
    showElementWithAnimation(loading)

    window.saveYoutuberToStorage({...data, ...await window.getInfo(url)})
    hideElementWithAnimation(loading, true)
    loadingYoutuber = ""
    setTimeout(() => { showYoutuber(data["name"], true) }, 500)
}

function removeYoutuber(name: string) {
    clearInterval(reloadInterval)
    playAnimation(liveListTitle, "hideList")
    playAnimation(videoListTitle, "hideList")

    playAnimation(channelName, "hideInfo")
    playAnimation(subscriberFrame, "hideInfo")
    playAnimation(profileImg, "hideInfo")
    hideElementWithAnimation(loading)
    hideElementWithAnimation(moreBtnPopupFrame, true)

    document.querySelectorAll("#contentFrame .welcome").forEach((el: HTMLElement) => {
        hideElementWithAnimation(el, true)
    })
    showElementWithAnimation(videoListFrame)

    removeAllChild(liveListFrame, { transition: true })
    removeAllChild(videoListFrame, { transition: true })
    if (!window.getYoutuberListFromStorage()[0]) { showYoutuber(window.getYoutuberListFromStorage()[0]) }
    else {
        setTimeout(() =>{
            advencedPlayAnimation(contentFrame, {
                animationName: "longWidth",
                animationDuration: 300,
                removeClassName: "default"
            })
            playAnimation(infoFrame, "hideInfoFrame")
    
            document.querySelectorAll("#contentFrame .welcome").forEach((el: HTMLElement) => {
                showElementWithAnimation(el)
            })
        }, 300)
    }
    window.removeYoutuberFromStorage(name)
    loadSavedYoutubers()
}

function sleep(time: number) {
    return new Promise(resolve => setTimeout(resolve, time))
}

async function autoReloadYoutuber() {
    while (true) {
        if (!window.getSettingFromStorage(AUTO_RELOAD_ENABLE)) { await sleep(window.getSettingFromStorage(AUTO_RELOAD_DELAY)); continue }
        else {
            window.getYoutuberListFromStorage().forEach(async (name: string) => {
                if (autoReloadedYoutuber.length == window.getYoutuberListFromStorage().length) { autoReloadedYoutuber = [] }
                if (autoReloadingYoutuber.includes(name) || autoReloadedYoutuber.includes(name)) { return }
                if (autoReloadingYoutuber.length >= window.getSettingFromStorage(MAX_AUTO_RELOAD_COUNT)) { return }
                if (name == showingYoutuber) { return }
                console.log(`${name}: AUTORELOAD START`)

                autoReloadingYoutuber.push(name)
                const newData = await window.getInfo(window.getYoutuberFromStorage(name)["link"])
                window.saveYoutuberToStorage({...window.getYoutuberFromStorage(name), ...newData})
                console.log(`${name}: AUTORELOADED`)
                window.setYoutuberReloadTime(name, getDate())
                autoReloadedYoutuber.push(name)
                autoReloadingYoutuber.splice(autoReloadingYoutuber.indexOf(name), 1)
            })
            await sleep(window.getSettingFromStorage(AUTO_RELOAD_DELAY))
        }
    }
}

function getDate(): string {
    const today = new Date()

    const year = today.getFullYear()
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + today.getDate()).slice(-2)
    const hours = ('0' + today.getHours()).slice(-2)
    const minutes = ('0' + today.getMinutes()).slice(-2)
    const seconds = ('0' + today.getSeconds()).slice(-2)

    return `${year}. ${month}. ${day}. ${hours}:${minutes}:${seconds}`
}

function reloadYoutuber() {
    clearInterval(reloadInterval)
    reloadInterval = setInterval(async () => {
        if (isReloading) { return }
        else { isReloading = true }

        const currentYoutuber = showingYoutuber
        reloadingYoutuber = currentYoutuber
        playAnimation(reloadBtn, "reloading")
        reloadBtnTooltip.innerHTML = "새로고침중..."
        console.log(`${currentYoutuber}: RELOAD START`)
        const newData = await window.getInfo(window.getYoutuberFromStorage(currentYoutuber)["link"])
        console.log(`${currentYoutuber}: RELOADED`)
        if (currentYoutuber !== showingYoutuber) {
            window.saveYoutuberToStorage({...window.getYoutuberFromStorage(currentYoutuber), ...newData})
            reloadBtn.classList.remove("reloading")
            isReloading = false
            reloadingYoutuber = ""
            reloadBtnTooltip.innerHTML = `최근 새로고침 : ${getDate()}`
            window.setYoutuberReloadTime(currentYoutuber, getDate())
            console.log(`${currentYoutuber}: DATA SAVED`)
        } else {
            const videos: Array<string> = [] // 불러온 동영상
            newData["video"].forEach((dt: any) => { videos.push(dt["title"]) })

            const beforeVideos: Array<string> = [] // 기존 동영상
            window.getYoutuberFromStorage(currentYoutuber)["video"].forEach((dt: any) => { beforeVideos.push(dt["title"]) })

            const lives: Array<string> = [] // 불러온 라이브
            newData["live"].forEach((dt: any) => { lives.push(dt["title"]) })

            const beforeLives: Array<string> = [] // 기존 라이브
            window.getYoutuberFromStorage(currentYoutuber)["live"].forEach((dt: any) => { beforeLives.push(dt["title"]) })

            const sub = newData["subscribers"] // 불러온 구독자 수
            const beforeSub = window.getYoutuberFromStorage(currentYoutuber)["subscribers"] // 기존 구독자 수

            const videoFilter = videos.filter((dt: string) => {
                if (beforeVideos.includes(dt)) { return false }
                else { return true }
            })
            const liveFilter = lives.filter((dt: string) => {
                if (beforeLives.includes(dt)) { return false }
                else { return true }
            })

            window.saveYoutuberToStorage({...window.getYoutuberFromStorage(currentYoutuber), ...newData})
            isReloading = false
            reloadingYoutuber = ""
            reloadBtnTooltip.innerHTML = `최근 새로고침 : ${getDate()}`
            window.setYoutuberReloadTime(currentYoutuber, getDate())
            reloadBtn.classList.remove("reloading")
            if (lives.length != beforeLives.length || videos.length != beforeLives.length) {
                showYoutuber(currentYoutuber)
                return
            }
            else if (videoFilter.length == 0 && liveFilter.length == 0 && sub == beforeSub) {
                updateVideo(window.getYoutuberFromStorage(currentYoutuber)["video"])
                updateLive(window.getYoutuberFromStorage(currentYoutuber)["live"])
                return
            }
            else if (sub !== beforeSub) {
                updateInfo(window.getYoutuberFromStorage(currentYoutuber)["about"])
                return
            }
            else {
                showYoutuber(currentYoutuber)
                return
            }
        }
    }, window.getSettingFromStorage(RELOAD_DELAY))
}

async function handleParmamInput() {
    removeAllChild(resultList)
    const result = await window.searchChannel(paramInput.value.toString())
    
    if (paramInput.value.length == 0) { return }
    if (result.length == 0) { 
        const frame = document.createElement("div")
        frame.classList.add("resultContent")
        frame.innerHTML = "채널을 찾을 수 없습니다"
        resultList.appendChild(frame)
        return
    }
    for (let data of result) {
        const frame = document.createElement("div")
        const name = document.createElement("p")
        const sub = document.createElement("p")

        name.innerHTML = data["name"]
        name.classList.add("resultName")
        sub.innerHTML = data["sub"]
        sub.classList.add("resultSub")
        if (data["profile"].length != 0) {
            const img = document.createElement("img")
            img.classList.add("resultImg")
            img.src = data["profile"]
            frame.appendChild(img)
        }
        frame.appendChild(name)
        frame.appendChild(sub)
        frame.classList.add("resultContent")
        frame.addEventListener("click", () => { addYoutuber(data["link"]) })

        resultList.appendChild(frame)
    }
}

function addYoutuberBtnClickEffect() {
    if (addYoutuberPopup.classList.contains("show")) { // hide
        hideElementWithAnimation(addYoutuberPopup)
        addYoutuberBtn.style.transform = "rotate(0deg)"
    } else if (addYoutuberPopup.classList.contains("hide")) { // show
        showElementWithAnimation(addYoutuberPopup)
        addYoutuberBtn.style.transform = "rotate(45deg)"
    } else { // show
        showElementWithAnimation(addYoutuberPopup)
        addYoutuberBtn.style.transform = "rotate(45deg)"
    }
}

addYoutuberBtn.addEventListener("click", addYoutuberBtnClickEffect)
paramInput.addEventListener("change", handleParmamInput)
let isMorePopupOpen: Boolean = false
document.getElementById("moreBtn").addEventListener("click", () => {
    if (isMorePopupOpen) {
        hideElementWithAnimation(moreBtnPopupFrame, true)
        isMorePopupOpen = false
    }
    else {
        showElementWithAnimation(moreBtnPopupFrame)
        isMorePopupOpen = true
    }
})

removeBtn.addEventListener("click", () => { removeYoutuber(showingYoutuber) })

window.addEventListener("load", () => {
    loadSavedYoutubers()
    showRecentYoutuber()
    autoReloadYoutuber()
    if (!localStorage["youtuber"]) { 
        advencedPlayAnimation(contentFrame, {
            animationName: "longWidth",
            animationDuration: 300,
            removeClassName: "default"
        })
        playAnimation(infoFrame, "hideInfoFrame")
        return
    }
    if (JSON.parse(localStorage["youtuber"]).length == 0) {
        advencedPlayAnimation(contentFrame, {
            animationName: "longWidth",
            animationDuration: 300,
            removeClassName: "default"
        })
        playAnimation(infoFrame, "hideInfoFrame")
    } else {
        advencedPlayAnimation(contentFrame, {
            animationName: "default",
            animationDuration: 300,
            removeClassName: "longWidth"
        })
        playAnimation(infoFrame, "showInfoFrame")

        document.querySelectorAll("#contentFrame .welcome").forEach((el: HTMLElement) => {
            hideElementWithAnimation(el, true)
        })
    }
})
