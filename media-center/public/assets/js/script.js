$(function() {

	/**
	 * Client JS:
	 * Connect to the socket
	 */
	var socket = io();

	// Variable initialization

	var form = $('form.login');
	var secretTextBox = form.find('input[type=text]');
  secretTextBox[0].value = 'kittens';
	var presentation = $('.reveal');

	var key = "", animationTimeout;

	// When the page is loaded it asks you for a key and sends it to the server

	form.submit(function(e){

		e.preventDefault();
		key = secretTextBox.val().trim();

		// If there is a key, send it to the server-side
		// through the socket.io channel with a 'load' event.

		if(key.length) {
			socket.emit('load', {
				key: key
			});
		}

	});

	// The server will either grant or deny access, depending on the secret key
	socket.on('access', function(data){

		// Check if the user is "granted" access.
		if(data.access === "granted") {

			// Unblur everything
			form.hide();
			var ignore = false;

      $(window).on('click', function(event) {
      	if (typeof event === 'object' && event.target.id) {
          console.log(event.target.id);

          // update clients
          if(event.target.id === 'btnNext' || event.target.id === 'btnPrev') {
            if(ignore){
              // You will learn more about "ignore" in a bit
              return;
            }

            var hash = $("#plList li.plSel").index();
            console.log(hash);

            socket.emit('slide-changed', {
              hash: hash,
              key: key
            });
					}
				}

      });

      socket.on('navigate', function(data){

        // Another device has changed its slide. Change it in this browser, too:
        // window.location.hash = data.hash;
        $("ul#plList li")[data.hash].click();


        // The "ignore" variable stops the hash change from
        // triggering our hashchange handler above and sending
        // us into a never-ending cycle.
        ignore = true;

        setInterval(function () {
          ignore = false;
        },100);

      });

		}
		else {

			// Wrong secret key
			clearTimeout(animationTimeout);

			// Addding the "animation" class triggers the CSS keyframe
			// animation that shakes the text input.
			secretTextBox.addClass('denied animation');
			animationTimeout = setTimeout(function(){
				secretTextBox.removeClass('animation');
			}, 1000);

			form.show();
		}

	});

});
