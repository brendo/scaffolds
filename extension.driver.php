<?php

	Class extension_scaffolds extends Extension{

		public function getSubscribedDelegates(){
			return array(
				array(
					'page'     => '/backend/',
					'delegate' => 'InitaliseAdminPageHead',
					'callback' => 'appendAssets'
				),
				array(
					'page'     => '/blueprints/sections/',
					'delegate' => 'AddSectionElements',
					'callback' => 'addSectionElements'
				),
			);
		}

	/*-------------------------------------------------------------------------
		Delegates:
	-------------------------------------------------------------------------*/

		public function appendAssets() {
			if(class_exists('Administration')
				&& Administration::instance() instanceof Administration
				&& Administration::instance()->Page instanceof contentBlueprintsSections
			) {
				Administration::instance()->Page->addStylesheetToHead(URL . '/extensions/scaffolds/assets/scaffolds.sections.css', 'screen', 10000, false);
				Administration::instance()->Page->addScriptToHead(URL . '/extensions/scaffolds/assets/scaffolds.sections.js', 10001, false);
			}
		}

		public function addSectionElements(array $context = array()) {
			$callback = Administration::instance()->getPageCallback();
			$page = Administration::instance()->Page;

			// Add 'Import'
			$page->insertAction(
				Widget::Anchor(__('Import'), '#', __('Import a Section definition'), 'create button', NULL, array(
					'accesskey' => 'c',
					'class' => 'scaffolds button',
					'data-action' => 'import'
				)),
				false
			);

			// If we are editing a Section, add 'Export'
			if($callback['context'][0] == 'edit') {
				$page->insertAction(
					Widget::Anchor(__('Export'), '#', __('Export this Section definition'), 'create button', NULL, array(
						'accesskey' => 'c',
						'class' => 'scaffolds button',
						'data-action' => 'export'
					)),
					false
				);
			}

			// Scaffolds Area
			$div = new XMLElement('div');
			$div->setAttribute('id', 'scaffolds-area');

			$context['form']->prependChild($div);
		}

	}
