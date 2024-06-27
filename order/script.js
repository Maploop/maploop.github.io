var error = document.getElementById("error");
const m_WebhookURL = 'https://discord.com/api/webhooks/1179818479675773009/VlPwZ3ychrQjNXaC01dddalMK9ml_oqs4YRD4QQ1OaZgYMNkHqX0k-5wxiuoMPxeO4RY';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const initialType = urlParams.get("contract_type");
console.log("Order type is " + initialType);

if (initialType != null) {
    SetSelecedContractType(initialType);
}

document.getElementById("send").onclick = function (e) 
{
    e.preventDefault();
    var emailFilled = CheckFilled("email");
    var detailsFilled = CheckFilled("textarea");

    if (!emailFilled || !detailsFilled) {
        error.style.display = "flex";

        if (!emailFilled && !detailsFilled) {
            BorderRed("email");
            BorderRed("textarea");
        }
        if (!emailFilled) {
            BorderRed("email");
        }
        if (!detailsFilled) {
            BorderRed("textarea");
        }
    }

    var email = GetDat("email");
    var type = GetSelectedContract();
    var details = GetDat("textarea");

    SendDiscordMessage(email, type, details);
}

function GetDat(id) {
    return document.getElementById(id).value;
}

function GetSelectedContract() {
    return document.getElementById("plans").value;
}

function SetSelecedContractType(sel) {
    document.getElementById("plans").value = sel;
}

function CheckFilled(id) {
    return document.getElementById(id).value != "";
}

function BorderRed(id) {
    document.getElementById(id).style.border = "1px solid crimson;";
}

function SendDiscordMessage(author, type, details) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", m_WebhookURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        'content': "Author: " + author + " \nType: " + type + " \nDetails: " + details,
        'username':'Contract from ' + author,
    }));
}