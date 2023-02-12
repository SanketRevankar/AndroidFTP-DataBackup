export const getCookie = (name: any) => {
    var cookieValue = '';
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export const getRequestHeaders = () => {
    const csrftoken = getCookie('csrftoken')
    const requestHeaders: HeadersInit = new Headers()
    requestHeaders.set('X-CSRFToken', csrftoken)
    requestHeaders.set('Content-Type', 'application/json')
    return requestHeaders
}

export const postRequest = async (url: string, requestData: object, controller?: AbortController) => {
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: getRequestHeaders(),
        signal: controller?.signal
    })
    return await response.json()
}