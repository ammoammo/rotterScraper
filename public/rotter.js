$(() => {
  $('.parallax').parallax();
  const imgUrl = $('.scoop img').not('[src^="http://rotter.net/forum/Images"], [src^="/User_files/forum/signatures/"]').attr('src');
  if (imgUrl) {
    console.log(imgUrl);
    $('.parallax > img').attr('src', imgUrl);
  }

  $('.collapsible').collapsible();


  // Attach a delegated event handler
  $("#scoopsTitles").on("click", ".scoop-link", function(ev) {
    $(this).closest("li").addClass("read");
  });

});