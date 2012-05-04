<?php if ($this->Paginator->hasPage(null, 2)) : ?>
    <div class="pagination">    
        <?php 
        echo $this->Paginator->counter(array(
            'format' => 'Page {:page} sur {:pages}'
        ));
        ?>
        <ul>
            <?php
            // Shows the next and previous links
            echo $this->Paginator->prev('«', array('tag'=>'li', 'rel'=>null), '<a href="javascript:void(0)">«</a>', array('tag'=>'li', 'class' => 'disabled', 'escape'=>false));
            $pagination = $this->Paginator->numbers(array('tag'=>'li', 'separator'=>'', 'currentClass'=>'active'));
            $pagination = preg_replace('#<li class="active">(.*)</li>#is','<li class="active"><a href="javascript:void(0);">$1</a></li>',$pagination);
            echo $pagination;
            echo $this->Paginator->next('»', array('tag'=>'li', 'rel'=>null), '<a href="javascript:void(0)">»</a>', array('tag'=>'li', 'class' => 'disabled', 'escape'=>false));

            ?>
        </ul>
    </div>
<?php endif; ?>