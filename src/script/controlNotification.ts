async function sendNotification(title: string, body="") {
    if (await Notification.requestPermission() == "denied") {
        alert(title)
        return
    }

    const options = {
        body: body
    }
    new Notification(title, options)
    return
}
