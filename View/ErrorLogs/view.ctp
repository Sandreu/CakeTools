<?php $this->set('page_title', $data['ErrorLog']['type'] . '&nbsp;&nbsp;<small>' . strftime('%A %d %B à %Hh%M', strtotime($data['ErrorLog']['created'])) . '</small>'); ?>

<div class="modal-body" style="white-space: nowrap; overflow-x: auto;">
    <p><b>User : </b><?php echo $data['User']['complete_name']; ?></p>
    <p><b>Url : </b><?php echo $data['ErrorLog']['url']; ?></p>
    <br />
    <br />
    <p><?php echo str_replace("\n", '<br />', $data['ErrorLog']['trace']); ?></p>
</div>
<div class="modal-footer">
	<?php 
	echo $this->Html->link('Résoudre le ticket', array('action'=>'solve', $data['ErrorLog']['id']), array('class'=>'btn btn-success'));
	echo $this->Html->link('Fermer le ticket', array('action'=>'close', $data['ErrorLog']['id']), array('class'=>'btn btn-info'));
	echo $this->Html->link('Fermer', '#', array('class'=>'btn', 'data-dismiss'=>'modal'));
	?>
</div>