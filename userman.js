userMan = {};
userMan.isLoggedIn = false;
if (!!localStorage["userman-name"] && !!localStorage["userman-pass"]) {
  userMan.isLoggedIn = true;
}
setInterval(() => {
  if (!!localStorage["userman-name"] && !!localStorage["userman-pass"]) {
    userMan.isLoggedIn = true;
  }
}, 1000);
userMan.errorCodes = {
  101: "Information is wrong",
  200: "Error parsing input",
  201: "Values are missing"
};
userMan.logIn = function logIn(username, password, callback, err, additionalRows = null) {
  callback("Hold on, we're working on it...");
  let user = Parse.User.logIn(username, password).then(function(user) {
    callback("Logged in. Redirecting...");
    localStorage.setItem("userman-name", username);
    localStorage.setItem("userman-pass", password);
    if (additionalRows) {
      additionalRows.forEach(x => {
        localStorage.setItem("userman-" + x.toLowerCase().trim(), user.get(x));
      });
    }
    setTimeout(() => {
      parent.postMessage("reload", "*");
      parent.document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    }, 1000);
  }).catch(function(error) {
    console.log(error);
    err("Error: Failed to login. Check your password and try again.\n\nError Code: " + error.code + " (" + userMan.errorCodes[error.code] + ")");
  });
}
userMan.logOut = function logOut() {
  Object.keys(localStorage).forEach(x => x.startsWith("userman-") && localStorage.removeItem(x));
  sessionStorage.clear();
  location.reload(true);
}
userMan.signUp = async function signUp(username, password, callback, err, loginPath) {
  if (!username) {
    return err("Please enter a username.");
  }
  if (!password) {
    return err("Please enter a password.");
  }
  if (password.length < 8) {
    return err("Please enter a password longer than 7 characters.");
  }
  if (password.length > 20) {
    return err("Please enter a password shorter than 20 characters.");
  }
  if (username.length < 3) {
    return err("Please enter a username longer than 2 characters.");
  }
  if (username.length > 12) {
    return err("Please enter a username shorter than 12 characters.");
  }
  if (/[\ \#\$\%\^\*\(\)\+\=\[\]\{\}\;\:\'\"\\\/\.\,]|[^\u0000-\u00ff]/.test(password)) {
    return err("Password contains invalid characters!");
  }
  if (/[\#\%\*\(\)\+\=\[\]\{\}\;\:\'\"\\\/\,]|[^\u0000-\u00ff]/.test(username)) {
    return err("Username contains invalid characters!");
  }
  let user = new Parse.User();
  user.set("username", username);
  user.set("password", password);
  try {
    user = await user.save();
    if (user !== null) {
      callback({
        text: "Success! You will need to log in now.",
        button: "Log in"
      }).then(() => parent == window ? location.replace(loginPath || "login.html") : parent.postMessage("login", "*"));
    }
  } catch (error) {
    error.code == 202 ? err("Error: A user already exists with that username.") : err(error.message);
    console.log(error);
  }
}
userMan.get = function(row) {
  return localStorage["userman-" + row.toLowerCase().trim().replace("user", "").replace("word", "")];
}