<div id="ajax_content_<?php echo $hash; ?>" class="ajaxrefresh">
    <?php if (isset($page_title)) : ?>
    <div class="modal-header">
        <a class="close" data-dismiss="modal">×</a>
        <h3>
             <?php echo $page_title; ?>
        </h3>
    </div>
    <?php endif; ?>
    <?php echo $content_for_layout; ?>
</div>