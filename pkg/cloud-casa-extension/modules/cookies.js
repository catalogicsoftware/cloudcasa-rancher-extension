function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export function isDarkTheme(){
  if (getCookie("R_THEME") == "auto") {
    if (getCookie("R_PCS") == "dark")
      return true;
    
    if (getCookie("R_PCS") == "light")
      return false;
  }

  if (getCookie("R_THEME") == "dark")
    return true;

  return false;
}
