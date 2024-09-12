var selected_section = "HOME";
var navigation_bar_id = "navigation_bar";

let nav_buttons = document.getElementById(navigation_bar_id).children;
for (var i = 0; i < nav_buttons.length; i++) {
  let button = nav_buttons[i]; 
  
  let sec_id = button.id.split('_')[2];
  
  if (!sec_id || sec_id === "ignore_me") continue;
  console.log('hello')

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

  selected_section = section;

  console.log("[INFO] SHOWING SECTION " + selected_section);
  document.getElementById(selected_section).classList.remove("hide");
  document.getElementById("nav_button_" + selected_section).classList.add("selected");

  window.scrollTo(0,0);
}
