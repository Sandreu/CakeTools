<?php 
if (Configure::read('debug')>=1 && empty($json['no_more'])) $json['sql'] = $this->element('sql_dump');
if (!empty($json['no_more'])) unset($json['no_more']);
echo json_encode($json);
?>