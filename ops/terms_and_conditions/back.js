// Website pretty backend lmfao  
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