<?php

if (Configure::read('debug')>0) {
	App::uses('File', 'Utility');
	App::uses('Folder', 'Utility');
	$js = new Folder('js');
	$files = $js->findRecursive();
	$ref = 0;
	foreach ($files as $f) {
		$file = new File($f);
		if ($file->lastChange()>$ref) $ref = $file->lastChange();
	}

	$src = new Folder('../ViewJs');
	$files = $src->findRecursive();
	$news = 0;
	foreach ($files as $f) {
		$file = new File($f);
		if ($file->lastChange()>$news) $news = $file->lastChange();
	}

	if ($news>$ref+60) {
		throw new CakeException('Attention! JS plus récent détecté');
	}
}