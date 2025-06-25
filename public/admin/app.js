jQuery(() => {
  /**
   * Display time
   */
  $('.display-date').html(moment().format('dddd, MMMM D, YYYY'));
  (function displayClock() {
    const currentTime = moment().format('h:mm [<small>]A[</small>]');
    const displayTime = $('.display-time').text();

    if (displayTime !== currentTime) {
      $('.display-time').html(currentTime);
    }

    setTimeout(displayClock, 1000);
  })();

  /**
   * Sidebar left
   */
  const sidebarleftState = localStorage.getItem('sidebar-left');
  if (sidebarleftState === 'collapsed') {
    $('[data-widget="pushmenu"]').PushMenu('collapse');
  } else if (sidebarleftState === 'collapsed') {
    $('[data-widget="pushmenu"]').PushMenu('expand');
  }

  $(document).on('collapsed.lte.pushmenu', () => {
    localStorage.setItem('sidebar-left', 'collapsed');
  });

  $(document).on('shown.lte.pushmenu', () => {
    localStorage.setItem('sidebar-left', 'shown');
  });
});
