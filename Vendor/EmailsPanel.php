<?php
/**
 * 
 */


/**
 * Email Panel for DebugKit
 *
 * To include this in your DebugKit panel list, add it to the options for DebugKit:
 *
 * @@@
 * public $components = array('DebugKit.Toolbar' => array(
 *    'panels' => array('Email')
 * ));
 * @@@
 *
 * @package CakeTools
 * @subpackage CakeTools.Vendors
 */
class EmailsPanel extends DebugPanel {

/**
 * Title
 *
 * @var string
 */
	public $title = 'Emails';

/**
 * Element name
 *
 * @var string
 */
	public $elementName = 'emails_panel';

/**
 * Plugin name
 *
 * @var string
 */
	public $plugin = 'CakeTools';

/**
 * Output buffer
 *
 * @var string
 */
	public $output = '';

/**
 * startup
 *
 * @return void
 */
	function startup(&$controller) {
		return parent::startup($controller);
	}

/**
 * beforeRender Callback
 *
 * @return array
 */
	function beforeRender(&$controller) {
                $out = CakeSession::read('Emails');
                $this->title .= ' ('.count($out).')';
		return $out;
	}
}
