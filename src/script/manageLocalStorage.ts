window.resetStorage = (): void => {
    localStorage.clear()
    return
}

window.getYoutuberFromStorage = (name: string): object => {
    const db = JSON.parse(localStorage["youtuber"])

    for (let youtuber of db) {
        if (youtuber["name"] == name) { return youtuber }
        else { continue }
    }
}

window.saveYoutuberToStorage = (data: any): object => {
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

window.removeYoutuberFromStorage = (name: string): object => {
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

window.getYoutuberListFromStorage = (): void => {
    const db = JSON.parse(localStorage["youtuberlist"])
    return db
}

window.getStatusFromStorage = (): object => {
    if (localStorage["status"]) { return JSON.parse(localStorage["status"]) }
    else { return {} }
}

window.setRecentYoutuberToStorage = (name: string): void => {
    const db = JSON.parse(localStorage["status"])
    db["recentYoutuber"] = name
    localStorage["status"] = JSON.stringify(db)
    return db
}

window.setYoutuberReloadTime = (name: string, time: string): void => {
    const db = window.getYoutuberFromStorage(name)

    db["about"]["recentReload"] = time
    window.saveYoutuberToStorage(db)
}

window.getYoutuberReloadTime = (name: string): string => {
    const db = window.getYoutuberFromStorage(name)["about"]
    if (db["recentReload"]) { return db["recentReload"] }
    else { return "없음" }
}

window.getSettingFromStorage = (name: string = "all"): Boolean | number | undefined => {
    if (name == "all") { return JSON.parse(localStorage["setting"]) }
    else { return JSON.parse(localStorage["setting"])[name] }
}

const defaultSetting = {
    "auto_reload_delay": 300000,
    "auto_reload_enable": true,
    "max_auto_reload_count": 1,
    "bottom_youtuber_list": false,
    "enable_devtools": false,
    "slow_animation": false,
    "disable_animation": false,
    "reload_delay": 15000
}

window.onload = (): void => {
    if (localStorage["youtuber"] == undefined) { localStorage["youtuber"] = "[]" }
    if (localStorage["status"] == undefined) { localStorage["status"] = "{}" }
    if (localStorage["youtuberlist"] == undefined) { localStorage["youtuberlist"] = "[]" }
    if (localStorage["setting"] == undefined) { localStorage["setting"] = JSON.stringify(defaultSetting) }
}

/*

===== LocalStorage 구조도 =====

-- status --
{
    "recentYoutuber": 유튜버이름(string)
}

--- youtuberlist ---
[
    "이름(string)"
]

-- youtuber --
[
    {
        "name": 이름(string),
        "subscribers": 구독자(string),
        "location": 국가(string),
        "profileImg": 프로필 사진(string),
        "alarm": 알람설정여부(Boolean),
        "color": 배경색(Array<number>)
        "live": [
            {
                "title": 제목(string),
                "views": 시청자(string),
                "id": 영상 ID(string)
            }
        ],
        "video": [
            {
                "title": 제목(string),
                "views": 조회수(string),
                "date": 올린 날짜(string),
                "id": 영상 ID(string)
            }
        ],
        "playlist": [
            {
                "title": 제목(string),
                "link": 링크(string),
                "thumbnail": 썸네일(string)
            }
        ]
    }
]

-- setting --
{
    "auto_reload_delay": 자동 새로고침 간격(number, 단위 : ms, 기본값 : 300000),
    "auto_reload_enable": 자동 새로고침(Boolean, 기본값 : true),
    "max_auto_reload_count": 동시 자동 새로고침 갯수(number, 기본값 : 1)
    "bottom_youtuber_list": 하단 유튜버 리스트(Boolean, 기본값 : false),
    "slow_animation": 느린 애니메이션(Boolean, 기본값 : false),
    "disable_animation": 애니메이션 비활성화(Boolean, 기본값 : false),
    "reload_delay": 새로고침 간격(number, 단위 : ms, 기본값 : 15000),
    "enable_devtools": 개발자도구 활성화(Boolean, 기본값 : false)
}

*/
