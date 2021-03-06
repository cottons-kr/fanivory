function getThumbnail(url: string) {
    return (`https://i.ytimg.com/vi/${url.replace(/^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/g,"$1")}/original.jpg`)
}

function loadSavedYoutubers() {
    if (localStorage["youtuber"]) { 
        removeAllChild(tuberListFrame)
        const youtubers: Array<any> = JSON.parse(localStorage["youtuber"])
        youtubers.forEach(data => { addContentToList(data["profileImg"], data["name"]) })
    }
    if (getYoutuberListFromStorage().length == 0) {
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
    const status = getStatusFromStorage()
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
    setTimeout(() => {
        if (getYoutuberListFromStorage().length > 10) { // When Overflow
            addYoutuberPopup.style.left = `${addBtnFrame.offsetLeft - 245}px`
            addYoutuberPopup.style.borderRadius = "20px 0px 20px 20px"
        } else { // No OverFlow
            addYoutuberPopup.style.left = `${addBtnFrame.offsetLeft + 80}px`
            addYoutuberPopup.style.borderRadius = "0px 20px 20px 20px"
        }
    }, 100)
    
    tuberListFrame.appendChild(addBtnFrame)
}

async function addYoutuber(url: string) {
    hideElementWithAnimation(addYoutuberPopup)
    addYoutuberBtn.style.transform = "rotate(0deg)"

    let data = await window.getYoutuber(url)
    addContentToList(data["profileImg"], data["name"])
    saveYoutuberToStorage(data)
    loadingYoutuber = data["name"]
    showYoutuber(data["name"], true)
    showElementWithAnimation(loading)

    saveYoutuberToStorage({...data, ...await window.getInfo(url)})
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

    hideElementWithAnimation(homeSection, true)
    showElementWithAnimation(videoListFrame)

    removeAllChild(liveListFrame, { transition: true })
    removeAllChild(videoListFrame, { transition: true })
    if (!getYoutuberListFromStorage()[0]) { showYoutuber(getYoutuberListFromStorage()[0]) }
    else {
        setTimeout(() =>{
            advencedPlayAnimation(contentFrame, {
                animationName: "longWidth",
                animationDuration: 300,
                removeClassName: "default"
            })
            playAnimation(infoFrame, "hideInfoFrame")
    
            showElementWithAnimation(homeSection)
        }, 300)
    }
    removeYoutuberFromStorage(name)
    loadSavedYoutubers()
}

function sleep(time: number) {
    return new Promise(resolve => setTimeout(resolve, time))
}

function checkOverlap(newData: any, name: string) {
    const videos: Array<string> = [] // ????????? ?????????
    newData["video"].forEach((dt: any) => { videos.push(dt["title"]) })

    const beforeVideos: Array<string> = [] // ?????? ?????????
    getYoutuberFromStorage(name)["video"].forEach((dt: any) => { beforeVideos.push(dt["title"]) })

    const lives: Array<string> = [] // ????????? ?????????
    newData["live"].forEach((dt: any) => { lives.push(dt["title"]) })

    const beforeLives: Array<string> = [] // ?????? ?????????
    getYoutuberFromStorage(name)["live"].forEach((dt: any) => { beforeLives.push(dt["title"]) })

    if (lives.length != beforeLives.length) { // @ts-ignore
        sendNotification(`${currentYoutuber}(???)??? Live??? ??????????????????!`, lives[0]["title"])
    }
    if (videos.length != beforeVideos.length) { // @ts-ignore
        sendNotification(`${currentYoutuber}??? ????????? ?????????`, videos[0]["title"])
    }
}

async function autoReloadYoutuber() {
    while (true) {
        if (!getSettingFromStorage(AUTO_RELOAD_ENABLE)) { await sleep(getSettingFromStorage(AUTO_RELOAD_DELAY)); continue }
        else {
            getYoutuberListFromStorage().forEach(async (name: string) => {
                if (autoReloadedYoutuber.length == getYoutuberListFromStorage().length) { autoReloadedYoutuber = [] }
                if (autoReloadingYoutuber.includes(name) || autoReloadedYoutuber.includes(name)) { return }
                if (autoReloadingYoutuber.length >= getSettingFromStorage(MAX_AUTO_RELOAD_COUNT)) { return }
                if (name == showingYoutuber) { return }
                console.log(`${name}: AUTORELOAD START`)

                autoReloadingYoutuber.push(name)
                const newData = await window.getInfo(getYoutuberFromStorage(name)["link"])
                saveYoutuberToStorage({...getYoutuberFromStorage(name), ...newData})
                console.log(`${name}: AUTORELOADED`)
                setYoutuberReloadTime(name, getDate())
                autoReloadedYoutuber.push(name)
                autoReloadingYoutuber.splice(autoReloadingYoutuber.indexOf(name), 1)

                checkOverlap(newData, name)
            })
            await sleep(getSettingFromStorage(AUTO_RELOAD_DELAY))
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
        reloadBtnTooltip.innerHTML = "???????????????..."
        console.log(`${currentYoutuber}: RELOAD START`)
        const newData = await window.getInfo(getYoutuberFromStorage(currentYoutuber)["link"])
        console.log(`${currentYoutuber}: RELOADED`)
        if (currentYoutuber !== showingYoutuber) {
            saveYoutuberToStorage({...getYoutuberFromStorage(currentYoutuber), ...newData})
            reloadBtn.classList.remove("reloading")
            isReloading = false
            reloadingYoutuber = ""
            reloadBtnTooltip.innerHTML = `?????? ???????????? : ${getDate()}`
            setYoutuberReloadTime(currentYoutuber, getDate())
            console.log(`${currentYoutuber}: DATA SAVED`)
        } else {
            const videos: Array<string> = [] // ????????? ?????????
            newData["video"].forEach((dt: any) => { videos.push(dt["title"]) })

            const beforeVideos: Array<string> = [] // ?????? ?????????
            getYoutuberFromStorage(currentYoutuber)["video"].forEach((dt: any) => { beforeVideos.push(dt["title"]) })

            const lives: Array<string> = [] // ????????? ?????????
            newData["live"].forEach((dt: any) => { lives.push(dt["title"]) })

            const beforeLives: Array<string> = [] // ?????? ?????????
            getYoutuberFromStorage(currentYoutuber)["live"].forEach((dt: any) => { beforeLives.push(dt["title"]) })

            const sub = newData["subscribers"] // ????????? ????????? ???
            const beforeSub = getYoutuberFromStorage(currentYoutuber)["subscribers"] // ?????? ????????? ???

            const videoFilter = videos.filter((dt: string) => {
                if (beforeVideos.includes(dt)) { return false }
                else { return true }
            })
            const liveFilter = lives.filter((dt: string) => {
                if (beforeLives.includes(dt)) { return false }
                else { return true }
            })

            saveYoutuberToStorage({...getYoutuberFromStorage(currentYoutuber), ...newData})
            isReloading = false
            reloadingYoutuber = ""
            reloadBtnTooltip.innerHTML = `?????? ???????????? : ${getDate()}`
            setYoutuberReloadTime(currentYoutuber, getDate())
            reloadBtn.classList.remove("reloading")

            checkOverlap(newData, currentYoutuber)

            if (lives.length != beforeLives.length || videos.length != beforeLives.length) {
                showYoutuber(currentYoutuber)
                return
            }
            else if (videoFilter.length == 0 && liveFilter.length == 0 && sub == beforeSub) {
                updateVideo(getYoutuberFromStorage(currentYoutuber)["video"])
                updateLive(getYoutuberFromStorage(currentYoutuber)["live"])
                return
            }
            else if (sub !== beforeSub) {
                updateInfo(getYoutuberFromStorage(currentYoutuber)["about"])
                return
            }
            else {
                showYoutuber(currentYoutuber)
                return
            }
        }
    }, getSettingFromStorage(RELOAD_DELAY))
}

async function handleParmamInput() {
    removeAllChild(resultList)
    const result = await window.searchChannel(paramInput.value.toString())
    
    if (paramInput.value.length == 0) { return }
    if (result.length == 0) { 
        const frame = document.createElement("div")
        frame.classList.add("resultContent")
        frame.innerHTML = "????????? ?????? ??? ????????????"
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
