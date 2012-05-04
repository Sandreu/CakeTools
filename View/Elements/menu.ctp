<?php 
if (empty($menu)) $menu = $this->Session->read('Menu');

if (!empty($menu)) : ?>
    <div class="navbar navbar-fixed-top" style="margin-bottom:3px;">
        <div class="navbar-inner">
            <div class="container" style="width:100%;">
                <?php if (isset($brand)) : ?>
                    <a class="brand" href="#">
                        <?php echo $brand; ?>
                    </a>
                <?php endif; ?>
                
                <ul class="nav">
                    <?php if (isset($brand)) : ?>
                        <li class="divider-vertical"></li>
                    <?php endif; ?>
                    <?php 
                    $n_current_url = Router::normalize($this->request['url']);
                    foreach ($menu as $item) {
                            $params = array('class'=>'');
                            $item_active = false;
                            if (!empty($item['children'])) {
                                //$params['class'] .= ' dropdown-toggle';
                                //$params['data-toggle'] = 'dropdown';
                                $text = $item['Menu']['name'];// . ' <b class="caret"></b>';
                                $url = $item['Menu']['url'];
                                $li_params = array('class'=>'');//dropdown');
                                foreach ($item['children'] as $subitem) {
                                    if (Router::normalize($subitem['Menu']['url'])==$n_current_url) {
                                        $li_params = $this->Form->addClass($li_params, 'active');
                                        $item_active = true;
                                    }
                                }
                                echo $this->Html->tag('li', null, $li_params);
                            } else {
                                $li_params = array();
                                $text = $item['Menu']['name'];
                                $url = $item['Menu']['url'];
                                if (Router::normalize($url)==$n_current_url) {
                                    $li_params = $this->Form->addClass($li_params, 'active');
                                    $item_active = true;
                                }
                                echo $this->Html->tag('li', null, $li_params);
                            }

                            echo $this->Html->link($text, $url, $params);
                            if (!empty($item['children'])) {
                                $this->start('sub-menu');
                                $ul_params = array('class'=>'nav nav-pills');
                                if (!$item_active) $ul_params['class'] .= ' hide';
                                echo $this->Html->tag('ul', null, $ul_params);
                                foreach ($item['children'] as $subitem) {
                                    echo '<li';
                                    if (Router::normalize($subitem['Menu']['url'])==$n_current_url) echo ' class="active"';
                                    echo '>';
                                    echo $this->Html->link($subitem['Menu']['name'], $subitem['Menu']['url']);
                                    echo '</li>';
                                }
                                echo '</ul>';
                                $this->end();
                            }
                            echo '</li>';
                    } ?>
                </ul>
                <?php if (class_exists('AuthComponent')) : ?>
                    <ul class="nav pull-right">
                        <li class="dropdown">
                            <?php 
                            $name = AuthComponent::user('complete_name');
                            echo $this->Html->link($name . ' <b class="caret"></b>', '#', array('class'=>'arrow-down account_details dropdown-toggle', 'data-toggle'=>'dropdown'));
                            ?>
                            <ul class="dropdown-menu account">
                                <li class="welcome">Bienvenue <?php echo $name; ?></li>
                                <li class="email"><?php echo AuthComponent::user('email'); ?></li>
                                <li class="divider"></li>
                                <li><?php echo $this->Html->overlay('Mon compte&nbsp;&nbsp;<i class="icon-user"></i>', array('controller'=>'users', 'action'=>'account'), array('style'=>'float:left;')); ?></li>
                                <li><?php echo $this->Html->link('<i class="icon-off"></i>&nbsp;&nbsp;Déconnexion', array('controller'=>'users', 'action'=>'logout'), array('style'=>'float:right; clear:none;')); ?></li>
                            </ul>
                        </li>
                    </ul>
                <?php endif; ?>
            </div>
        </div>
    </div>
<?php endif; 

if ($this->fetch('sub-menu')) {
    echo '<div class="container-fluid"><div class="subnav">';
    echo $this->fetch('sub-menu');
    echo '</div></div>';
}