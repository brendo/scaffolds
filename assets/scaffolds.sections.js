(function($) {
	$(document).ready(function() {
		Symphony.Language.add({
			'<code>{$file}</code> does not appear to be JSON.': false,
			'An error occuring parsing the definition, ensure it is valid JSON.': false,
			'Imported {$num} fields from definition.': false
		});

		var $scaffolds = $('#scaffolds-area'),
			$fields = $('#fields-duplicator');

		// Add a dummy upload field so we can use the FileReader API
		// Add a dummy iframe so that when exporting the definition
		// can be prompted for download
		$scaffolds
			.append($('<input type="file" id="file" />'))
			.append($('<iframe id="iframe" />'));

		var $file = $('#file').bind('change', function() {
			// If no file was uploaded, abort.
			if(this.files.length !== 1) return;

			Scaffolds.parseFiles(this.files);

			$(this).val('');
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
			$scaffolds.find('ul').toggleClass('target');
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
				var reader = new FileReader();

				// Listen for the onload event of the FileReader API
				// Tries to parse the file as JSON, if it's malformed, just
				// return (for now)
				reader.onload = function(event) {
					try {
						Scaffolds.import(
							$.parseJSON(event.target.result)
						);
					}
					catch(e) {
						Symphony.Message.post(
							Symphony.Language.get('An error occuring parsing the definition, ensure it is valid JSON.'),
							'error'
						);
						Scaffolds.applyMessage();
						Scaffolds.closeDropDown();
					}
				}

				// If the file isn't one of our valid types, abort.
				if(Scaffolds.acceptedFiles.test(files[0].name)) {
					// Load the file as text, we'll convert to JSON in onload.
					reader.readAsText(files[0]);
				}
				else {
					Symphony.Message.post(
						Symphony.Language.get('<code>{$file}</code> does not appear to be JSON.', {
							'file': files[0].name
						}),
						'error'
					);
					Scaffolds.applyMessage();
					Scaffolds.closeDropDown();
				}
			},

			// Called with a JSON object as a parameter, this will trigger the
			// Section Editor duplicator
			import: function(def) {
				var $controls = $fields.find('.controls'),
					imported = 0;

				// Loop over the definition and trigger the duplicators
				for(var label in def) {
					if(!def.hasOwnProperty(label)) continue;

					var definition = def[label];
					// Check to make sure we aren't overriding an existing field
					// definition with the same name
					if(
						$fields.find('li.instance input[name*=label]').filter(function() {
							return $(this).val() == label;
						}).length !== 1
					) {
						$controls.find('option[data-type = ' + definition.type + ']').attr('selected', 'selected');
						$controls.find('a.constructor').trigger('click');

						var field = $fields.find('li.instance:last-of-type div.content');
						field.find('input[name*=label]').val(label);

						// Loop over our 'el' and set the values
						for(var k in definition) {
							if(!definition.hasOwnProperty(k) || k === 'type') continue;

							Scaffolds.set(field, k, definition[k]);
						}

						imported++;
					}
				}

				Symphony.Message.post(
					Symphony.Language.get('Imported {$num} fields from definition.', {
						'num': imported
					}),
					'success'
				);
				Scaffolds.applyMessage();
				Scaffolds.closeDropDown();
			},

			// This iterates over all the instances and generates a JSON schema
			// for the user to download. The JSON filename is the Section handle.
			export: function() {
				var def = {};

				$fields.find('li.instance div.content').each(function() {
					var $field = $(this),
						schema = {},
						label;

					// The key for def needs to the value of 'Label'
					label = $field.find('input[name*=label]').val();

					if(label == "") return;

					// Get the type for this field instance
					schema['type'] = $field.find('input[name*=type]:hidden').val();

					// Parse the rest as usual I guess
					$field.find(':input').filter(':not(:hidden), ').each(function() {
						var $instance = $(this),
							// For each of the fields in the setting, we need to serialize
							// the field information, then convert it to the JSON format
							// we are expecting..
							name = $instance.attr('name').match(/\[([a-z_]+)\](\[\])?$/),
							value = $instance.val();

						// Get fields that have a name, aren't the label (we already got that)
						// and have a field that actually has a value.
						if(name.length >= 2 && name[1] !== 'label' && value !== '') {
							// Custom logic for Checkbox
							if($instance.is(':checkbox')) {
								schema[name[1]] = ($instance.is(':checked')) ? 'yes' : 'no';
							}

							// Custom logic for Select Box
							else if($instance.is('select')) {
								var $selected = $instance.find('option:selected'),
									tmp = [];

								for(var i = 0, l = $selected.length; i < l; i++) {
									var $v = $($selected[i]);

									// If `v` is a number, we'll assume that's referencing an ID
									// This isn't useful to export across environments, but exporting
									// the Name might be
									if($v.val().search(/^[0-9]+$/) !== -1) {
										var t = {
											'value': $v.text()
										};

										if($v.closest('optgroup').length) {
											t.optgroup = $v.closest('optgroup').attr('label');
										}
										tmp.push(t);
									}
									// It's fine, normal Select Box value
									else {
										tmp.push({'value': $v.val()});
									}
								}

								schema[name[1]] = tmp;
							}

							// jQuery's val() will handle alot of the suck for us
							else {
								schema[name[1]] = value;
							}
						}
					});

					def[label] = schema;
				});

				Scaffolds.closeDropDown();

				// Get the current Section Name
				var section_name = $('input[name*=meta]:first').val();
				// Populate the iframe with the GET request so that the definition will downloaded
				$('#iframe').attr(
					'src',
					Symphony.WEBSITE + '/extensions/scaffolds/lib/class.spit.php?section=' + section_name + '&schema=' + encodeURIComponent(JSON.stringify(def, null, "  "))
				);
			},

			// Given the field context and a key/value pair, this will set the
			// approtiate values in the Field's settings.
			set: function(field, key, value) {
				var field = field.find(':input[name*=' + key + ']');

				// Select
				if(field.is('select')) {
					if($.isArray(value)) {
						for(var i = 0, l = value.length; i < l; i++) {
							var v = value[i];

							// Select has optgroup
							if(field.find('optgroup').length) {
								field
									.find('optgroup[label = ' + v.optgroup + ']')
									.find('option').filter(function() {
										return $(this).text() == v.value;
									})
									.attr('selected', 'selected');
							}

							// Select doesn't have an optgroup
							else {
								field
									.find('option').filter(function() {
										return $(this).text() == v.value;
									})
									.attr('selected', 'selected');
							}
						}
					}
					else {
						field.find('option[value=' + value + ']').attr('selected', 'selected');
					}

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

			// Removes the toggle class. Can be done with :target selector,
			// but we don't want the 'snap to element' effect, so no bingo.
			closeDropDown: function() {
				$scaffolds.find('ul').removeClass('target');
			},

			// Used to animate the Symphony Message's for consistency
			applyMessage: function() {
				// Dim system messages
				Symphony.Message.fade('silence', 10000);
			}
		};
	});

})(jQuery.noConflict());