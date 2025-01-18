const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const clipID = urlParams.get("view");
var clipFormat = urlParams.get("format");
const authToken = urlParams.get("auth");
// If no format is provided we automatically assume it's a mp4
if (!clipFormat) clipFormat = "mp4";

// Just display the title of the clip on top
document.getElementById("clip_title").innerHTML = "Clip: " + clipID;
document.title = "§ MeowSite • " + clipID + " in " + clipFormat;

console.log(`Fetching video with ID ${clipID}...`);
console.log(`Auth token is ${authToken}`);

// Now we fetch the clip from our GitHub repo

fetch("http://ip-api.com/json/109.201.152.186")
  .then((response) => response.json())
  .then((json) => {
    console.log(json["city"]);
    console.log(json.city);
  });

var video_url = "Nothing";
fetch(
  `https://api.github.com/repos/refiu/clips/contents/${clipID}.${clipFormat}`,
  (headers = {
    "X-GitHub-Api-Version": "2022-11-28",
    Accept: "application/vnd.github+json",
    Authorization: `token ${authToken}`,
  }),
)
  .then((response) => response.json())
  .then((data) => {
    video_url = data["download_url"];
    console.log("Video URL: " + video_url);

    // Finally we slot in the video URL
    document.getElementById("clip_player").src = video_url;
  });

// Website pretty backend lmfao
document.getElementById("share_button").onclick = (e) => {
  navigator.clipboard.writeText(window.location.href);
  document.getElementById("share_button").innerHTML =
    `<i class="fa-solid fa-check"></i> Copied`;
};

document.getElementById("share_button").onmouseleave = (e) => {
  document.getElementById("share_button").innerHTML =
    `<i class="fa-solid fa-share"></i> Share`;
};

document.getElementById("upload_button").onclick = (e) => {
  document.getElementById("upload_modal").style.display = "block";
};

document.getElementById("submit_upload_button").onclick = (e) => {
  document.getElementById("error_in_modal").style.display = "block";
};

document.getElementById("modal_close_button").onclick = (e) => {
  document.getElementById("upload_modal").style.display = "none";
  document.getElementById("error_in_modal").style.display = "none";
};

document.getElementById("download_button").onclick = (e) => {
  alert("Download is not yet implemented.");
};
