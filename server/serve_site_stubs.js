// Stand-ins for scripts the copy disconnects on purpose (see mirror_rewrite.js). A page that loads one gets a script
// that does nothing instead of a 404: EmailJS (the live site's form mailer) accepts calls and sends nothing.
// Used by serve_site.js (local) and build_deploy.js (static files for Vercel).
"use strict";
const BLOCKED_SCRIPTS = ["cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"];
function blockedStub(p) {
  if (/emailjs/i.test(p)) {
    return "/* EmailJS is disconnected in this copy of the site: nothing is sent. */\n" +
      "(function(){var no=function(){return Promise.reject(new Error(\"Forms are disconnected in this copy of the site\"));};" +
      "window.emailjs={init:function(){},send:no,sendForm:no};})();\n";
  }
  return "/* disconnected in this copy of the site */\n";
}
module.exports = { BLOCKED_SCRIPTS, blockedStub };
