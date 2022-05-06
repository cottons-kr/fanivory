declare global {
    interface Window { searchChannel: Function; }
    interface Window { getYoutuber: Function; }
    interface Window { getInfo: Function; }
    interface Window { resetStorage: Function; }
    interface Window { getYoutuberFromStorage: Function; }
    interface Window { saveYoutuberToStorage: Function; }
    interface Window { removeYoutuberFromStorage: Function; }
    interface Window { getYoutuberListFromStorage: Function; }
    interface Window { getStatusFromStorage: Function; }
    interface Window { setRecentYoutuberToStorage: Function; }
    interface Window { updateYoutuberToStorage: Function; }
    interface Window { getSettingFromStorage: Function; }
    interface Window { setYoutuberReloadTime: Function; }
    interface Window { getYoutuberReloadTime: Function; }
}

export {}