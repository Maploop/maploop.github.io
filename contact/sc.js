const m_SubmitButton = document.getElementById('submitbtn');
const m_WebhookURL = 'https://discord.com/api/webhooks/1179818479675773009/VlPwZ3ychrQjNXaC01dddalMK9ml_oqs4YRD4QQ1OaZgYMNkHqX0k-5wxiuoMPxeO4RY';

m_SubmitButton.addEventListener('click', (e) =>
{
    e.preventDefault();

    var nameE = document.getElementById('name');
    var emailE = document.getElementById('email');
    var messageE = document.getElementById('textarea');

    var name = nameE.value;
    var email = emailE.value;
    var message = messageE.value;
    SendDiscordMessage(name, email, message);
    nameE.value = '';
    emailE.value = '';
    messageE.value = '';
    document.getElementById('success').style.display = 'block';
});

function SendDiscordMessage(author, email, msg) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", m_WebhookURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        'content': "Author: " + author + " \nAuthor email: " + email + " \nMessage: " + msg,
        'username':'Message from ' + author,
    }));
}