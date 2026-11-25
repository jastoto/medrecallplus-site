/* Shared "Ask a question" form logic — used by index.html (pop-up) and support.html (on the page).
   Any <form class="js-contact-form"> is handled. Submissions go through Web3Forms to support@medrecallplus.com. */
(function () {
  function setup(form) {
    var statusEl = form.querySelector('.cf-status');
    var btn = form.querySelector('button[type="submit"]');
    var wrap = form.closest('.cf-wrap');
    var done = wrap ? wrap.querySelector('.cf-done') : null;
    var btnText = btn.textContent;

    function err(msg, el) {
      statusEl.textContent = msg; statusEl.className = 'cf-status err';
      if (el) el.focus();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      statusEl.textContent = ''; statusEl.className = 'cf-status';
      var name = form.querySelector('[name="Name"]');
      var email = form.querySelector('[name="email"]');
      var topic = form.querySelector('[name="Topic"]');
      var msg = form.querySelector('[name="Message"]');
      if (!name.value.trim()) return err('Please enter your name.', name);
      if (!email.value.trim() || !email.checkValidity()) return err('Please enter a valid email address.', email);
      if (!topic.value) return err('Please choose a topic.', topic);
      if (!msg.value.trim()) return err('Please type your question.', msg);

      // Put the topic in the email subject so questions are easy to sort
      form.querySelector('[name="subject"]').value = 'MedRecall+ question: ' + topic.value;

      btn.disabled = true; btn.textContent = 'Sending…';
      fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form)
      })
      .then(function (r) { return r.json().catch(function () { return { success: false }; }); })
      .then(function (data) {
        if (data && data.success) {
          form.reset(); form.hidden = true; if (done) done.hidden = false;
        } else {
          err('Something went wrong sending your question. Please try again, or email support@medrecallplus.com.');
        }
      })
      .catch(function () { err('Could not connect. Check your internet connection and try again, or email support@medrecallplus.com.'); })
      .finally(function () { btn.disabled = false; btn.textContent = btnText; });
    });

    // "Send another question" resets back to the form
    if (done) {
      var again = done.querySelector('.cf-again');
      if (again) again.addEventListener('click', function () { done.hidden = true; form.hidden = false; });
    }
  }
  document.querySelectorAll('form.js-contact-form').forEach(setup);
})();
