$("[data-toggle=tooltip]").tooltip();
$('#color').on('change', function(){executeDEG()});
$('.ebuilder__input').on('input', function(){executeDEG()});

$('#cp1').colorpicker({
  format: "hex"
});
function executeDEG() {
  if ($("#media-type").val() == "none") {
    $("#media-url").attr("disabled", "").attr("placeholder", "Media Disabled");
  } else {
    $("#media-url").removeAttr("disabled").removeAttr("placeholder");
  }
  showUrl();
  changeMediaType($('#media-type').val(), $('#media-url').val());
  let embedcolor = $('#color').val().replace('#000000', '#202225').replace('#FFFFFF', '#202225');
  $('.embed__provider').html(escapeHtml($('#provider-name').val()));
  $('.embed__author').html(escapeHtml($('#author-name').val()));
  $('.embed__title').html(escapeHtml($('#title').val()));
  $('.embed__desc').html(escapeHtml($('#description').val()));
  $('.embed').css('border-left', `4px solid ${embedcolor}`);
  if(validURL($('#provider-url').val())) $('.embed__provider').addClass('islink')
  else $('.embed__provider').removeClass('islink');
  if(validURL($('#author-url').val())) $('.embed__author').addClass('islink')
  else $('.embed__author').removeClass('islink');
  validateElementURL("provider");
  validateElementURL("author");
  validateElementURL("media");
  validateElementURL("thumbnail");
  $('.colorpicker-input-addon').css("background", $('#color').val())

  let providerName = "&provider=" + encodeURIComponent($("#provider-name").val());
  let providerUrl = "&providerurl=" + encodeURIComponent($("#provider-url").val());
  let authorName = "&author=" + encodeURIComponent($("#author-name").val());
  let authorUrl = "&authorurl=" + encodeURIComponent($("#author-url").val());
  let title = "&title=" + encodeURIComponent($("#title").val());
  let color = "&color=" + encodeURIComponent($("#color").val());
  let mediaType = "&media=" + encodeURIComponent($("#media-type").val());
  let mediaUrl = "&mediaurl=" + encodeURIComponent($("#media-url").val());
  let mediaThumb;
  if ($("#media-type").val() == "video") mediaThumb = "&mediathumb=" + encodeURIComponent($("#thumbnail-url").val())
  else mediaThumb = "";
  let description = "&desc=" + encodeURIComponent($("#description").val());
  let urlQuery = providerName+providerUrl+authorName+authorUrl+title+color+mediaType+mediaUrl+mediaThumb+description;
  history.replaceState({page: 0}, "reviews", `/?deg${urlQuery}`);
}

$("#shorten-url").click(function(){shortenUrl()});
function validateElementURL(elinput) {
  if(validURL($("#"+elinput+"-url").val()) == false && $("#"+elinput+"-url").val() != "") {
    $("#"+elinput+"-url").addClass('is-invalid');
    $("#"+elinput+"-url-group .ebuilder__errormsg").html('URL is not valid.');
    $("#"+elinput+"-url-group .ebuilder__errormsg").show();
  } else {$("#"+elinput+"-url-group .ebuilder__errormsg").hide();$("#"+elinput+"-url").removeClass('is-invalid');}
}
function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}
function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
function shortenUrl() {
  var data = {
    "url": location.href.replace(new RegExp(`^https:\/\/${location.host}/`),''),
    providerName: $("#provider-name").val(), 
    providerUrl: $("#provider-url").val(),
    authorName: $("#author-name").val(),
    authorUrl: $("#author-url").val(),
    title: $("#title").val(),
    mediaType: $("#media-type").val(),
    mediaUrl: $("#media-url").val(),
    mediaThumb: $("#media-type").val() == "video" ? $("#thumbnail-url").val() : null,
    description: $("#description").val()
  }
  $.ajax({
    type: "POST",
    url: "/api/create",
    data: JSON.stringify(data),
    dataType: 'json',
    contentType: "application/json",
    success: function (resp) {
      showUrl(true, "https://"+location.host+"/e/" + resp['code'])
      Toast.create("Success!", "New short URL has been generated for this embed!", TOAST_STATUS.SUCCESS, 2500);
    },
    error: function (resp) {
      console.log(resp.responseJSON)
      Toast.create("Error", resp.responseJSON.error, TOAST_STATUS.DANGER, 5000);
    }
  });
}
function showUrl(doThis, url) {
  if(doThis) {
    $('#urlInput').val(url);
    $('#urlBox').show();
    $('#shorten-url').hide();
    $(".copyUrl").attr("data-clipboard-text", url);
  } else {
    $('#urlBox').hide();
    $('#shorten-url').show();
  }
}
function changeMediaType(type, url) {
  $('.embed__desc').show();
  $('#thumbnail-url-group').hide();
  if(type == "none") {
    $('.help-box').hide();
    $('.embed__image').attr("src", "")
    $('.embed__thumbnail').attr("src", "")
  } else if(type == "thumbnail") {
    $('.help-box .card-body').html(`<p class="mb-0">For the thumbnail media type to work properly you must have at least one of the following set:</p><ul class="mb-0"><li>Provider Name</li><li>Author Name</li><li>Title</li><li>Description</li></ul>`);
    $('.help-box').show();
    if(validURL(url)) $('.embed__thumbnail').attr("src", url)
    else $('.embed__thumbnail').attr("src", "")
    $('.embed__image').attr("src", "")
  } else if(type == "large") {
    $('.help-box .card-body').html(`<p class="mb-0">For the large media type to work properly you must have at least one of the following set:</p><ul class="mb-0"><li>Provider Name</li><li>Author Name</li><li>Title</li><li>Description</li></ul>`);
    $('.help-box').show();
    if(validURL(url)) $('.embed__image').attr("src", url)
    else $('.embed__image').attr("src", "")
    $('.embed__thumbnail').attr("src", "")
  } else if (type == "video") {
    $('#thumbnail-url-group').show();
    $('.help-box .card-body').html(`<p class="mb-0">For the video media type, the description will not show. To make it work properly you must have at least one of the following set:</p><ul class="mb-0"><li>Provider Name</li><li>Author Name</li><li>Title</li></ul>`);
    $('.help-box').show();
    $('.embed__desc').hide()
    if(validURL(url)) $('.embed__image').attr("src", "https://discord.mx/uwun0qRjwR.jpg")
    else $('.embed__image').attr("src", "")
    $('.embed__thumbnail').attr("src", "")
  }
} 

var clipboard = new ClipboardJS('.copyUrl');
clipboard.on('success', function(e) {
  e.clearSelection();
  $(".copyUrl").removeClass('btn-secondary').addClass('btn-success').html('Copied URL!');
  setTimeout(function(){ $(".copyUrl").addClass('btn-secondary').removeClass('btn-success').html("Copy URL"); }, 1500);
});
clipboard.on('error', function(e) {
  console.error('Action:', e.action);
  console.error('Trigger:', e.trigger);
});
executeDEG();