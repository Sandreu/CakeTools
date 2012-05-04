<?php $this->set('page_title', 'Historique d\'erreurs'); ?>
<div class="content_pad">
    <table class="full datatable">
        <thead>
            <tr>
                <th>Date</th>
                <th>type</th>
                <th>Url</th>
                <th>User</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach($data as $log) : ?>
                <tr>
                    <td><?php echo $log['ErrorLog']['created']; ?></td>
                    <td><?php echo $log['ErrorLog']['type']; ?></td>
                    <td><?php echo $log['ErrorLog']['url']; ?></td>
                    <td><?php echo $log['User']['complete_name']; ?></td>
                    <td class="actions">
                        <?php echo $this->Html->overlay('Voir', array('action'=>'view', $log['ErrorLog']['id'])); ?>
                        <?php echo $this->Html->link('Résolue', array('action'=>'solve', $log['ErrorLog']['id'])); ?>
                        <?php echo $this->Html->link('Fermer', array('action'=>'close', $log['ErrorLog']['id'])); ?>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>