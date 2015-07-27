function resizeInitialSlide(resizeElement) {
	var bodyheight = $(window).height() - 65;
	$(resizeElement).each(function (i) {
		var $this = $(this);
		if ($this.children().height() <= bodyheight || i == 0) {
			if (i > 0) {
				var padding = (bodyheight - $this.children().height() + 65) / 2;
				$this.css('padding-top', padding);
				this.style.height = (bodyheight - padding + 65) + 'px';
			}
			else
				this.style.height = bodyheight + 'px';
		}
		else
			this.style.height = 'initial';
		//$this.css('padding-top', 'initial');
	});
}

function submitMessage() {
	var hash = (new Date()).getTime();
	var url = "http://neraux.azurewebsites.net/send?t=0&o=1&hash=" + hash;

	$('.contact .text-input').each(function () {
		url += '&' + this.getAttribute('data-field') + '=' + encodeURI(this.value);
	});

	$.getScript(url, function () {
		var response = toolboxResults();
		submitMessageCallback(response.success);
	});

	return false;
}

function submitMessageCallback(success) {
	var message = success ? 'Thank you for your message!' : 'Oops! Please try again later.'
	var cls = success ? 'success' : 'fail';

	var $contact = $('.contact');
	var $parent = $contact.parent();
	$parent.height($parent.height());

	var $replaceWith = $('<div style="display:none;" class="status"><div class="' + cls + '"></div><h2>' + message + '</h2></div>');
	//$replaceWith.height($contact.height());
	$replaceWith.insertAfter($contact);

	$contact.fadeOut(200, function () {
		$replaceWith.fadeIn(200);
	});
}

function initializeMenu(selector) {
	$(selector).click(function (e) {
		if(this.hash)
			navigateToSection(this.hash, true);
		else
			navigateToSection('#/' + $(this).data('section'), true);
	});
}

//var $slide = $('div.slide[data-section="' + section + '"]');
function navigateToSection(hash, animate) {
	var section = $('div.slide[data-section="' + hash.substring(2) + '"]');
	//navigateToSection(section);
	var scrollPosition = 0;
	if (section.length > 0) {
		scrollPosition = section.offset().top
		//if ($(window).height() < section.height())
		scrollPosition -= 65;
	}

	if (animate)
		$('html, body').animate({
			scrollTop: scrollPosition
		}, 500);
	else
		$('html, body').scrollTop(scrollPosition);
}

; (function ($, window) {

	$.fn.mobileMenu = function (settings) {
		settings = settings || {};

		var menu = new $.MobileMenu(settings);
		menu.init();
		this.click(function (e) {
			e.preventDefault();
			menu.toggle(this);
		});
	};

	$.MobileMenu = function (settings) {
		var $menu = this;
		var defaults = {
			container: $('<div class="mobile-menu"></div>'),
			_open: false
		};

		$menu.settings = $.extend(true, {}, defaults, settings);

		$menu.init = function () {
			var content = $(this.settings.source).clone();
			$menu.settings.container.append(content);
			$menu.settings.container.hide();
			$menu.settings.container.appendTo($('.menu'));
			if ($menu.settings.clicked) {
				$menu.settings.container.on('click.mobile', 'a', function () {
					$menu.close();
					$menu.settings.clicked(this);
				});
			}
		};

		this.toggle = function () {
			if (this.settings._open)
				this.close();
			else
				this.open();

		};

		this.open = function () {
			this.settings._open = true;
			this.settings.container.show();
		};

		this.close = function () {
			this.settings._open = false;
			this.settings.container.hide();
		}
	};

	$.fn.inline = function (settings) {
		settings = settings || {};
		settings.selector = this.selector;
		var inline = new $.Inline(settings);

		var selector = '';
		var parts = this.selector.split(',');
		for (var i = 0; i < parts.length; i++) {
			parts[i] += ' ' + settings.children;
		}

		$(document).on('click.inline', parts.join(','), function (e) {
			e.preventDefault();
			inline.open(this);
		});

		this.find(settings.children).each(function () {
			var $this = $(this);
			var content = $this.attr('href');
			$(this).data('href', content);
			this.hash = content;
			this.pathname = window.location.pathname;
		});

		return this.each(function () {
		});
	};

	$.Inline = function (settings) {
		var inline = this;
		var defaults = {
			preview: $('<li class="inline-preview"></li>')
		};

		inline.settings = $.extend(true, {}, defaults, settings);

		this.open = function (sender) {
			var $sender = $(sender);
			var top = $sender.offset().top;
			var $root = $sender.closest(inline.settings.selector);
			var counter = -1;
			var found = false;
			inline.settings.preview.remove();
			$root.find(inline.settings.children).each(function () {
				if (top < $(this).offset().top) {
					found = true;
					return false;
				}
				counter++;
			});

			if (found) {
				$root.children().eq(counter).after(inline.settings.preview);
			}
			else {
				$root.append(inline.settings.preview);
			}

			$.get($sender.data('href'), function (r) {
				inline.settings.preview.empty();
				$sender.parents('[style*="height"]').css('height', 'auto');
				inline.settings.preview.css('display', 'none');
				inline.settings.preview.append($(r).children());
				//console.log(inline.settings.preview.innerHeight());
				inline.settings.preview.fadeIn(400, function () {
					resizeInitialSlide('.slide');
				});
			});
		}
	};
}(jQuery, window));