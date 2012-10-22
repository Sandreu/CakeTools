<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
App::uses('ClassRegistry', 'Utility');
/**
 * Description of AppError
 *
 * @author seb
 * @property ErrorLog $ErrorLog
 */
class DbErrorHandler extends ErrorHandler {
    public static $ErrorLog;
    

    public static function save($data) {
        if (empty(self::$ErrorLog)) self::$ErrorLog = ClassRegistry::init('ErrorLog');
        self::$ErrorLog->getDataSource()->rollback();
        return self::$ErrorLog->save($data);
    }
    
    public static function handleException(Exception $exception) {
        try {
            $debug = Configure::read('debug');
            if (($exception instanceof MissingControllerException || $exception instanceof MissingPluginException) && !$debug) {
                echo 'Cette url n\'est pas valide.';
                exit(0);
            }
            $url = self::getUrl();

            if (class_exists('AuthComponent'))
                $auth = AuthComponent::user('id');
            else
                $auth = null;

            $message = sprintf("<b>[%s] %s</b><br />%s\n",
                    get_class($exception),
                    $exception->getMessage(),
                    $exception->getTraceAsString()
            );
            $save = array(
                'url' => $url,
                'params' => json_encode($_REQUEST),
                'type' => get_class($exception),
                'trace' => $message,
                'user_id' => $auth
            );

            if ($exception instanceof PDOException) {
                $save['trace'] .= '<br /><br /><b>Requête : </b>' . $exception->queryString;
            }
            
            if (!self::save($save)) {
                throw new CakeException('Erreur lors de la sauvegarde de l\'erreur');
            }

            return parent::handleException($exception);
        } catch (Exception $e) {
            return parent::handleException($e);
        }
    }

    public static function handleError($code, $description, $file = null, $line = null, $context = null) {
        if (error_reporting() === 0) {
            return false;
        }
        $errorConfig = Configure::read('Error');
        list($error, $log) = self::mapErrorCode($code);

        $debug = Configure::read('debug');
        if ($debug) {
            $data = array(
                'level' => $log,
                'code' => $code,
                'error' => $error,
                'description' => $description,
                'file' => $file,
                'line' => $line,
                'context' => $context,
                'start' => 2,
                'path' => Debugger::trimPath($file)
            );
            return Debugger::getInstance()->outputError($data);
        } else {
            try {
                $url = self::getUrl();

                $message = $error . ' (' . $code . '): ' . $description . ' in [' . $file . ', line ' . $line . "]\n";
                $message .= 'Url : ' . $url . "\n";

                if (class_exists('AuthComponent')) {
                    $message .= 'User : ' . AuthComponent::user('complete_name') . "\n";
                    $auth = AuthComponent::user('id');
                } else {
                    $message .= 'User : Non chargé';
                    $auth = null;
                }

                if (!empty($errorConfig['trace'])) {
                    $trace = Debugger::trace(array('start' => 1, 'format' => 'log'));
                    $message .= "Trace:\n" . $trace . "\n";
                }
                $save = array(
                    'url' => $url,
                    'params' => json_encode($_REQUEST),
                    'type' => 'PHP Error ' . $error,
                    'trace' => $message,
                    'user_id' => $auth
                );

                if (!self::save($save)) {
                    throw new CakeException('Erreur lors de la sauvegarde de l\'erreur');
                }
            } catch (Exception $e) {
                return parent::handleError($code, $description, $file, $line, $context);
            }
        }
    }
    
    protected static function getUrl() {
        return (env('HTTPS') ? 'https://' : 'http://') .env('SERVER_NAME').env('REQUEST_URI');
    }
}

?>
