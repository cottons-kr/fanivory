function getThumbnail(url: string) {
    return (`https://i.ytimg.com/vi/${url.replace(/^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/g,"$1")}/original.jpg`)
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
