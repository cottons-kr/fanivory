function resetStorage(): void {
    localStorage.clear()
    return
}

function getYoutuberFromStorage(name: string): any {
    const db = JSON.parse(localStorage["youtuber"])

    for (let youtuber of db) {
        if (youtuber["name"] == name) { return youtuber }
        else { continue }
    }
}

function saveYoutuberToStorage(data: any): object {
    let db = JSON.parse(localStorage["youtuber"])
    const name: string = data["name"]
    const list: Array<string> = JSON.parse(localStorage["youtuberlist"])
    if (list.includes(name)) { 
        let index: number = list.indexOf(name)
        db = db.filter((i: any) => {
            if (i["name"] == name) { return false }
            else { return true }
        })
        db.splice(index, 0, data)
    } else {
        db.push(data)
        list.push(name)
    }

    localStorage["youtuber"] = JSON.stringify(db)
    localStorage["youtuberlist"] = JSON.stringify(list)
    return db
}

function removeYoutuberFromStorage(name: string): object {
    let db = JSON.parse(localStorage["youtuber"])

    db = db.filter((data: any): Boolean => {
        if (data["name"] == name) { return false }
        else { return true }
    })
    localStorage["youtuber"] = JSON.stringify(db)

    let list: Array<string> = JSON.parse(localStorage["youtuberlist"])
    list.splice(list.indexOf(name), 1)
    localStorage["youtuberlist"] = JSON.stringify(list)

    if (window.getStatusFromStorage()["recentYoutuber"] == name) { localStorage["status"] = "{}" }
    return db
}

function getYoutuberListFromStorage(): Array<any> {
    const db = JSON.parse(localStorage["youtuberlist"])
    return db
}

function getStatusFromStorage(): any {
    if (localStorage["status"]) { return JSON.parse(localStorage["status"]) }
    else { return {} }
}

function setRecentYoutuberToStorage(name: string): void {
    const db = JSON.parse(localStorage["status"])
    db["recentYoutuber"] = name
    localStorage["status"] = JSON.stringify(db)
    return db
}

function setYoutuberReloadTime(name: string, time: string): void {
    const db = window.getYoutuberFromStorage(name)

    db["about"]["recentReload"] = time
    window.saveYoutuberToStorage(db)
}

function getYoutuberReloadTime(name: string): string {
    const db = window.getYoutuberFromStorage(name)["about"]
    if (db["recentReload"]) { return db["recentReload"] }
    else { return "??????" }
}

function getSettingFromStorage(name: string = "all"): any {
    if (name == "all") { return JSON.parse(localStorage["setting"]) }
    else { return JSON.parse(localStorage["setting"])[name] }
}

const defaultSetting = {
    "auto_reload_delay": 7200000,
    "auto_reload_enable": true,
    "max_auto_reload_count": 1,
    "bottom_youtuber_list": false,
    "enable_devtools": false,
    "slow_animation": false,
    "disable_animation": false,
    "reload_delay": 3600000
}

window.onload = (): void => {
    if (localStorage["youtuber"] == undefined) { localStorage["youtuber"] = "[]" }
    if (localStorage["status"] == undefined) { localStorage["status"] = "{}" }
    if (localStorage["youtuberlist"] == undefined) { localStorage["youtuberlist"] = "[]" }
    if (localStorage["setting"] == undefined) { localStorage["setting"] = JSON.stringify(defaultSetting) }
}

/*

===== LocalStorage ????????? =====

-- status --
{
    "recentYoutuber": ???????????????(string)
}

--- youtuberlist ---
[
    "??????(string)"
]

-- youtuber --
[
    {
        "name": ??????(string),
        "subscribers": ?????????(string),
        "location": ??????(string),
        "profileImg": ????????? ??????(string),
        "alarm": ??????????????????(Boolean),
        "color": ?????????(Array<number>)
        "live": [
            {
                "title": ??????(string),
                "views": ?????????(string),
                "id": ?????? ID(string)
            }
        ],
        "video": [
            {
                "title": ??????(string),
                "views": ?????????(string),
                "date": ?????? ??????(string),
                "id": ?????? ID(string)
            }
        ],
        "playlist": [
            {
                "title": ??????(string),
                "link": ??????(string),
                "thumbnail": ?????????(string)
            }
        ]
    }
]

-- setting --
{
    "auto_reload_delay": ?????? ???????????? ??????(number, ?????? : ms, ????????? : 7200000),
    "auto_reload_enable": ?????? ????????????(Boolean, ????????? : true),
    "max_auto_reload_count": ?????? ?????? ???????????? ??????(number, ????????? : 1)
    "bottom_youtuber_list": ?????? ????????? ?????????(Boolean, ????????? : false),
    "slow_animation": ?????? ???????????????(Boolean, ????????? : false),
    "disable_animation": ??????????????? ????????????(Boolean, ????????? : false),
    "reload_delay": ???????????? ??????(number, ?????? : ms, ????????? : 3600000),
    "enable_devtools": ??????????????? ?????????(Boolean, ????????? : false)
}

*/
