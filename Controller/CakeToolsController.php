<?php

/**
 * Cake Tools default Controller
 * it overloads Controller, and AppController has to overload it
 * 
 */

App::uses('Controller', 'Controller');

class CakeToolsController extends Controller {
    public $ssmenu = array();
    
    public $rest = false;
    protected $json = array();
    
/**
 * Add Session, Flashes and RequestHandler components
 * 
 * @param type $request
 * @param type $response 
 */
    public function __construct($request = null, $response = null) {
        parent::__construct($request, $response);
        if (!isset($this->components['Session'])) $this->components[] = 'Session';
        if (!isset($this->components['Flashes'])) $this->components[] = 'CakeTools.Flashes';
        if (!isset($this->components['RequestHandler'])) $this->components[] = 'RequestHandler';
    }
    
/**
 * Overloads render to make CakeToolsView as View object
 *
 * @param string $view View to use for rendering
 * @param string $layout Layout to use
 * @return CakeResponse A response object containing the rendered view.
 * @link http://book.cakephp.org/2.0/en/controllers.html#Controller::render
 */
    public function render($view = null, $layout = null) {
        $this->_makeViewClass($this->viewClass);
        $this->viewClass = 'CakeTools.CakeTools';
        return parent::render($view, $layout);
    }
    
/**
 * Overloads invokeAction to handle ajax json rendering
 *
 * @param CakeRequest $request
 * @return mixed The resulting response.
 * @throws PrivateActionException, MissingActionException
 */
    public function invokeAction(CakeRequest $request) {
        if (empty($this->json['redirect'])) $tmp = parent::invokeAction($request);
        else $tmp = '';
        
        if ($this->request->is('ajax') && empty($this->request->params['return'])) {
            if (empty($this->json['redirect'])) {
                if (strpos($this->request->params['action'], 'json_')===0) {
                    $this->autoRender = false;
                }
                if ($this->autoRender) {
                    if (!isset($this->layout) || $this->layout=='ajax') $this->layout = 'cake_tools_ajax';
                    
                    $hash = md5(uniqid(rand()));
                    $this->set('hash', $hash);
                    $rendered = $this->render();
                    $this->json['html'] = $rendered->body();
                    $this->json['html_id'] = 'ajax_content_'.$hash;
                }
                
                $msgs = $this->Session->read('Message');
                if (!empty($msgs)) $this->json['messages'] = $msgs;
                $this->Session->delete('Message');
            }
            
            if (Configure::read('debug') && empty($this->json['no_more']) && $this->{$this->modelClass}->validationErrors) $this->json['val_errors'] = $this->{$this->modelClass}->validationErrors;
            
            $this->set('json', $this->json);

            $this->response->type('json');
            $this->render('/Elements/ajax', false);
        }
        return $tmp;
    }

/**
 * Beforerender
 *
 * @return bool Render or not.
 */
    public function beforeRender() {
        $this->set('ssmenu', $this->ssmenu);
        return parent::beforeRender();
    }

/**
 * Ajouter un enregistrement
 * 
 * @return bool Save success or not
 * 
 */
    protected function _record($id=null) {
        if (($this->request->is('post') || $this->request->is('put')) && $id && !$this->request->data($this->modelClass.'.id')) $this->request->data($this->modelClass.'.id', $id);
        if (!empty($this->data)) {
            if ($this->{$this->modelClass}->saveAll($this->data)) {
                $this->json['saved'] = $this->{$this->modelClass}->id;
                return $this->{$this->modelClass}->id;
            } else {
                return false;
            }
        } elseif ($id) {
            $this->data = $this->{$this->modelClass}->read(null, $id);
        }
        return false;
    }

    protected function _rest($id=null, $options = array()) {
        $default = array(
            'post'=>true,
            'put'=>true,
            'patch' => true,
            'delete'=>true,
            'get' => true,
            'fetch' => false,
            'model'=>$this->modelClass
        );
        if (is_array($this->rest)) $default = array_merge($default, $this->rest);
        $options = array_merge($default, $options);

        $model = $options['model'];
        if (!isset($model)) $this->loadModel($model);

        $this->autoRender = false;
        $this->response->type('json');
        
        $this->request->addDetector('patch', array('env' => 'REQUEST_METHOD', 'value' => 'PATCH'));

        if ($this->request->is('post') && $options['post'] || 
            $this->request->is('put')  && $options['put'] || 
            $this->request->is('patch')  && $options['patch']) {

            if ($id && !isset($this->data['id'])) $this->request->data('id', $id);

            $datas = $this->{$model}->save($this->data);
            if (!empty($datas)) {
                $this->json['data'] = $datas;
                return $this->{$model}->id;
            } else {
                $this->response->statusCode(403);
                if (!empty($this->{$model}->validationErrors)) $this->json['val_errors'] = $this->{$model}->validationErrors;
                return false;
            }
        } elseif ($this->request->is('delete') && $options['delete']) {
            if ($this->{$model}->delete($id)) return true;
        } elseif ($this->request->is('get')) {
            if (!empty($options['get']) && $id) {
                $get =  array();
                if (is_array($options['get'])) $get = $options['get'];
                $get['conditions'][$model . '.id'] = $id;
                $this->json['data'] = $this->{$model}->find('first', $get);
                if (empty($this->json['data'])) throw new NotFoundException();
                return;
            } else if (!empty($options['fetch'])) {
                if (!is_string($options['fetch'])) $options['fetch'] = '_fetchOptions';
                if (!method_exists($this, $options['fetch'])) throw new NotFoundException('Fetch non défini');

                $fetch = $this->{$options['fetch']}();
                $this->json['data'] = $this->{$model}->find('all', $fetch);
                return;
            } else if (!empty($options['paginate'])) {
                if (!is_string($options['paginate'])) $options['paginate'] = '_restPaginate';
                if (!method_exists($this, $options['paginate'])) throw new NotFoundException('Paginate non défini');

                $this->json = $this->{$options['paginate']}();
                return;
            }
        }
        throw new CakeException('Requête non validée');
    }

    public function rest($id=null) {
        if (!$this->rest) throw new NotFoundException();
        
        $this->_rest($id);
    }

    protected function _fetchOptions() {
        $options = array();
        if (isset($this->request->query['filters'])) {
            $options['conditions'][] = $this->request->query['filters'];
        }
        return $options;
    }

    protected function _restPaginate() {
        $conds = array();
        if (isset($this->request->query['filters'])) {
            $conds = $this->request->query['filters'];
        }
        $this->Paginator->settings['paramType'] = 'querystring';
        $out['data'] = $this->paginate($this->modelClass, $conds);

        if (!isset($this->request->params['paging']) || empty($this->request->params['paging'][$this->modelClass])) {
            throw new CakeException('Pas de paramètres de pagination');
        }

        $out['paging'] = $this->request->params['paging'][$this->modelClass];
        
        return $out;
    }
    
    protected function _delete($id) {
        if ($this->{$this->modelClass}->delete($id)) {
            $this->json['saved'] = true;
            return true;
        } else {
            return false;
        }
    }
    
    
    public function  redirect($url, $status = null, $exit = true) {
        if ($this->request->is('ajax')) {
            $this->json['redirect'] = Router::url($url, true);
            return;
        }
        return parent::redirect($url, $status, $exit);
    }
/**
 * Makes the CakeToolsDoppleGangerView class if it doesn't already exist.
 * This allows this View to be compatible with all view classes.
 *
 * The code is extracted from the ToolbarComponent of the DebugKit plugin
 * 
 * @param string $baseClassName
 * @return void
 * 
 */
	protected function _makeViewClass($baseClassName) {
		if (!class_exists('CakeToolsDoppelGangerView')) {
			$plugin = false;
			if (strpos($baseClassName, '.') !== false) {
				list($plugin, $baseClassName) = pluginSplit($baseClassName, true);
			}
			if (strpos($baseClassName, 'View') === false) {
				$baseClassName .= 'View';
			}
			App::uses($baseClassName, $plugin . 'View');
			$class = "class CakeToolsDoppelGangerView extends $baseClassName {}";
			eval($class);
		}
	}
}