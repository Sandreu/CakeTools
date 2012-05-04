<?php 
$options = array('class'=>'action-buttons fr');
if (!empty($actions['options'])) {
    $options = $actions['options'];
    $options = $this->Html->addClass($options, 'action-buttons fr');
    unset($actions['options']);
}
$options = $this->Html->parseAttributes($options);

if ($actions) : ?>
    <?php echo $this->Html->tag('ul', null, $options); ?>>
        <?php
        foreach ($actions as $item) {
            if (empty($item['options'])) $params = array('class'=>'');
            else $params = $item['options'];
            echo '<li>';

            $label = '';
            $params = $this->Html->addClass($params, 'ui-button ui-corner-all ui-state-default hover_link');
            if (!empty($item['icon'])) {
                if (!empty($item['label'])) $params = $this->Html->addClass($params, 'ui-button-text-icon-primary');
                else $params = $this->Html->addClass($params, 'ui-button-icon-only');
                $label .= '<span class="ui-button-icon-primary ui-icon ui-icon-'.$item['icon'].'"></span>';
            } else {
                $params = $this->Html->addClass($params, 'ui-button-text-only');
            }

            if (!empty($item['label'])) {
                $label .= '<span class="ui-button-text">'.$item['label'].'</span>';
            }
            $params['escape'] = false;

            if (isset($item['target'])) {
                echo $this->Html->link($label, $item['target'], $params);
            } else {
                echo $this->Html->overlay($label, $item['modal'], $params);
            }

            echo '</li>';
        }
    echo '</ul>';
    ?>

<?php endif; ?>