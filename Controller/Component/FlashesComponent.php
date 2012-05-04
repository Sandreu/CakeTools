<?php
class FlashesComponent extends Component {
	var $components = array('Session');
	
	function add($class, $msg) {
		$cpt = $this->Session->read('Message.'.$class);
		$cpt = count($cpt);
		$this->Session->write('Message.'.$class.'.'.$cpt, $msg);
	}
}
?>