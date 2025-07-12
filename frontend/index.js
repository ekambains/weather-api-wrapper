async function getData() {
    let city = document.getElementById("city").value;
    console.log(city);
    let response = await fetch("http://localhost:3000", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ city: city }),
    });
    let data = await response.json();
    
    if(data.success) {
        document.getElementsByClassName("dataContainer")[0].style.display = "flex";
        document.getElementsByClassName("temp")[0].textContent = data.data.temp;
        document.getElementsByClassName("source")[0].textContent = `Coming from ${data.source}`;
        document.getElementsByClassName("location")[0].textContent = data.data.address;
        document.getElementsByClassName("description")[0].textContent = data.data.description;
        document.getElementById("city").value = "";
    }
    else {
        document.getElementById("city").value = "Error! Enter a valid City";
    }
}

document.getElementById("enter").onclick = () => getData();