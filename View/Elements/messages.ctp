
<div id="message_contain">
    <?php
    if ($this->Session->check('Message')) {
        $msgs = $this->Session->read('Message');

        foreach ($msgs as $key => $val) {
            echo '<div class="alert closeable alert-' . $key . '" data-dismiss="alert" title="Cliquer pour fermer"><a class="close" href="#">×</a>';
            if (!empty($val['message'])) {
                echo $val['message'];
            } else {
                $val = implode('<br />', $val);
                echo '<span>' . $val . '</span>';
            }
            echo '</div>';
        }

        CakeSession::delete('Message');
    }
    ?>
</div>