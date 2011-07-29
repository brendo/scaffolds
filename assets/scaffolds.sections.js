(function($) {
	$(document).ready(function() {
		var $scaffolds = $('#scaffolds-area'),
			$fields = $('#fields-duplicator'),
			$controls = $fields.find('.controls');

		// Add a dummy upload field so we can use the FileReader API
		$scaffolds.append($('<input type="file" id="file" />'));
		var $file = $('#file').bind('change', function() {
			// If no file was uploaded, abort.
			if(this.files.length !== 1) return;

			Scaffolds.parseFiles(this.files);
		});

		// Add event handlers for the Import/Export button in the Section Editor
		$scaffolds.find('ul').delegate('a', 'click', function(event) {
			var $self = $(this);

			if($self.data('action') == 'import') {
				$file.trigger('click');
			}
			else if($self.data('action') == 'export') {
				Scaffolds.export();
			}

			event.preventDefault();
		});

		// When the 'dropdown' arrow is clicked, toggle the 'dropdown' to close
		// (or open)
		$scaffolds.delegate('ul + a', 'click', function(event) {
			Scaffolds.toggle();
			event.preventDefault();
		});

		// Base extension object that does the (majority) of the logic
		var Scaffolds = {
			// The only accepted file at the moment is one with a .json extension
			acceptedFiles: /json$/i,

			// Given a FileList object, this will make sure the uploaded
			// file is one Scaffolds cares about (or rather can use) and if
			// so will call Scaffolds.import
			parseFiles: function(files) {
				var FR = new FileReader();

				// Listen for the onload event of the FileReader API
				// Tries to parse the file as JSON, if it's malformed, just
				// return (for now)
				// @todo Alert the user that the file isn't valid JSON
				FR.onload = function(event) {
					try {
						def = $.parseJSON(event.target.result);
						Scaffolds.import(def);
					}
					catch(e) {
						return;
					}
				}

				// If the file isn't one of our valid types, abort.
				// @todo Look at how else we can do this (mimetype?)
				if(Scaffolds.acceptedFiles.test(files[0].fileName)) {
					// Load the file as text, we'll convert to JSON in onload.
					FR.readAsText(files[0]);
				}
			},

			// Called with a JSON object as a parameter, this will trigger the
			// Section Editor duplicator
			import: function(def) {
				// Loop over the definition and trigger the duplicators
				$.each(def, function(label, definition) {
					$controls.find('option[data-type = ' + definition.type + ']').attr('selected', 'selected');
					$controls.find('a.constructor').trigger('click');

					// Need to check here that label isn't already in the listing
					var field = $fields.find('li.instance:last-of-type div.content');
					field.find('input[name*=label]').val(label);

					// Loop over our 'el' and set the values
					for(var k in definition) {
						if(!definition.hasOwnProperty(k) || k === 'type') continue;

						Scaffolds.set(field, k, definition[k]);
					}
				});

				Scaffolds.toggle();
			},

			// Not implemented.. yet
			export: function() {
				console.log('Exporting...');
				Scaffolds.toggle();
			},

			// Given the field context and a key/value pair, this will set the
			// approtiate values in the Field's settings.
			set: function(field, key, value) {
				var field = field.find(':input[name*=' + key + ']');

				// Select
				if(field.is('select')) {
					field.find('option[value=' + value + ']').attr('selected', 'selected');
					return;
				}

				// Checkbox
				// Symphony adds a hidden field before a checkbox, so field
				// may be an area with two elements. The first element will be a
				// hidden field, the second will be a checkbox.
				if(
					field.length == 2 && $(field[1]).is(':checkbox')
				) {
					$(field[1]).attr('checked', (value !== 'no'));
				}

				// Not all Checkbox fields have the hidden field, so handle that
				// case as well
				else if(field.is(':checkbox')) {
					field.attr('checked', (value !== 'no'));
				}

				// Input
				else {
					field.val(value);
				}
			},

			// Add/Removes the toggle class. Can be done with :target selector,
			// but we don't want the 'snap to element' effect, so no bingo.
			toggle: function() {
				$scaffolds.find('ul').toggleClass('target');
			}
		};
	});

})(jQuery.noConflict());