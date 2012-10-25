<?php
/**
 * ErrorHandler for Console Shells
 *
 * PHP 5
 *
 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
 * Copyright 2005-2011, Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright 2005-2011, Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link          http://cakephp.org CakePHP(tm) Project
 * @since         CakePHP(tm) v 2.0
 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
 */
App::uses('ConsoleErrorHandler', 'Error');
App::uses('ConsoleOutput', 'Console');
App::uses('CakeLog', 'Log');
App::uses('ClassRegistry', 'Utility');

/**
 * Error Handler for Cake console. Does simple printing of the
 * exception that occurred and the stack trace of the error.
 *
 * @package       Cake.Console
 */
class DbConsoleErrorHandler extends ConsoleErrorHandler {
    public static $ErrorLog;
    

    public function save($data) {
        if (empty($this->ErrorLog)) $this->ErrorLog = ClassRegistry::init('ErrorLog');
        self::$ErrorLog->getDataSource()->rollback();
        return $this->ErrorLog->save($data);
    }
    
    public function handleException(Exception $exception) {
        try {
            $url = $this->getUrl();

            $args = env('argv');
            $auth = null;
            foreach ($args as $key=>$arg) {
                if ($arg=='-u' || $arg=='--user') {
                    $auth = $args[$key+1];
                    break;
                }
            }
            
            $message = sprintf("<b>[%s] %s</b><br />%s\n",
                    get_class($exception),
                    $exception->getMessage(),
                    $exception->getTraceAsString()
            );
            $save = array(
                'url' => $url,
                'params' => json_encode(env('argv')),
                'type' => 'Shell : ' . get_class($exception),
                'trace' => $message,
                'user_id' => $auth
            );
            
            if ($exception instanceof PDOException) {
                if (empty($this->ErrorLog)) $this->ErrorLog = ClassRegistry::init('ErrorLog');
                $this->ErrorLog->getDataSource()->rollback();
                $save['trace'] .= '<br /><br /><b>Requête : </b>' . $exception->queryString;
            }
            
            if (!$this->save($save)) {
                throw new CakeException('Erreur lors de la sauvegarde de l\'erreur');
            } else {
                $std = $this->getStderr();
                $std->write(str_repeat('-', 100));
                $std->write(date('c'));
                $std->write(str_repeat('-', 100));
                parent::handleException($exception);
            }
        } catch (Exception $e) {
            $std = $this->getStderr();
            $std->write(str_repeat('-', 100));
            $std->write(date('c'));
            $std->write(str_repeat('-', 100));
            parent::handleException($e);
        }
    }

    public function handleError($code, $description, $file = null, $line = null, $context = null) {
        if (error_reporting() === 0) {
            return false;
        }

        list($name, $log) = ErrorHandler::mapErrorCode($code);
        
        try {
            $url = $this->getUrl();

            $errorConfig = Configure::read('Error');
            
            $message = $name . ' (' . $code . '): ' . $description . ' in [' . $file . ', line ' . $line . "]\n";
            $message .= 'Url : ' . $url . "\n";

            $args = env('argv');
            $auth = null;
            foreach ($args as $key=>$arg) {
                if ($arg=='-u' || $arg=='--user') {
                    $auth = $args[$key+1];
                    break;
                }
            }

            if (!empty($errorConfig['trace'])) {
                $trace = Debugger::trace(array('start' => 1, 'format' => 'log'));
                $message .= "Trace:\n" . $trace . "\n";
            }
            $save = array(
                'url' => $url,
                'params' => json_encode($args),
                'type' => 'Shell : PHP Error ' . $name,
                'trace' => $message,
                'user_id' => $auth
            );

            if (!$this->save($save)) {
                throw new CakeException('Erreur lors de la sauvegarde de l\'erreur');
            } else {
                $std = $this->getStderr();
                $std->write(str_repeat('-', 100));
                $std->write(date('c'));
                $std->write(str_repeat('-', 100));
                parent::handleError($code, $description, $file, $line, $context);
            }
        } catch (Exception $e) {
            $std = $this->getStderr();
            $std->write(str_repeat('-', 100));
            $std->write(date('c'));
            $std->write(str_repeat('-', 100));
            parent::handleError($code, $description, $file, $line, $context);
        }
    }
    
    protected function getUrl() {
        return implode(' ', env('argv'));
    }
}
