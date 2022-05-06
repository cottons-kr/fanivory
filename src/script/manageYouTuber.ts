import YoutubePlayer from "youtube-player"
import { YouTubePlayer } from "youtube-player/dist/types"

let addYoutuberBtn = document.getElementById("addYoutuberBtn")
const addYoutuberPopup = document.getElementById("addYoutuberPopup")
const tuberListFrame = document.getElementById("tuberListFrame")
const infoFrame = document.getElementById("infoFrame")
const paramInput: HTMLInputElement = document.querySelector("#paramInput")
const resultList = document.getElementById("resultList")
const contentFrame = document.getElementById("contentFrame")
const loading = document.getElementById("contentLoading")
const moreBtnPopupFrame: HTMLDivElement = document.querySelector("#moreBtnPopupFrame")
const reloadBtn: HTMLDivElement = document.querySelector("#reloadBtn img")
const reloadBtnTooltip: HTMLSpanElement = document.querySelector("#reloadBtn .tooltip")

let showingYoutuber: string = ""
let showingTimeout: NodeJS.Timeout
let reloadInterval: NodeJS.Timeout
let isReloading: Boolean = false
let reloadingYoutuber: string = ""

const AUTO_RELOAD_DELAY = "auto_reload_delay"
const AUTO_RELOAD_ENABLE = "auto_reload_enable"
const BOTTOM_YOUTUBER_LIST = "bottom_youtuber_list"
const ENABLE_DEVTOOLS = "enable_devtools"
const SLOW_ANIMATION = "slow_animation"
const DISABLE_ANIMATION = "disable_animation"
const RELOAD_DELAY = "reload_delay"

function getThumbnail(url: string) {
    return (`https://i.ytimg.com/vi/${url.replace(/^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/g,"$1")}/original.jpg`)
}

function removeAllChild(el: HTMLElement, param={ transition: false }) {
    if (param.transition) {
        el.childNodes.forEach((e: any) => {
            if (e.tagName) {
                e.classList.remove("showVideo")
                e.classList.add("hideVideo")
            }
        })
        setTimeout(() => { while (el.firstChild) { el.removeChild(el.lastChild) } }, 300)
    }
    else { while (el.firstChild) { el.removeChild(el.lastChild) } }
}

function loadSavedYoutubers() {
    if (localStorage["youtuber"]) { 
        const youtubers: Array<any> = JSON.parse(localStorage["youtuber"])
        youtubers.forEach(data => { addContentToList(data["profileImg"], data["name"]) })
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

function showLives(data: any, param={ transition: true }) {
    if (data["live"].length != 0) { // Live
        if (data["live"] == undefined) {
            liveListFrame.style.display = "none"
            document.getElementById("liveTitle").style.display = "none"
            return
        }
        liveListFrame.style.display = "flex"
        document.querySelector("#liveTitle").classList.add("showList")
        document.querySelector("#liveTitle").classList.remove("hideList")
        document.getElementById("liveTitle").style.display = "block"
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
                hoveringContent.classList.add("show")
                hoveringContent.classList.remove("hide")
            })
            
            frame.addEventListener("mouseleave", () => {
                hoveringContent.classList.add("hide")
                hoveringContent.classList.remove("show")
            })

            hoveringContent.appendChild(title)
            frame.appendChild(hoveringContent)
            liveListFrame.appendChild(frame)
            if (param.transition) { frame.classList.add("showVideo") }
        })
    } else {
        liveListFrame.style.display = "none"
        document.getElementById("liveTitle").style.display = "none"
    } 
}

function showVideos(data: any, param={ transition: true }) {
    const videoListFrame: HTMLElement = document.querySelector("#videoList")
    if (data["video"].length != 0) { // Video
        if (data["video"] == undefined) {
            videoListFrame.style.display = "none"
            document.getElementById("videoTitle").style.display = "none"
            return
        }
        if (document.getElementById("liveList").offsetHeight <= 0) { videoListFrame.style.height = "calc(100% - 69px)" }
        else { videoListFrame.style.height = `calc(100% - ${document.getElementById("liveList").offsetHeight+109}px)` }
        videoListFrame.style.display = "flex"
        document.getElementById("videoTitle").style.display = "block"
        document.querySelector("#videoTitle").classList.add("showList")
        document.querySelector("#videoTitle").classList.remove("hideList")
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
                hoveringContent.classList.add("show")
                hoveringContent.classList.remove("hide")
            })
            frame.addEventListener("mouseleave", () => {
                hoveringContent.classList.add("hide")
                hoveringContent.classList.remove("show")
            })

            hoveringContent.appendChild(title)
            hoveringContent.appendChild(info)
            frame.appendChild(hoveringContent)
            videoListFrame.appendChild(frame)
            if (param.transition) { frame.classList.add("showVideo") }
        })
    } else {
        document.getElementById("videoTitle").style.display = "none"
        videoListFrame.style.display = "none"
    }
}

function showYoutuber(name: string, param={ onlyInfo: false }): void {
    const data = window.getYoutuberFromStorage(name)
    const profileImg: HTMLImageElement = document.querySelector("#profileImg")
    const channelName: HTMLElement = document.querySelector("#channelName")
    const subscribers: HTMLSpanElement = document.querySelector("#subscribers")
    const joinDate: HTMLElement = document.querySelector("#joinDate")
    const totalViews: HTMLElement = document.querySelector("#totalViews")
    const subscriberFrame = document.getElementById("subscriberFrame")
    const locationTooltip: HTMLSpanElement = document.querySelector("#locationIcon .tooltip")
    const liveListFrame: HTMLDivElement = document.querySelector("#liveList")
    const videoListFrame: HTMLDivElement = document.querySelector("#videoList")
    const liveListTitle: HTMLDivElement = document.querySelector("#liveTitle")
    const videoListTitle: HTMLDivElement = document.querySelector("#videoTitle")

    reloadBtnTooltip.innerHTML = `최근 새로고침 : ${window.getYoutuberReloadTime(name)}`

    if (showingYoutuber == name) {
        liveListTitle.classList.add("hideList")
        liveListTitle.classList.remove("showList")
        videoListTitle.classList.add("hideList")
        videoListTitle.classList.remove("showList")
        joinDate.innerHTML = `가입일 : ${data["about"]["joindate"]}`
        totalViews.innerHTML = `총합 조회수 : ${data["about"]["totalviews"]}`
        removeAllChild(liveListFrame, { transition: true })
        removeAllChild(videoListFrame, { transition: true })
        showingTimeout = setTimeout(() => {
            showLives(data, { transition: true })
            showVideos(data, { transition: true })
        }, 300)
        return
    }
    if (param.onlyInfo) {
        isMorePopupOpen = false
        channelName.classList.add("hideInfo")
        subscriberFrame.classList.add("hideInfo")
        profileImg.classList.add("hideInfo")
        moreBtnPopupFrame.classList.add("hide")

        channelName.classList.remove("showInfo")
        subscriberFrame.classList.remove("showInfo")
        profileImg.classList.remove("showInfo")
        moreBtnPopupFrame.classList.remove("show")

        infoFrame.classList.remove("hideInfoFrame")
        contentFrame.classList.remove("longWidth")
        infoFrame.classList.add("showInfoFrame")
        contentFrame.classList.add("default")

        showingTimeout = setTimeout(() => {
            channelName.classList.add("showInfo")
            subscriberFrame.classList.add("showInfo")
            profileImg.classList.add("showInfo")
            moreBtnPopupFrame.classList.add("show")
            channelName.classList.remove("hideInfo")
            subscriberFrame.classList.remove("hideInfo")
            profileImg.classList.remove("hideInfo")
            moreBtnPopupFrame.classList.add("hide")

            profileImg.src = data["profileImg"]
            channelName.innerHTML = data["name"]
            subscribers.innerHTML = `구독자 ${data["subscribers"]}`
            joinDate.innerHTML = `가입일 : ${data["about"]["joindate"]}`
            totalViews.innerHTML = `총합 조회수 : ${data["about"]["totalviews"]}`
            if (data["about"]["location"] != undefined) { locationTooltip.innerHTML = data["about"]["location"] }
            else { locationTooltip.innerHTML = "알 수 없음" }
        }, 300)
    }

    showingYoutuber = name
    isMorePopupOpen = false
    window.setRecentYoutuberToStorage(name)
    reloadYoutuber()

    setTimeout(() => {
        if (reloadingYoutuber == showingYoutuber && !reloadBtn.classList.contains("reloading")) {
            reloadBtn.classList.add("reloading")
            reloadBtnTooltip.innerHTML = "새로고침중..." 
        }
        else if (reloadingYoutuber != showingYoutuber && reloadBtn.classList.contains("reloading")) { reloadBtn.classList.remove("reloading") }
    }, 300)

    liveListTitle.classList.add("hideList")
    liveListTitle.classList.remove("showList")
    videoListTitle.classList.add("hideList")
    videoListTitle.classList.remove("showList")

    channelName.classList.add("hideInfo")
    subscriberFrame.classList.add("hideInfo")
    profileImg.classList.add("hideInfo")
    moreBtnPopupFrame.classList.add("hide")

    channelName.classList.remove("showInfo")
    subscriberFrame.classList.remove("showInfo")
    profileImg.classList.remove("showInfo")
    moreBtnPopupFrame.classList.remove("show")

    infoFrame.classList.remove("hideInfoFrame")
    contentFrame.classList.remove("longWidth")
    infoFrame.classList.add("showInfoFrame")
    contentFrame.classList.add("default")

    document.querySelectorAll("#contentFrame .welcome").forEach((el: HTMLElement) => {
        el.classList.add("hide")
        setTimeout(() => { el.style.display = "none" }, 300)
    })
    videoListFrame.classList.add("show")
    
    removeAllChild(liveListFrame, { transition: true })
    removeAllChild(videoListFrame, { transition: true })

    clearTimeout(showingTimeout)
    showingTimeout = setTimeout(() => { // 기본 정보
        channelName.classList.add("showInfo")
        subscriberFrame.classList.add("showInfo")
        profileImg.classList.add("showInfo")
        moreBtnPopupFrame.classList.add("show")
        channelName.classList.remove("hideInfo")
        subscriberFrame.classList.remove("hideInfo")
        profileImg.classList.remove("hideInfo")
        moreBtnPopupFrame.classList.add("hide")

        profileImg.src = data["profileImg"]
        channelName.innerHTML = data["name"]
        subscribers.innerHTML = `구독자 ${data["subscribers"]}`
        joinDate.innerHTML = `가입일 : ${data["about"]["joindate"]}`
        totalViews.innerHTML = `총합 조회수 : ${data["about"]["totalviews"]}`
        if (data["about"]["location"] != undefined) { locationTooltip.innerHTML = data["about"]["location"] }
        else { locationTooltip.innerHTML = "알 수 없음" }

        showLives(data)
        showVideos(data)
    }, 300)
}

function addContentToList(imgSrc: string, name: string) {
    tuberListFrame.removeChild(document.querySelector("#addYoutuberBtn"))

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
    setTimeout(() => { addYoutuberPopup.style.left = `${addBtnFrame.offsetLeft + 30}px` }, 100)
    
    tuberListFrame.appendChild(addBtnFrame)
}

async function addYoutuber(url: string) {
    addYoutuberPopup.classList.remove("show")
    addYoutuberPopup.classList.add("hide")
    addYoutuberBtn.style.transform = "rotate(0deg)"

    let data = await window.getYoutuber(url)
    addContentToList(data["profileImg"], data["name"])
    window.saveYoutuberToStorage(data)
    showYoutuber(data["name"])
    loading.style.display = "block"

    window.saveYoutuberToStorage({...data, ...await window.getInfo(url)})
    loading.style.display = "none"
    showYoutuber(data["name"])
}

function sleep(time: number) {
    return new Promise(resolve => setTimeout(resolve, time))
}

async function autoReloadYoutuber() {
    while (true) {
        if (!window.getSettingFromStorage(AUTO_RELOAD_ENABLE)) { await sleep(window.getSettingFromStorage(AUTO_RELOAD_DELAY)); continue }
        else {
            window.getYoutuberListFromStorage().forEach(async (name: string) => {
                if (name == showingYoutuber) { await sleep(window.getSettingFromStorage(AUTO_RELOAD_DELAY)) }
                console.log(`${name}: AUTORELOAD START`)
                const newData = await window.getInfo(window.getYoutuberFromStorage(name)["link"])
                window.saveYoutuberToStorage({...window.getYoutuberFromStorage(name), ...newData})
                console.log(`${name}: AUTORELOADED`)
                window.setYoutuberReloadTime(name, getDate())
                await sleep(window.getSettingFromStorage(AUTO_RELOAD_DELAY))
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
        reloadBtn.classList.add("reloading")
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
            const videos: Array<string> = []
            newData["video"].forEach((dt: any) => { videos.push(dt["title"]) })
            const beforeVideos: Array<string> = []
            window.getYoutuberFromStorage(currentYoutuber)["video"].forEach((dt: any) => { beforeVideos.push(dt["title"]) })
            const lives: Array<string> = []
            newData["live"].forEach((dt: any) => { lives.push(dt["title"]) })
            const beforeLives: Array<string> = []
            window.getYoutuberFromStorage(currentYoutuber)["live"].forEach((dt: any) => { beforeLives.push(dt["title"]) })
            const sub = newData["subscribers"]
            const beforeSub = window.getYoutuberFromStorage(currentYoutuber)["subscribers"]

            const videoFilter = videos.filter((dt: string) => {
                if (beforeVideos.includes(dt)) { return false }
                else { return true }
            })
            const liveFilter = lives.filter((dt: string) => {
                if (beforeLives.includes(dt)) { return false }
                else { return true }
            })
            if (videoFilter.length == 0 && liveFilter.length == 0 && sub == beforeSub) {
                console.log(`${currentYoutuber}: NOTHING CHANGED`)
                reloadBtn.classList.remove("reloading")
                isReloading = false
                reloadingYoutuber = ""
                reloadBtnTooltip.innerHTML = `최근 새로고침 : ${getDate()}`
                window.setYoutuberReloadTime(currentYoutuber, getDate())
                return
            }
            else if (sub !== beforeSub) {
                showYoutuber(currentYoutuber, { onlyInfo: true })
                reloadBtn.classList.remove("reloading")
                isReloading = false
                reloadingYoutuber = ""
                reloadBtnTooltip.innerHTML = `최근 새로고침 : ${getDate()}`
                window.setYoutuberReloadTime(currentYoutuber, getDate())
                return
            }
            else {
                window.saveYoutuberToStorage({...window.getYoutuberFromStorage(currentYoutuber), ...newData})
                showYoutuber(currentYoutuber)
                reloadBtn.classList.remove("reloading")
                isReloading = false
                reloadingYoutuber = ""
                reloadBtnTooltip.innerHTML = `최근 새로고침 : ${getDate()}`
                window.setYoutuberReloadTime(currentYoutuber, getDate())
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
        addYoutuberPopup.classList.remove("show")
        addYoutuberPopup.classList.add("hide")
        addYoutuberBtn.style.transform = "rotate(0deg)"
    } else if (addYoutuberPopup.classList.contains("hide")) { // show
        addYoutuberPopup.classList.remove("hide")
        addYoutuberPopup.classList.add("show")
        addYoutuberBtn.style.transform = "rotate(45deg)"
    } else { // show
        addYoutuberPopup.classList.remove("hide")
        addYoutuberPopup.classList.add("show")
        addYoutuberBtn.style.transform = "rotate(45deg)"
    }
}

addYoutuberBtn.addEventListener("click", addYoutuberBtnClickEffect)
paramInput.addEventListener("change", handleParmamInput)
let isMorePopupOpen: Boolean = false
document.getElementById("moreBtn").addEventListener("click", () => {
    if (isMorePopupOpen) {
        moreBtnPopupFrame.classList.add("hide")
        moreBtnPopupFrame.classList.remove("show")
        isMorePopupOpen = false
    }
    else {
        moreBtnPopupFrame.classList.add("show")
        moreBtnPopupFrame.classList.remove("hide")
        isMorePopupOpen = true
    }
})

window.addEventListener("load", () => {
    loadSavedYoutubers()
    showRecentYoutuber()
    autoReloadYoutuber()
    if (!localStorage["youtuber"]) { 
        infoFrame.classList.remove("showInfoFrame")
        contentFrame.classList.remove("default")
        infoFrame.classList.add("hideInfoFrame")
        contentFrame.classList.add("longWidth")
        return
    }
    if (JSON.parse(localStorage["youtuber"]).length == 0) {
        infoFrame.classList.remove("showInfoFrame")
        contentFrame.classList.remove("default")
        infoFrame.classList.add("hideInfoFrame")
        contentFrame.classList.add("longWidth")
    } else {
        infoFrame.classList.remove("hideInfoFrame")
        contentFrame.classList.remove("longWidth")
        infoFrame.classList.add("showInfoFrame")
        contentFrame.classList.add("default")

        document.querySelectorAll("#contentFrame .welcome").forEach((el: HTMLElement) => {
            el.classList.add("hide")
            setTimeout(() => { el.style.display = "none" }, 300)
        })
    }
})
