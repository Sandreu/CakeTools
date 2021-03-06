<?php
App::uses('AppController', 'Controller');
App::uses('File', 'Utility');
/**
 * NetworkRouters Controller
 *
 * @property NetworkRouter $NetworkRouter
 */
class JsController extends AppController {

    public function beforeFilter() {
        if (isset($this->Auth)) $this->Auth->allow('*');
        return parent::beforeFilter();
    }

	public function index() {
		$path = implode('/', $this->params['pass']);
		$file = new File('../ViewJs/'.$path);

		if (!$file->exists()) throw new NotFoundException();
		
		if (Configure::read('debug')==0) DbErrorHandler::dbHandleException(new CakeException('Compiler les fichiers JS!'));

        $this->response->type('javascript');
        $this->response->body($file->read());
		$this->response->compress();

        $this->autoRender = false;
	}

	public function error() {
		pr($this->request);

        $this->autoRender = false;
	}
}