<?php
/**
 * CakeTools View
 *
 * Custom Debug View class, helps with development.
 *
 * PHP versions 5
 *
 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
 * Copyright 2005-2010, Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright 2005-2010, Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link          http://cakephp.org
 * @package       CakeTools
 * @subpackage    CakeTools.views
 * @since         CakeTools 0.1
 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
 **/

/**
 * DebugView used by DebugKit
 *
 * @package CakeTools.views
 */
class CakeToolsView extends CakeToolsDoppelGangerView {
    
/**
 * Overloads _getLayoutFileName to search in CakeTools views if not found
 * 
 * @param type $name
 * @return type 
 */
    protected function _getLayoutFileName($name = null) {
        try {
            return parent::_getLayoutFileName($name);
        } catch (MissingLayoutException $e) {
            $plugin = $this->plugin;
            $this->plugin = 'CakeTools';
            $layout = parent::_getLayoutFileName($name);
            $this->plugin = $plugin;
            return $layout;
        }
    }

/**
 * Overloads _getViewFileName to search in CakeTools views if not found
 * 
 * @param type $name
 * @return type 
 */
    protected function _getViewFileName($name = null) {
        try {
            return parent::_getViewFileName($name);
        } catch (MissingViewException $e) {
            $plugin = $this->plugin;
            $this->plugin = 'CakeTools';
            $view = parent::_getViewFileName($name);
            $this->plugin = $plugin;
            return $view;
        }
    }
    
    
}
