<?php
/**
 * Author: Alyssa Mari F. Albarda
 */
require_once('lib/cwupload.php');
class UploadImage {
    public $ret_val = array();
    
    public function __construct($action, $values) {
        $ret_val = array();
        switch($action) {
            case 'uploadPicture':
                $ret_val = $this->upload_picture($values);
                break;
            case 'uploadLogo':
                $ret_val = $this->upload_logo($values);
                break;
            case 'uploadImage':
                $ret_val = $this->upload_image($values);
                break;
        }
        
        $this->ret_val = $ret_val;
    }
    
    private function upload_picture($v) {
        $database_obj = new IPDO();
        $filename = self::gen_random_hash_image($database_obj);
        $_FILES = $v;
        if(Utils::get_validate($_FILES['file_picture']['tmp_name'], 'validate_image')){
            cwUpload('file_picture','../../client/assets/images/profile_pic/',$filename,true, '../../client/assets/images/profile_pic/thumb/',200, 200);
            $all = true;
            $query="UPDATE tbl_accounts SET profile_pic=? WHERE id=?";
            $values = array($filename,$_SESSION['user_id']);
            $result = DBHelper::manual($all, $query, $values);
            return $result;
        }
        return false;
    }
    
    private function upload_image($v) {
        $database_obj = new IPDO();
        $filename = self::gen_random_hash_image($database_obj);
        $_FILES = $v;
        if(Utils::get_validate($_FILES['fileAddImage']['tmp_name'], 'validate_image')){
            cwUpload('fileAddImage','../../client/assets/images/worklog_images/',$filename,true, '../../client/assets/images/worklog_images/thumb/',200, 200);
            $all = true;
            $query="INSERT INTO tbl_worklog_images (worklog_id, images) values (?, ?)";
            $values = array($v['id'],$filename);
            $result = DBHelper::manual($all, $query, $values);
            return $result;
        }
        return false;
    }
    
    private function upload_logo($v) {
        $database_obj = new IPDO();
        $filename = self::gen_random_hash_image($database_obj);
        $_FILES = $v;
        reset($v);
        $first_key = key($v);
        if(Utils::get_validate($_FILES[$first_key]['tmp_name'], 'validate_image')){
            cwUpload($first_key,'../../client/assets/images/profile_pic/',$filename,true, '../../client/assets/images/profile_pic/thumb/', 200, 200);
            $all = true;
            $query="UPDATE tbl_organizations SET logo=? WHERE id=?";
            $values = array($filename,$first_key);
            $result = DBHelper::manual($all, $query, $values);
            return $result;
        }
        return false;
        
    }
    public static function gen_random_hash_image($database){
		$sql = "SELECT max(id) as id FROM tbl_accounts";
		$STH = $database->manual(1,$sql,array(),false);
		$t = time();
		return md5($t.$STH[0]['id']);
	}
}
?>