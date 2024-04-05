const sendForm = (event, apiPath, method, successUrl) => {
    event.preventDefault();
    const form = document.getElementById('form');

    const formData =  new FormData(form);
    let jsonRequestData = {};

    for (let [key, value] of formData) {
        jsonRequestData[key] = value;
    }

    fetch(apiPath, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonRequestData)
    }).then(async (res) => {
        if (res.status === 200) {
            window.location.href = successUrl;
        } else {
            let error = document.getElementById("error");
            error.innerHTML = await res.text();
        }
    })
}