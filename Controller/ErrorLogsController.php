<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ErrorLogsController
 *
 * @author seb
 * 
 * @property ErrorLog $ErrorLog
 */
class ErrorLogsController extends AppController {
    public $paginate = array(
        'conditions'=>array('status'=>'open'),
        'order'=>'ErrorLog.created DESC'
    );
    
    public function index() {
        $data = $this->paginate();
        $this->set(compact('data'));
    }
    
    public function view($id) {
        $data = $this->ErrorLog->read(array(), $id);
        if (empty($data)) throw new NotFoundException();
        $this->set(compact('data'));
    }
    
    public function solve($id) {
        $data = $this->ErrorLog->read(array(), $id);
        if (empty($data)) throw new NotFoundException();
        $this->ErrorLog->saveField('status', 'solved');
        $this->Flashes->add('success', 'Ticket résolu');
        $this->redirect($this->referer());
    }
    
    public function close($id) {
        $data = $this->ErrorLog->read(array(), $id);
        if (empty($data)) throw new NotFoundException();
        $this->ErrorLog->saveField('status', 'closed');
        $this->Flashes->add('info', 'Ticket clos');
        $this->redirect($this->referer());
    }
}

?>
