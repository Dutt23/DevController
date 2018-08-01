// Setting the token as a default token.
// Axios will always use this as a header
import axios from "axios";

const setAuthToken = token => {
  if (token) {
    // Apply to every request
    // IN post-man we were using Authorization as a header
    axios.defaults.headers.common["Authorization"] = token;
  } else {
    // Delete auth header
    delete axios.defaults.headers.common["Authorization"];
  }
};

export default setAuthToken;
