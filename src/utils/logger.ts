'use strict';
//@todo use better Logger
export default {
  log: (message = '', extra: object) => {
    console.log("#Log: " + message);
    if (extra) {
      console.log(extra)
    }
  },
  error: (message = "Error!", extra: object) => {
    console.error("#Error: " + message);
    if (extra) {
      console.error(extra)
    }
  }
}
