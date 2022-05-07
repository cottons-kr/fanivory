import puppeteer from "puppeteer"

const devices = {
    name: 'iPhone 6',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
    viewport: {
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        isLandscape: false,
    }
}
const YOUTUBE_URL = "https://www.youtube.com/"

async function getPage(isMobile: Boolean = false, url: string) {
    const brower = await puppeteer.launch({headless: true})
    const page = await brower.newPage()
    page.on("close", async () => { await brower.close() })
    if (isMobile) { await page.emulate(devices) }
    await page.goto(url)

    return [page, brower]
}

window.getYoutuber = async (url: string): Promise<Object> => {
    const data = await getPage(true, url)
    const page: any = data[0]
    const browser = data[1]

    await page.waitForSelector("#app > div.page-container > ytm-browse > ytm-c4-tabbed-header-renderer > div.c4-tabbed-header-channel.cbox > ytm-profile-icon > img")
    const name = await page.$eval("#app > div.page-container > ytm-browse > ytm-c4-tabbed-header-renderer > div.c4-tabbed-header-channel.cbox > div > h1", (el: { innerHTML: { toString: () => any } }) => {
        return el.innerHTML.toString()
    })
    const sub = await page.$eval("#app > div.page-container > ytm-browse > ytm-c4-tabbed-header-renderer > div.c4-tabbed-header-channel.cbox > div > div > span", (el: { innerHTML: { toString: () => string } }) => {
        return el.innerHTML.toString().split(' ')[1]
    })
    const profileImg = await page.$eval("#app > div.page-container > ytm-browse > ytm-c4-tabbed-header-renderer > div.c4-tabbed-header-channel.cbox > ytm-profile-icon > img", (el: { src: any }) => {
        // @ts-ignore
        return el.src
    })
    await page.goto(url+"/about")
    await page.waitForSelector("#app > div.page-container > ytm-browse > ytm-single-column-browse-results-renderer > div:nth-child(2) > div:nth-child(5) > ytm-section-list-renderer > lazy-list > ytm-item-section-renderer > lazy-list > ytm-channel-about-metadata-renderer > div.user-text")
    const about = await page.$eval("#app > div.page-container > ytm-browse > ytm-single-column-browse-results-renderer > div:nth-child(2) > div:nth-child(5) > ytm-section-list-renderer > lazy-list > ytm-item-section-renderer > lazy-list > ytm-channel-about-metadata-renderer > div.user-text", (el: { innerHTML: { toString: () => any } }) => {
        return el.innerHTML.toString()
    })

    await browser.close()
    return {
        "name": name,
        "subscribers": sub,
        "profileImg": profileImg,
        "about": about
    }
}

window.getInfo = async (url: string) => {
    const data = await getPage(false, url)
    const page: any = data[0]
    const browser = data[1]
    // === SUBSCRIBERS === //
    await page.waitForSelector("#subscriber-count")
    const sub = await page.$eval("#subscriber-count", (el: { innerHTML: { toString: () => string } }) => { return el.innerHTML.toString().split(' ')[1] } )

    // === LIVE === //
    let liveList
    try {
        await page.waitForSelector("#contents > .style-scope > #contents > .style-scope > #contents", {timeout: 5000})
        liveList = await page.$eval("#contents > .style-scope > #contents > .style-scope > #contents", async (el: { childNodes: any }) => {
            let list: Array<Object> = []
            for (let live of el.childNodes) {
                // @ts-ignore
                const img = await live.querySelector("img").src; // @ts-ignore
                const title = await live.querySelector("yt-formatted-string").ariaLabel.split(" 게시자: ")[0] // @ts-ignore
                const id = await live.querySelector("a").href.split("?v=")[1]
                list.push({
                    "title": title,
                    "img": img,
                    "id": id
                })
            }
            return list
        })
    } catch { liveList = [] }
    
    // === VIDEOS === //
    let videoList
    await page.goto(url+"/videos")
    try {
        await page.waitForSelector("#contents > .style-scope > #contents > ytd-grid-renderer > #items", {timeout: 10000})
        videoList = await page.$eval("#contents > .style-scope > #contents > ytd-grid-renderer > #items", async (el: { childNodes: any }) => {
            let list: Array<Object> = []
            for (let video of el.childNodes) {
                let ariaLabel: string
                try { 
                    // @ts-ignore
                    ariaLabel = await video.querySelector("#video-title").ariaLabel
                }
                catch { continue }

                const title = ariaLabel.split(" 게시자: ")[0]
                const date = ariaLabel.split(" 전 ")[0].split(" 게시자: ")[1].split(' ')[ariaLabel.split(" 전 ")[0].split(" 게시자: ")[1].split(' ').length-1]
                const views = ariaLabel.split("회 ")[0].split(' ')[ariaLabel.split("회 ")[0].split(' ').length-1] // @ts-ignore
                const id = await video.querySelector("a").href.split("?v=")[1] // @ts-ignore
                const img = await video.querySelector("img").src // @ts-ignore
                const link = await video.querySelector("a").href

                list.push({
                    "title": title,
                    "date": date,
                    "views": views,
                    "id": id,
                    "img": img,
                    "link": link
                })
            }
            return list
        })
    } catch { videoList = [] }

    // === PLAYLIST === //
    let playlistList
    await page.goto(url+"/playlists")
    try {
        await page.waitForSelector("#contents > .style-scope > #contents > ytd-grid-renderer > #items")
        playlistList = await page.$eval("#contents > .style-scope > #contents > ytd-grid-renderer > #items", async (el: { childNodes: any }) => {
            let list: Array<Object> = []
            for (let playlist of el.childNodes) { // @ts-ignore
                const title = await playlist.querySelector("h3 > a").innerHTML // @ts-ignore
                const link = await playlist.querySelector("#view-more > a").href // @ts-ignore
                const thumbnail = await playlist.querySelector("img").src

                list.push({
                    "title": title,
                    "link": link,
                    "thumbnail": thumbnail
                })
            }
            return list
        })
    }
    catch { playlistList = [] }

    // === ABOUT === //
    let about
    await page.goto(url+"/about")
    try {
        await page.waitForSelector("#left-column", { timeout: 5000 })
        const aboutText = await page.$eval("yt-formatted-string#description", (el: { innerHTML: any }) => { return el.innerHTML })
        const linkList = await page.$eval("#link-list-container", (el: { children: any }) => {
            const list: Array<object> = []
            for (let a of el.children) {
                if (a.tagName != "A") { continue }
                // @ts-ignore
                const link = a.href
                const title = a.querySelector("yt-formatted-string").innerHTML
                list.push({
                    "link": link,
                    "title": title
                })
            }
            return list
        })
        const views = await page.$eval("#right-column > yt-formatted-string:nth-child(3)", (el: { innerHTML: string }) => { return el.innerHTML.split("조회수 ")[1] })
        const date = await page.$eval("#right-column > yt-formatted-string:nth-child(2) > span:nth-child(2)", (el: { innerHTML: any }) => { return el.innerHTML })
        let location
        try {
            location = await page.$eval("#details-container > table > tbody > tr:nth-child(2) > td:nth-child(2) > yt-formatted-string", (el: { innerHTML: any }) => { return el.innerHTML })
        } catch { location = undefined }

        about = {
            "about": aboutText,
            "links": linkList,
            "totalviews": views,
            "joindate": date,
            "location": location
        }
    }
    catch (e) { about = {}; console.log(e) }

    await browser.close()
    return {
        "subscribers": sub,
        "link": url,
        "live": liveList,
        "video": videoList,
        "playlist": playlistList,
        "about": about
    }
}

window.searchChannel = async (param: string) => {
    if (param.startsWith("https://")) {
        ;
    }

    const data = await getPage(true, YOUTUBE_URL+"/results?search_query="+param)
    const page: any = data[0]
    const browser = data[1]
    await page.waitForSelector("ytm-item-section-renderer > lazy-list", { timeout: 10000 })
    try {
        const channelList = await page.$eval("ytm-item-section-renderer > lazy-list", async (el: { childNodes: any }) => {
            let list: Array<Object> = []
            for (let content of el.childNodes) { // @ts-ignore
                if (content.tagName == "YTM-COMPACT-CHANNEL-RENDERER") { // @ts-ignore
                    const name = content.querySelector("h4").innerHTML // @ts-ignore
                    const profile = content.querySelector("img").src // @ts-ignore
                    const link = content.querySelector("a").href // @ts-ignore
                    const sub = content.querySelectorAll(".small-text")[1].innerHTML
                    list.push({
                        "name": name, 
                        "profile": profile,
                        "sub": sub,
                        "link": link
                    })
                }
            }
            return list
        })
        await browser.close()
        return channelList
    } catch {
        return []
    }
}
