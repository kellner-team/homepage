import '../assets/animate.scss';
import '../assets/carousel.scss';
import '../assets/styles.scss';
// noinspection ES6UnusedImports
import Carousel from 'bootstrap/js/dist/carousel';
import $ from 'jquery';

$(function () {
  $('#eventCarousel .carousel-item').each(function () {
    let minPerSlide = 4;
    let next = $(this).next();
    for (let i = 1; i < minPerSlide; i++) {
      if (!next.length) {
        next = $(this).siblings(':first');
      }
      next.children(':first-child').clone().appendTo($(this));
      next = next.next();
    }
  });

  // Loaded from here instead of a <script> tag, since jQuery's ready callback can run before a
  // deferred script has executed. Stays undefined when the script is blocked (e.g. by an ad blocker).
  let turnstileWidgetId;
  if (document.querySelector('#contactTurnstile')) {
    const turnstileScript = document.createElement('script');
    turnstileScript.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    turnstileScript.onload = function () {
      turnstileWidgetId = turnstile.render('#contactTurnstile', {
        sitekey: '0x4AAAAAAFNY7sLPv7RWf_mP',
        action: 'contact',
      });
    };
    document.head.appendChild(turnstileScript);
  }

  $('form#contactForm').submit(function (event) {
    event.preventDefault();

    const turnstileToken = turnstileWidgetId && turnstile.getResponse(turnstileWidgetId);
    if (!turnstileToken) {
      alert(
        'Die Sicherheitsüberprüfung ist noch nicht abgeschlossen. Bitte warte kurz oder schreibe direkt eine E-Mail an support@kellner.team',
      );
      return;
    }

    let formData = {
      name: $('#contactName').val(),
      email: $('#contactEmail').val(),
      phoneNumber: $('#contactPhone').val(),
      topic: $('#contactTopic').val(),
      message: $('#contactMessage').val(),
      turnstileToken: turnstileToken,
    };

    $.ajax({
      type: 'POST',
      url: 'https://my.kellner.team/api/v1/public/contact',
      data: JSON.stringify(formData),
      contentType: 'application/json',
    })
      .done(function () {
        alert(
          'Nachricht wurde erfolgreich versenden. Wir melden uns so schnell wie möglich bei dir.',
        );
        document.querySelector('form#contactForm').reset();
      })
      .fail(function () {
        alert(
          'Etwas ist schief gelaufen. Bitte versuche es erneut, oder schreibe direkt eine E-Mail an support@kellner.team',
        );
      })
      .always(function () {
        // Tokens are single-use, a retry or follow-up message needs a fresh one
        turnstile.reset(turnstileWidgetId);
      });
  });

  // JavaScript code for smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop,
          behavior: 'smooth',
        });

        // Update the URL without triggering a full page reload
        history.pushState({}, '', `#${targetId}`);
      }
    });
  });
});
