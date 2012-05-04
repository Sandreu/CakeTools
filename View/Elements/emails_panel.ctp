<?php
CakeSession::delete('Emails');
?>
<h2>Emails générés</h2>
<div class="code-table">

	<?php
        if (empty($content)) {
            echo 'Aucun Email généré';
        } else {
            foreach ($content as $i=>$mail) { ?>
                    <h4><?php echo 'To '.(is_string($mail['headers']['To']) ? $mail['headers']['To'] : implode(', ', $mail['headers']['to'])); ?></h4>
                    <?php
                    //echo '<iframe style="width:100%;height:400px" frameborder="0" allowtransparency="true">';
                    echo $mail['message'];
                    //echo '</iframe>';
            }
        }
	?>
</div>
