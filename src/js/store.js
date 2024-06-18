function Store() {

  this.preferences = {};

  const loadPreferences = () => {
    this.preferences = JSON.parse(localStorage.getItem("preferences")) || {};
  }

  this.savePreference = (key, value) => {
    this.preferences[key] = value;
    localStorage.setItem("preferences", JSON.stringify(this.preferences));
  }

  loadPreferences();
}


const store = new Store();
export default store;
