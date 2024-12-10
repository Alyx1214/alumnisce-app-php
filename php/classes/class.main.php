<?php
/**
 * Author: Alyssa Mari F. Albarda
 */

session_start();
require_once('class.utils.php');
require_once('class.dbhelper.php');

$action = '';
$values = array();

// Decode JSON input
$postData = json_decode(file_get_contents('php://input'), true);

if (isset($postData['action'])) $action = $postData['action'];
if (isset($postData['values'])) $values = $postData['values'];

if (!empty($_FILES) > 0) {
    if (Utils::has_key('file_picture', $_FILES)) {
        $action = "uploadPicture";
    } else {
        $action = "uploadLogo";
    }
    $values = $_FILES;
}

new Main($action, $values);

class Main {
    public function __construct($action, $values) {
        $data = array();
        switch($action) {
            case 'login':
            case 'logout':
            case 'user-fetch':
            case 'user-save':
            case 'user-remove':
            case 'get-all-alumni':
            case 'get-users-by-keyword':
            case 'user-details-save':
            case 'user-check-login':
            case 'current-location-save':
                require_once('modules/class.user.php');
                $user = new User($action, $values);
                $data = $user->ret_val;
                break;
            case 'uploadPicture':
            case 'uploadLogo':
            case 'uploadImage':
                require_once('modules/class.upload_image.php');
                $up = new UploadImage($action, $values);
                $data = $up->ret_val;
                break;
            case 'isLoggedIn':
                require_once('modules/class.session.php');
                $ss = new Session($action, $values);
                $data = $ss->ret_val;
                break;
            case 'post-save':
            case 'posts-fetch':
            case 'comment-save':
            case 'comments-fetch':
            case 'keywords-fetch':
                require_once('modules/class.experience.php');
                $exp = new Experience($action, $values);
                $data = $exp->ret_val;
                break;
            case 'event-fetch':
            case 'interested-save':
            case 'get-current-user':
                require_once('modules/class.event.php');
                $ev = new Event($action, $values);
                $data = $ev->ret_val;
                break;
            case 'opportunities-fetch':
                require_once('modules/class.opportunity.php');
                $op = new Opportunity($action, $values);
                $data = $op->ret_val;
                break;
        }

        if (is_string($data)) echo $data;
        else echo json_encode($data);
    }
}
