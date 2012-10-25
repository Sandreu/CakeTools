<?php

if (Configure::read('debug')>0) {
	App::uses('File', 'Utility');
	App::uses('Folder', 'Utility');
	$fol = new Folder('../ViewJs');
	$files = $fol->find('.*');
	foreach ($files as $f) {
		$file = new File('../ViewJs/' . $f);
		$ref = $file->lastChange();

		$file = new File('js/' . $f);
		$comp_ref = $file->lastChange();

		if ($file->exists() && $comp_ref<$ref+10) {
			if (!$file->delete()) DbErrorHandler::dbHandleException(new CakeException('Impossible de supprimer le JS expiré'));
		}
	}
}