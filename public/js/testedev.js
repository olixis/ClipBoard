  var onloadCallback = function() {
      verifyCallback = function() {
          document.getElementById('btnUp').disabled = false;
      };
      expiredCallback = function() {
          document.getElementById('btnUp').disabled = true;
      };
      grecaptcha.render(
          'recaptcha', {
              'sitekey': '6LcZtQ0UAAAAAMQmcBkc9tY7_nkM5vQ_ooIIdVFC',
              'callback': verifyCallback,
              'expired-callback': expiredCallback
          }
      );
      
$(function() {

    var bar = $('.progress');
    var percent = $('.determinate');
    var status = $('#status');

    $('form').ajaxForm({
        beforeSend: function() {
            status.empty();
            bar.show();
            var percentVal = '0%';
            percent.width(percentVal);
        },
        uploadProgress: function(event, position, total, percentComplete) {
            var percentVal = percentComplete + '%';
            percent.width(percentVal);
        },
        complete: function(xhr) {
            if(xhr.status === 500){
               window.location.href='http://localhost:3000/500';
            }
            grecaptcha.reset();
            document.getElementById('btnUp').disabled = true;
            status.html(xhr.responseText);
        }
    });
}); 
  };