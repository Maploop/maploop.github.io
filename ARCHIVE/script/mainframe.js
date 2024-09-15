const parameters = new URLSearchParams(window.location.search);
const preset_section = parameters.get("section");
const login_available = parameters.get("login") === 1;

var selected_section = "HOME";
var navigation_bar_id = "navigation_bar";

// UPDATE SELECTED SECTION ON LOAD IN CASE THERE IS A DIFFERENT SELECTION!
if (preset_section)
    select_section(preset_section.toUpperCase()); 

let nav_buttons = document.getElementById(navigation_bar_id).children;
for (var i = 0; i < nav_buttons.length; i++) {
  let button = nav_buttons[i]; 
  
  let sec_id = button.id.split('_')[2];
  
  if (!sec_id || sec_id === "ignore_me") continue; 

  console.log(`[INFO] INITIATED NAVIGATION BAR BUTTON FOR SECTION "${sec_id}"`);
  button.onclick = () => {
    select_section(sec_id);
  };
}


function select_section(section) {
  if (!document.getElementById(section)) return;

  console.log("[INFO] HIDING SECTION " + selected_section);
  document.getElementById(selected_section).classList.add("hide");
  document.getElementById("nav_button_" + selected_section).classList.remove("selected");

  if (section !== "HOME") {
    document.getElementById("ignore_me_btn").classList.remove("bg-red");
    document.getElementById("ignore_me_btn").classList.add("bg-dark");
  } 
  else if (section === "HOME") {
    document.getElementById("ignore_me_btn").classList.remove("bg-dark");
    document.getElementById("ignore_me_btn").classList.add("bg-red");
  } 
  selected_section = section;

  console.log("[INFO] SHOWING SECTION " + selected_section);
  document.getElementById(selected_section).classList.remove("hide");
  document.getElementById("nav_button_" + selected_section).classList.add("selected");

  window.scrollTo(0,0); 
  update_page_url(section);
}

function update_page_url(sectionName) {
  window.history.pushState("filler", document.title, `?section=${sectionName}`);
}
