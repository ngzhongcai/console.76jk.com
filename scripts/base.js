const instance= {};

const loadBase= function(callback) {
  window.addEventListener("load", callback);
}

loadBase(function() {
  if(document.getElementById("version")) { document.getElementById("version").innerHTML= version; }
  instance.endpoint= endpoint; instance.spinner= new Spinner({ color: "#FFFFFF", radius: 2, width: 2, length: 5, left: "10%" });
  if(typeof loadScript== "function") { loadScript(); }
});

/* AJAX POST */
const post= function(type, url, action, variables, required, values, callback) {
  startSpin(action + "-btn"); if(instance.busy== true) { return; }; instance.busy= true;
  gather(type, action, variables, required, values, function(err, res) {
    if(err) { stopSpin(action + "-btn"); callback(err); return; }
    execute(type, url, res, function(err, res) {
      if(err) { stopSpin(action + "-btn"); callback(err); return; }
      stopSpin(action + "-btn");
      callback(null, res);
    });
  });
}

const gather= function(type, action, variables, required, values, callback) {
  var params;
  if(type== "application/x-www-form-urlencoded") { params= ""; }
  else if(type== "multipart/form-data") { params= new FormData(); }
  else if(type== "canvas") { params= {}; }
  if(variables.length== 0) { callback(null, params); return; }
  for(var i= 0; i< variables.length; i++) {
    const variable= variables[i]; const id= action + "-" + variable;
    var value= undefined;
    if(values[variable] && values[variable]!= "undefined") { value= values[variable]; }
    else if(document.getElementById(id)) {
      if(document.getElementById(id).type== "checkbox") { value= document.getElementById(id).checked; }
      else if(document.getElementById(id).type== "textarea") { value= encodeURIComponent(document.getElementById(id).value); }
      else { value= document.getElementById(id).value; }
    }
    else if(instance[variable]) { value= instance[variable]; }
    else if(document.getElementsByName(id).length> 0) { value= getValueFromRadio(id); }
    else { value= getValueFromQueryString(variable); }
    if(required.indexOf(variable)!= -1 && (value== "" || value== undefined)) { callback("MISSING_PARAMETERS::" + variable.toUpperCase()); return; }
    if(value!= "" && value!= undefined) {
      if(type== "application/x-www-form-urlencoded") { params= params== "" ? variable + "=" + encodeURIComponent(value) : params + "&" + variable + "=" + encodeURIComponent(value); }
      else if(type== "multipart/form-data") { params.append(variable, value); }
      else if(type== "canvas") { params[variable]= value; }
    }
    if(i== variables.length- 1) { callback(null, params); }
  }
}

const getValueFromRadio= function(name) {
  const elements= document.getElementsByName(name);
  for(const i= 0; i< elements.length; i++) {
    const element= elements[i];
    if(element.type== "radio" && element.checked== true) { return element.value; }
    if(i== elements.length- 1) { return undefined; }
  }
}

const getValueFromQueryString= function(name) {
  const querystring= window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");
  for(var i= 0; i< querystring.length; i++) {
    var params= querystring[i].split("=");
    if(params[0]== name) { return params[1]; }
    if(i== querystring.length- 1) { return undefined; }
  }
}

const execute= function(type, url, params, callback) {
  const request= createXMLHttpRequest(type);
  const cb= function(oXML) {
    const response= getJson(oXML.responseText);
    if(!response) { callback(); return; }
    if(response.hasOwnProperty("errorMessage")) { callback("SERVER_ERROR::" + response.errorMessage); return; }
    callback(null, response.response);
  }
  request.connect(url, params, cb);
}

const createXMLHttpRequest= function(type) {
  const xmlhttp= new XMLHttpRequest();
  this.connect= function(url, params, cb) {
    xmlhttp.open("POST", url, true);
    if(type== "application/x-www-form-urlencoded") { xmlhttp.setRequestHeader("Content-Type", type); }
    xmlhttp.onreadystatechange= function() { if(xmlhttp.readyState== 4) { cb(xmlhttp); } }
    xmlhttp.send(params);
  }
  return this;
}

/* PING PONG */
const ping= function(callback) {
  const action= "ping";
  const url= instance.endpoint + "/" + action.toLowerCase();
  const variables= ["bf"];
  const required= ["bf"];
  const values= {};
  const type= "application/x-www-form-urlencoded";
  post(type, url, action, variables, required, values, function(err, res) {
    err ? callback(err) : callback(null, res);
  });
}

const startPing= function() {
  if(instance.ping) { return; }
  instance.ping= setInterval(function() {
    firePing();
  }, 60000);
}

const firePing= function() {
  startPong();
  ping(function(err, res) {
    err ? clearCookie("bf") : setCookie("bf", res, 25920000000);
    instance.bf= err ? undefined : getCookie("bf");
    instance.profile= err ? undefined : jwt_decode(instance.bf);
    if(err) { location.href= "/index.html"; return; }
    stopPong();
  });
}

const startPong= function() {
	if(instance.pong) { clearTimeout(instance.pong); instance.pong= {}; }
	instance.pong= setTimeout(function() { logout(); }, 30000);
}

const stopPong= function() {
	if(!instance.pong) { return; }
	clearTimeout(instance.pong); instance.pong= {};
}

/* SPINNER */
const startSpin= function(id) {
  if(!document.getElementById(id)) { return; }
  instance.spinner.spin(document.getElementById(id));
}

const stopSpin= function(id) {
  instance.busy= false;
  if(!document.getElementById(id)) { return; }
  instance.spinner.stop();
}

/* COOKIES */
const setCookie= function(cname, cvalue, milliseconds) {
	const d= new Date(Date.now() + (milliseconds ? milliseconds : 86400000)); const expires= "expires=" + d.toUTCString(); const path= "path=/";
	document.cookie= cname + "=" + cvalue + "; " + expires + ";" + path + ";domain=76jk.com;";
}

const clearCookie= function(cname) {
  const expires= "expires=Thu, 01 Jan 1970 00:00:00 UTC"; const path= "path=/";
	document.cookie= cname + "=;" + path + ";" + expires + ";domain=76jk.com;";
}

const getCookie= function(cname) {
	const name= cname+ "=";
	const ca= document.cookie.split(";");
	for(var i= 0; i< ca.length; i++) {
		var c= ca[i];
		while(c.charAt(0)==" ") { c= c.substring(1); }
    if(c.indexOf(name)== 0) { return c.substring(name.length, c.length); }
	}
}

/* RENDER */
const renderElement= function(params) {
  const element= document.createElement(params.tag);
  if(params.id) { element.setAttribute("id", params.id); }
  if(params.type) { element.type= params.type; }
  if(params.class) { element.setAttribute("class", params.class); }
  if(params.style) { element.setAttribute("style", params.style); }
  if(params.onclick) { element.setAttribute("onclick", params.onclick); }
  if(params.onchange) { element.setAttribute("onchange", params.onchange); }
  if(params.oninput) { element.setAttribute("oninput", params.oninput); }
  if(params.innerHTML) { element.innerHTML= params.innerHTML; }
  if(params.value) { element.value= params.value; }
  if(params.display) { element.style.display= params.display; }
  if(params.disabled) { element.disabled= params.disabled; }
  if(params.name) { element.name= params.name; }
  if(params.checked) { element.checked= params.checked; }
  if(params.href) { element.href= params.href; }
  if(params.placeholder) { element.placeholder= params.placeholder; }
  if(params.src) { element.setAttribute("src", params.src); }
  if(params["data-admin"]) { element.setAttribute("data-admin", params["data-admin"]); }
  if(params["aria-hidden"]) { element.setAttribute("aria-hidden", params["aria-hidden"]); }
  params.parent.appendChild(element);
  return element;
}

/* DROPDOWN */
const renderArrayDropdown= function(id, array) {
  const dropdown= document.getElementById(id + "-dropdown"); while(dropdown.firstChild) { dropdown.removeChild(dropdown.firstChild); }
  if(array.length== 0) { /* dropdown.style.display= "none"; */ return; }
  for(const i= 0; i< array.length; i++) {
    const element= array[i];
    const selectDropdown= "javascript:selectDropdown('" + id + "', '" + (element.display ? element.display : element) + "', '" + (element.value ? element.value : element) + "');";
    const divChild= document.createElement("div"); divChild.setAttribute("class", "pure-u-1 pure-g dropdown-child");
    divChild.setAttribute("onclick", element.onclick ? element.onclick : selectDropdown); dropdown.appendChild(divChild);
    const pChild= document.createElement("p");
    pChild.setAttribute("class", "pure-u-1");
    pChild.setAttribute("style", element.style ? element.style : "line-height:50px;");
    pChild.innerHTML= element.display ? element.display : element;
    divChild.appendChild(pChild);
    if(i== array.length- 1) { /* dropdown.style.display= "block"; */ }
  }
}

const showDropdown= function(id) {
  const dropdown= document.getElementById(id + "-dropdown");
  if(dropdown.childNodes.length== 0) { return; }
  // if(dropdown.style.display== "block") { dropdown.style.display= "none"; return; }
  dropdown.style.display= "block";
  const div= document.getElementById(id + "-div"); if(!div) { return; }
  const onclickmore= div.getAttribute("onclickmore"); if(onclickmore) { eval(onclickmore); }
}

const hideDropdown= function(id) {
  setTimeout(function() {
    if(document.activeElement.nodeName== "BODY") { return; }
    document.getElementById(id + "-dropdown").style.display= "none";
  }, 1);
}

const selectDropdown= function(id, display, value) {
  const dropdown= document.getElementById(id + "-dropdown"); setTimeout(function() { dropdown.style.display= "none"; }, 1);
  const display_= document.getElementById(id + "-display");
  if(display_) { display_.innerHTML= display; display_.setAttribute("class", "pure-u-1 display"); }
  const element= document.getElementById(id); element.focus(); element.value= value;
  const onchange= element.getAttribute("onchange"); if(onchange) { eval(onchange); }
}

/* EXTRAS */
const getPage= function() {
  const pages= window.location.pathname.split("/");
  return pages[pages.length-1].split(".")[0];
}

const isJson= function(str) {
  try { const obj= JSON.parse(str); if(typeof obj== "object" && obj!== null) { return obj; }; return false; }
  catch(e) { return false; }
}

const getJson= function(str) {
  var json;
  try { json= JSON.parse(str); }
  catch(e) { return false; }
  return json;
}

const random= function(length, type) {
  if(type== "#") { return Math.floor(Math.random() * Math.pow(10, length) * 3); }
  const result= ""; const characters= "abcdefghijklmnopqrstuvwxyz0123456789"; const charactersLength= characters.length;
  for(const i= 0; i< length; i++) { result+= characters.charAt(Math.floor(Math.random() * charactersLength)); }
  return result;
}

const uuid= function() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c=>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

const numberWithCommas= function(x) {
  const parts= x.toString().split(".");
  parts[0]= parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

const validateEmail= function(email) {
	const re= /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

const check= function(id) {
  const checkbox= document.getElementById(id);
  checkbox.checked= !checkbox.checked;
}

const encodeBack= function() {
  return encodeURIComponent(window.location.pathname + window.location.search);
}

const decodeBack= function() {
  return decodeURIComponent(getValueFromQueryString("back"));
}

const animateSpinIcon= function(id) {
  const element= document.getElementById(id);
  element.setAttribute("class", "fas fa-spinner fa-spin");
}

const stopSpinIcon= function(id) {
  const element= document.getElementById(id);
  element.setAttribute("class", "fas fa-trash-alt");
}

const logout= function() {
  clearCookie("jk");
  location.href= "https://76jk.com";
}

const showMenu= function() {
  const dropdown= document.getElementsByClassName("pure-menu-children")[0];
  dropdown.style.display= dropdown.style.display== "block" ? "none" : "block";
} 
