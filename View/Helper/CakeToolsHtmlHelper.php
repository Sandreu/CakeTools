<?php
App::uses('HtmlHelper', 'View/Helper');

class CakeToolsHtmlHelper extends HtmlHelper {
    
    public function overlay($label, $url, $options = array()) {
        $default = array('escape'=>false);
        $options = array_merge($default, $options);
        $options['data-toggle'] = 'modal';
        //$options['title'] = empty($options['title']) ? strip_tags($label) : $options['title'];
        
        return $this->link($label, $url, $options);
    }
    
    public function parseAttributes($options, $exclude = null, $insertBefore = ' ', $insertAfter = null) {
        return $this->_parseAttributes($options, $exclude, $insertBefore, $insertAfter);
    }
    
    public function link($title, $url = null, $options = array(), $confirmMessage = false) {
        if (empty($options['escape'])) $options['escape'] = false;
        return parent::link($title, $url, $options, $confirmMessage);
    }
}
?>
