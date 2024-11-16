const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const clipID = urlParams.get("view");
var clipFormat = urlParams.get("format");
const authToken = urlParams.get("auth");
// If no format is provided we automatically assume it's a mp4
if (!clipFormat) clipFormat = "mp4";

// Just display the title of the clip on top
document.getElementById('clip_title').innerHTML = clipID;

console.log(`Fetching video with ID ${clipID}...`);
console.log(`Auth token is ${authToken}`);

// Now we fetch the clip from our GitHub repo
var video_url = "Nothing";
fetch(`https://api.github.com/repos/refiu/clips/contents/${clipID}.${clipFormat}`, headers={
    'X-GitHub-Api-Version': '2022-11-28',
    'Accept': 'application/vnd.github+json',
    'Authorization': `token ${authToken}`
}).then(response => response.json()).then(data => {
    video_url = data['download_url'];
    console.log("Video URL: " + video_url);
    
    // Update meta tags so the video can embed
    update_meta_tags(video_url);

    // Finally we slot in the video URL
    document.getElementById("clip_player").src = video_url;
});

function update_meta_tags(url) {
    document.querySelector('meta[property="og:video"]').setAttribute('content', url);
    document.querySelector('meta[property="og:video:type"]').setAttribute('content', "application/" + clipFormat);
    document.querySelector('meta[property="og:image"]').setAttribute('content', url);
    document.querySelector('meta[property="og:description"]').setAttribute('content', clipID + " in " + clipFormat);
    console.log("Meta tags updated");
}