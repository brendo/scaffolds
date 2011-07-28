(function($) {
	var def = {
		"Date":{"type":"date"},
		"Name":{"type":"input", 'location':'sidebar', 'show_column': 'no'}
	};

	$(document).ready(function() {
		var $scaffolds = $('#scaffolds-area'),
			$fields = $('#fields-duplicator'),
			$controls = $fields.find('.controls');

		// Add a dummy upload field so we can use the FileReader API
		$scaffolds.append($('<input type="file" id="file" />');

		var Scaffolds = {
				import: function() {
					console.log('Importing...', def);
					$('#file').trigger('click');

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
				export: function() {
					console.log('Exporting...');
					Scaffolds.toggle();
				},
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
					if(field.length == 2
						&& $(field[1]).attr('type') == 'checkbox'
					) {
						$(field[1]).attr('checked', (value !== 'no'));
					}

					// Input
					else {
						field.val(value);
					}
				},
				toggle: function() {
					$scaffolds.find('ul').toggleClass('target');
				}
			};

		$scaffolds.find('ul').delegate('a', 'click', function() {
			var $self = $(this);

			if($self.data('action') == 'import') {
				Scaffolds.import();
			}
			else if($self.data('action') == 'export') {
				Scaffolds.export();
			}
		});

		$scaffolds.delegate('ul + a', 'click', function(event) {
			Scaffolds.toggle();
			event.preventDefault();
		});
	});

})(jQuery.noConflict());