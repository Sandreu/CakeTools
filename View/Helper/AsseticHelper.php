<?php
/**
 * Assetic Helper.
 *
 */
class AsseticHelper extends AppHelper {

	public $helpers = array('Html');

/**
 * Options for the helper
 *
 * - `autoIncludePath` - Path inside of webroot/js that contains autoloaded view js.
 * - `jsCompressUrl` - Url to use for getting compressed js files.
 * - `cssCompressUrl` - Url to use for getting compressed css files.
 *
 * @var array
 */
	public $options = array(
		'force_compile'=>false,
		'js'=>array(
			'commonFile' => 'common.js',
		),
		'buildUrl' => array(
			'plugin' => 'asset_compress',
			'controller' => 'assets',
			'action' => 'get'
		),
	);

	protected $_files_js = array();
	protected $_files_css = array();

/**
 * Constructor - finds and parses the ini file the plugin uses.
 *
 * @return void
 */
	public function __construct(View $View, $settings = array()) {
		parent::__construct($View, $settings);
		$this->options = Set::merge($this->options, $settings);

		$engine = 'File';
		if (extension_loaded('apc') && (php_sapi_name() !== 'cli' || ini_get('apc.enable_cli'))) {
			$engine = 'Apc';
		}
		$duration = '+999 days';
		if (Configure::read('debug') >= 1) {
			$duration = '+10 seconds';
		}
		Cache::config('AssetCache', array(
			'engine' => $engine,
			'duration' => $duration,
			'prefix '=>'asset_',
			'lock'=>true
		));
	}

	public function addScript($file) {
		$this->_files_js[] = $file;
	}

	public function commonJs($compile = false) {
		if (Configure::read('debug') >= 1 && empty($this->options['force_compile'])) {
			$out = '';
			foreach ($this->_files_js as $js) {
				$out .= $this->Html->script($js)
			}
			return $out;
		}
		$files = array();
		foreach ($this->_files_js as $f) {
			if (File::exists(Configure::read('App.www_root').JS_URL.$f) {
				$files[] = Configure::read('App.www_root').JS_URL.$f;
			}
		}
		$compiled = Cache:read('compiled', 'AssetCache');
		return $this->Html->script($this->options['js']['commonFile']);
	}
}
