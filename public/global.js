window.getTimezone = () => {
  return localStorage.getItem('server-timezone') || moment.tz.guess();
};

window.getQueryParams = (key = undefined) => {
  const search = window.location.search.substring(1);
  return search.split('&').reduce((queryParams, param) => {
    const [i, value] = param.split('=');
    queryParams[i] = decodeURIComponent(value);
    if (queryParams[key]) {
      return queryParams[key];
    }

    return i.length > 0 ? queryParams : undefined;
  }, {});
};

window.showHidePassword = (element) => {
  const inputElement = $($(element).parent()).children('input');
  if (inputElement.attr('type') === 'password') {
    inputElement.attr('type', 'text');
    $($(element).children()).children('span').removeClass('fa-eye-slash').addClass('fa-eye');
  } else {
    inputElement.attr('type', 'password');
    $($(element).children()).children('span').removeClass('fa-eye').addClass('fa-eye-slash');
  }
};

const ucfirst = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const SwalToast = (position = 'top-end', timer = 6000) =>
  Swal.mixin({
    toast: true,
    position,
    showConfirmButton: false,
    timer,
  });

const setFormDisabled = (state = true, formElement) => {
  if (formElement) {
    $(`form${formElement} input, form${formElement} button`).prop('disabled', state);
  } else {
    $('form input, form button').prop('disabled', state);
  }
};

jQuery(() => {
  if (!localStorage.getItem('server-timezone')) {
    $.ajax({
      url: createRoute('api'),
      method: 'GET',
      success: (response) => {
        localStorage.setItem('server-timezone', response.timezone);
      },
    });
  }

  $('.sign-out-link').on('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('access-token');
    localStorage.removeItem('refresh-token');
    window.location.href = $(this).attr('href');
  });

  const { serviceWorkerManager } = Exzly;

  if (serviceWorkerManager.isSupported()) {
    serviceWorkerManager.isRegistered().then((isRegistered) => {
      if (isRegistered && Notification.permission === 'default') {
        serviceWorkerManager.subscribeWebPush().then(
          (subscription) => {
            console.log({ subscription });
          },
          (error) => {
            console.log({ error });
          },
        );
      }

      serviceWorkerManager.subscribeWebPush().then(
        (subscription) => {
          console.log({ subscription });
        },
        (error) => {
          console.log({ error });
        },
      );

      if (!isRegistered) {
        serviceWorkerManager.register().then(
          (registration) => {
            console.log('registered', registration);
          },
          (error) => {
            console.error('Registration error', error);
          },
        );
      }
    });
  }

  serviceWorkerManager.onMessage((data) => {
    console.log('onMESSAGE', { data });
  });
});
