<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of CakeToolsFormHelper
 *
 * @author sandreu
 */
App::uses('FormHelper', 'View/Helper');

class CakeToolsFormHelper extends FormHelper {
    protected $bootstrap = true;
    
    public function __call($method, $params) {
        if (empty($params)) {
            throw new CakeException(__d('cake_dev', 'Missing field name for FormHelper::%s', $method));
        }
        $prepend = $append = false;
        if (isset($params[1])) {
            if (isset($params[1]['prepend'])) {
                $prepend = $this->Html->tag('span', $params[1]['prepend'], array('class'=>'add-on'));
                unset($params[1]['prepend']);
            }
            if (isset($params[1]['append'])) {
                $append = $this->Html->tag('span', $params[1]['append'], array('class'=>'add-on'));
                unset($params[1]['append']);
            }
        }
        $input = parent::__call($method, $params);
        if ($prepend) {
            $input = $prepend . $input;
            $input = $this->Html->tag('div', $input, array('class'=>'input-prepend'));
        } elseif ($append) {
            $input .= $append;
            $input = $this->Html->tag('div', $input, array('class'=>'input-append'));
        }
        return $input;
    }

    public function create($model = null, $options = array()) {
        if (isset($options['bootstrap'])) $this->bootstrap = $options['bootstrap'];
        if ($this->bootstrap) {
            $options = Set::merge(
                array(
                    'class'=>'form-horizontal',
                ),
                $options
            );
        }
        return parent::create($model, $options);
    }
    
    public function inputs($fields = null, $blacklist = null) {
        if (!isset($fields['fieldset']) && !isset($fields['legend'])) $fields['fieldset'] = false;
        return parent::inputs($fields, $blacklist);
    }
    
    public function input($fieldName, $options = array()) {
        if ($this->bootstrap || !empty($options['bootstrap'])) {
            if (isset($options['type'])) {
                switch ($options['type']) {
                    case 'radio' :
                        $legend = false;

                        if (isset($options['legend'])) {
                            $legend = $options['legend'];
                            unset($options['legend']);
                        } elseif (isset($options['options']) && count($options['options']) > 1) {
                            $legend = __(Inflector::humanize($this->field()));
                        }
                        if (!isset($options['between'])) $options['between'] = '';
                        if (!isset($options['after'])) $options['after'] = '';
                        break;
                    case 'datetime' :
                    case 'time':
                    case 'date' :
                        $options = Set::merge(array(
                            'data-picker'=>$options['type'],
                            'class'=>''
                        ), $options);
                        $options['type'] = 'text';
                        break;
                }
            }
            if (isset($options['label']) && is_string($options['label'])) $options['label'] = array('text'=>$options['label']);
            if (isset($options['div']) && is_string($options['div'])) $options['div'] = array('class'=>$options['div']);
            $options = Set::merge(array(
                'div'=>array(
                    'class'=>'control-group'
                ),
                'label'=>array(
                    'class'=>'control-label'
                ),
                'between'=>'',
                'after' => '',
                'class'=>'input-xlarge',
                'format'=>array('before', 'label', 'between', 'input','error', 'after'),
                'error' => array('attributes' => array('class' => 'error-message help-block'))
            ), $this->_inputDefaults, $options);
            if (!empty($options['div'])) {
                $options['between'] .= '<div class="controls">';
                $options['after'] .= '</div>';
            }
            if (!empty($options['help-inline'])) {
                $options['after'] = '<span class="help-inline">' . $options['help-inline'] . '</span>' .  $options['after'];
                unset($options['help-inline']);
            }
            if (!empty($options['help-block'])) {
                $options['after'] = '<p class="help-block">' . $options['help-block'] . '</p>' .  $options['after'];
                unset($options['help-block']);
            }
        }
        unset($options['desc']);
        return parent::input($fieldName, $options);
    }
    
    public function radio($fieldName, $options = array(), $attributes = array()) {
        $attributes = array_merge(
            array(
                'bootstrap'=>$this->bootstrap
            ),
            $attributes
        );
        
        $out = '';
        if ($attributes['bootstrap']==true) {
            $attributes['legend'] = false;
            $attributes['label'] = false;
            $inline = isset($attributes['inline']) ? $attributes['inline'] : false;
            unset($attributes['inline']);
            
            $label_params = array(
                'class'=>'radio'
            );
            if ($inline) $label_params = $this->addClass($label_params, 'inline');
            
            $out = parent::radio($fieldName, $options, $attributes);
            $out = preg_replace('/(<input[^>]*radio[^>]*id="([^"]*)"[^>]*>[^<]*)/i', $this->Html->useTag('label', '${2}', $label_params, '${1}'), $out);
        } else {
            unset($attributes['bootstrap']);
            $out = parent::radio($fieldName, $options, $attributes);
        }
        return $out;
    }
    
    public function radio_buttons($field, $options) {
        if (empty($options['options'])) return '';
        
        if (!isset ($options['buttons'])) $options['buttons'] = array();
        $btn_params = array_merge(array('class'=>'btn'), $options['buttons']);
        unset($options['buttons']);
        
        $opts = $options['options'];
        unset($options['options']);
        
        if (!isset ($options['group_div'])) $options['group_div'] = array();
        $group_div = array_merge(array(
            'class'=>'btn-group',
            'data-toggle'=>'buttons-radio'
        ), $options['group_div']);
        unset($options['group_div']);
        
        $options = $this->domId($options);
        
        $out = '';
        foreach ($opts as $optVal => $optLabel) {
            $out .= $this->button($optLabel, array_merge($btn_params, array(
                'data-value'=>$optVal,
                'type'=>'button'
            ), $btn_params));
        }
        $group_div['data-target'] = '#'.$options['id'];
        $out = $this->Html->tag('div', $out, $group_div);
        
        $out = $this->hidden($field, $options) . $out;
        return $out;
    }
    
    public function date() {

    }

    public function submit($caption = null, $options = array()) {
        if (!isset($options['bootstrap']) && $this->bootstrap) {
            if (empty($options['class'])) $options['class'] = 'btn btn-primary';
        }
        return parent::submit($caption, $options);
    }
    
    public function end($options = null) {
        if (is_string($options)) $options = array('label'=>$options);
        if (!empty($options)) {
            if ($this->request->is('ajax') && (!empty($this->request->query['modal']) || !empty($this->request->data['_modal'])) || !empty($options['modal'])) {
                unset($options['modal']);
                if (!isset($options['div'])) {
                    $options['div'] = array('class' => 'modal-footer');
                } elseif (is_array($options['div']) && !isset($options['div']['class'])) {
                    $options['div']['class'] = 'modal-footer';
                }
                if (!isset($options['after'])) {
                    $options['after'] = $this->Html->link('Fermer', 'javascript:void(0)', array('class'=>'btn', 'data-dismiss'=>'modal'))
                        . '<input type="hidden" name="_modal" value="1" />';
                }
            } elseif (!empty($options)) {
                if (!isset($options['div'])) {
                    $options['div'] = array('class' => 'form-actions');
                } elseif (is_array($options['div']) && !isset($options['div']['class'])) {
                    $options['div']['class'] = 'form-actions';
                }
            }
        }

        return parent::end($options);
    }
}

?>
