/*
============================
This is entirely intended for me to see who visits my links websites. Keeping track of how many clicks I've got and etc.
===========================
*/
const webhookUrl = "https://discord.com/api/webhooks/1347935412961939456/tSa3gYu96TvRC7qbS2qdsHvCSQObozvTgY_ec8BvakL51kRlq03pe87tJoSv96gtOpBF";
const startTime = Date.now();
var visitCountSinceUp = 0;

visitCountSinceUp++;


const statistic_msg = "~~-------------------------------------~~\n"
+ "# Links Visit!\n"
+ "Up Since: " + "<t:" + Math.floor(startTime / 1000) + ">"
+ "Visits Since Up: " + visitCountSinceUp
+ "Uptime: " + "<t:" + Math.floor((Date.now() - startTime) / 1000) + ">";
send_statistic(statistic_msg);

function send_statistic(message) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", webhookUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        'content': message,
        'username':'Statistic Report [VISIT]',
        'avatar_url': 'https://raw.githubusercontent.com/Maploop/maploop.github.io/refs/heads/master/links/ac885f19-48d5-499c-93cf-eafa43c773cc.jpg',
    }));
}