async function sendNotification(title: string, body="") {
    if (await Notification.requestPermission() == "denied") {
        alert(title)
        return
    }

    if (!getYoutuberFromStorage(showingYoutuber)["about"]["notification"]) {
        return
    }

    const options = {
        body: body
    }
    new Notification(title, options)
    return
}

function isSetNotification(): boolean {
    const data = getYoutuberFromStorage(showingYoutuber)
    if (data["about"]["notification"]) {
        return true
    }
    else if (!data["about"]["notification"]) {
        return false
    }
}

function setNotification() {
    const data = getYoutuberFromStorage(showingYoutuber)
    if (isSetNotification()) { // 알람 끄기
        data["about"]["notification"] = false
        alarmTooltip.innerHTML = "알람 설정 : 꺼짐"
        alarmBtn.style.background = `url("./asset/bell.svg") no-repeat fixed`
    }
    else if (!isSetNotification()) { // 알람 켜기
        data["about"]["notification"] = true
        alarmTooltip.innerHTML = "알람 설정 : 켜짐"
        alarmBtn.style.background = `url("./asset/bell_active.svg") no-repeat fixed`
    }

    saveYoutuberToStorage(data)
}

const alarmBtn = document.getElementById("alarmBtn")
alarmBtn.addEventListener("click", setNotification)
