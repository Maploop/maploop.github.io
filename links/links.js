/*
Hello! Welcome to the source code.

I will not be paying to host this website on an actual server where 
I can use some dumbass obfuscator for the code.

So do whatever you want with the information that's here.
*/
const webhook_url = "68747470733A2F2F646973636F72642E636F6D2F6170692F776562686F6F6B732F313335343133383636363937323334383537302F6F485F586267527768776E44485F7255624B41354862376356635F6F775F36626836516C34622D7256356F497438495149436369556F5A32657757627156663231314646";
/*
    My simple reasoning for putting this Webhook URL in hex format and decoding it live is because of public web scraping bots that attack these links.
    Not to "hide" it from ordinary people.
*/

const statistic_msg = "~~-------------------------------------~~\n"
+ "### Links Visit!\n"
+ "Time: " + "<t:" + Math.floor(startTime / 1000) + ">";



send_statistic(hexToString(webhook_url), statistic_msg);

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

function hexToString(hexString) {
    let string = '';
    for (let i = 0; i < hexString.length; i += 2) {
      string += String.fromCharCode(parseInt(hexString.substring(i, i + 2), 16));
    }
    return string;
  }