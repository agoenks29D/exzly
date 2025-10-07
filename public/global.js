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

window.getUriSegment = (key) => {
  const path = window.location.pathname;
  const segments = path.split('/').filter(Boolean);

  if (key === undefined || key === null) {
    return segments;
  }

  const index = parseInt(key);

  if (!isNaN(index) && index >= 0 && index < segments.length) {
    return segments[index];
  }

  return undefined;
};

window.userSession = (() => {
  const SESSION_KEY = 'user-session';

  // 1. Internal function to retrieve and parse data from localStorage.
  const getParsedSession = () => {
    const sessionString = localStorage.getItem(SESSION_KEY);
    if (!sessionString) return {};
    try {
      return JSON.parse(sessionString);
    } catch (e) {
      console.error('Failed to parse user session from localStorage:', e);
      return {};
    }
  };

  // 2. Internal function exposed as UserSession.set(...)
  const setData = (updates) => {
    let session = getParsedSession();
    // Merge old and new data
    const updatedSession = { ...session, ...updates };
    // Save back to localStorage
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    return updatedSession;
  };

  // 3. Internal function exposed as UserSession.clear()
  const clearData = () => {
    localStorage.removeItem(SESSION_KEY);
    // Also remove associated tokens
    localStorage.removeItem('access-token');
    localStorage.removeItem('refresh-token');
  };

  // 4. Create and return the public UserSession Proxy object
  return new Proxy(
    {},
    {
      // Intercepts all property access (e.g., UserSession.fullName)
      get: function (target, prop) {
        // Expose the 'set' and 'clear' methods directly on the object
        if (prop === 'set') return setData;
        if (prop === 'clear') return clearData;

        // For data properties, fetch the latest session data
        const session = getParsedSession();
        return session[prop];
      },
    },
  );
})();

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
    userSession.clear();
    localStorage.removeItem('access-token');
    localStorage.removeItem('refresh-token');
    window.location.href = $(this).attr('href');
  });
});
