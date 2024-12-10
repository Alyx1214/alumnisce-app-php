<?php
/**
 * Author: Alyssa Mari F. Albarda
 */
class User {
    private $db_table = 'Users';
    public $ret_val = array();
    
    public function __construct($action, $values) {
        $ret_val = array();
        switch($action) {
            case 'login':
                $ret_val = $this->login($values);
                break;
            case 'logout':
                $ret_val = $this->logout($values);
                break;
            case 'user-fetch':
                $ret_val = $this->fetch($values);
                break;
            case 'user-save':
                $ret_val = $this->save($values);
                break;
			case 'user-remove':
                $ret_val = $this->remove($values);
                break;
            case 'get-all-alumni':
                $ret_val = $this->get_all_alumni($values);
                break;
            case 'get-users-by-keyword':
                $ret_val = $this->get_users_by_keyword($values);
                break;
			case 'user-details-save':
                $ret_val = $this->save_details($values);
                break;
            case 'user-check-login':
                $ret_val = $this->user_check_login($values);
                break;
        }
        $this->ret_val = $ret_val;
    }
    
    private function logout($v) {
		unset($_SESSION['user_id']);
		unset($this->user_id);
        return true;
    }

    private function user_check_login($v) {
        if(!isset($_SESSION['user_id'])) return array('logged_in' => false, 'error' => null);
        return array('logged_in' => $_SESSION['user_id'], 'error' => null);
    }
    
    private function login($v) {
        $all = false;
        $table = $this->db_table;
        $list_cols = '';  
        $params = array();
        $params['conditions'] = array();
        $params['conditions']['SLU_ID'] = $v['slu_id'];
        $password = mb_convert_encoding(trim($v['password']), 'windows-1252');  
        $user = DBHelper::fetch($all, $table, $list_cols, $params);
        $result = array('logged_in' => false, 'error' => 'Invalid SLU ID or password.');
        if ($user['fetched']) {
            $record = $user['record'];
            $hash = trim($record['Password']);  
            if (password_verify($password, $hash)) {
                $record = array(
                    'id' => $record['UserID'],
                    'name' => $record['FirstName'] . ' ' . $record['LastName'],
                    'role' => $record['Role'] 
                );
                $_SESSION['user_id'] = $record['id']; 
                $result = array('logged_in' => true, 'record' => $record);
            }            
        }
        return $result;
    }
                
    private function fetch($v) {  
        $user_data = array(); 
        $user_id = $_SESSION['user_id']; 
        $table = 'Users u'; 
        $list_cols = 'u.UserID, u.SLU_ID, u.FirstName, u.LastName, u.Email, u.Program, u.Batch, u.ProfilePicture, u.Description, u.EmploymentStatus, u.Role, u.DateJoined, u.Company, u.CurrentJob'; 
        $params = array('conditions' => array('UserID' => $user_id)); 
        $result = DBHelper::fetch(false, $table, $list_cols, $params); 
        error_log("Fetch Result: " . print_r($result, true));
        if (!$result['fetched']) { 
            throw new Exception('User not found'); 
        }  
            unset($result['record']['Password']); 
            
            $formattedResult = array(); 
            $formattedResult['record'] = $result['record']; 
            $formattedResult['record']['LinkedProfiles'] = array(); 
            $formattedResult['record']['Experiences'] = array(); 
            $formattedResult['record']['Skills'] = array(); 
            $formattedResult['record']['Posts'] = array();
                    
            $skills = DBHelper::fetch(true, 'Skills', 'SkillID, SkillName', array('conditions' => array('UserID' => $user_id)));
            $formattedResult['record']['Skills'] = $skills ? $skills : array();

            $experiences = DBHelper::fetch(true, 'Experience', '*', array('conditions' => array('UserID' => $user_id)));
            $formattedResult['record']['Experiences'] = $experiences ? $experiences : array();

            $linkedProfiles = DBHelper::fetch(true, 'LinkedProfiles', '*', array('conditions' => array('UserID' => $user_id)));
            $formattedResult['record']['LinkedProfiles'] = $linkedProfiles ? $linkedProfiles : array();

            $posts = DBHelper::fetch(true, 'Posts', '*', array('conditions' => array('UserID' => $user_id)));
            error_log(print_r($posts, true));
            if ($posts) {
                $formattedResult['record']['Posts'] = $posts;
                error_log(print_r($formattedResult['record']['Posts'], true));
            } else {
                $formattedResult['record']['Posts'] = array();
            }

            return $formattedResult;

    }
            
    private function save($v) {
        $all = false;
        $table = 'Users'; 
        $list_cols = '';
        $params = array();
        $params['conditions'] = array();

    if (isset($v['first_name'])) {
        $first_name = trim($v['first_name']);
        if (empty($first_name) || !preg_match('/^[a-zA-Z\s\-]+$/', $first_name)) {
            return array('inserted' => false, 'error' => 'Invalid first name.');
        }
    } else {
        return array('inserted' => false, 'error' => 'First name is required.');
    }

    if (isset($v['last_name'])) {
        $last_name = trim($v['last_name']);
        if (empty($last_name) || !preg_match('/^[a-zA-Z\s\-]+$/', $last_name)) {
            return array('inserted' => false, 'error' => 'Invalid last name.');
        }
    } else {
        return array('inserted' => false, 'error' => 'Last name is required.');
    }
    
        if (isset($v['emailadd'])) {
            $email = trim($v['emailadd']);
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return array('inserted' => false, 'error' => 'Invalid email address.');
            }
            $params['conditions']['Email'] = $email;
        }

        if (isset($v['slu_id'])) {
            $slu_id = trim($v['slu_id']);
            if (!ctype_digit($slu_id) || strlen($slu_id) !== 7) {
                return array('inserted' => false, 'error' => 'Invalid SLU ID.');
            }
        }

        if (isset($v['password'])) {
            $password = trim($v['password']);
            if (strlen($password) < 8 || 
                !preg_match('/[A-Z]/', $password) || 
                !preg_match('/[a-z]/', $password) || 
                !preg_match('/[0-9]/', $password) || 
                !preg_match('/[\W]/', $password)) {
                return array('inserted' => false, 'error' => 'Invalid password. It must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.');
            }
        } else {
            return array('inserted' => false, 'error' => 'Password is required.');
        }


        $user = DBHelper::fetch($all, $table, $list_cols, $params);
        
        if (!$user['fetched']) {
            $cols = array();
            if (Utils::has_key('first_name', $v)) $cols['FirstName'] = Utils::check_value($v['first_name']);
            if (Utils::has_key('last_name', $v)) $cols['LastName'] = Utils::check_value($v['last_name']);
            if (Utils::has_key('slu_id', $v)) $cols['SLU_ID'] = Utils::check_value($v['slu_id']);
            if (Utils::has_key('emailadd', $v)) $cols['Email'] = Utils::check_value($v['emailadd']);
            if (Utils::has_key('password', $v)) $cols['Password'] = password_hash($v['password'], PASSWORD_DEFAULT);
            if (Utils::has_key('role', $v)) $cols['Role'] = Utils::check_value($v['role'], 'Alumni');
    
            $result = DBHelper::save($table, $cols, '-1');
            if ($result['inserted']) {
                return array('inserted' => true, 'id' => $result['id']);
            } else {
                return array('inserted' => false, 'error' => 'Record insert failed.');
            }
        } else {
            return array('inserted' => false, 'error' => 'Email address already taken.');
        }
    }
    
    private function save_details($values) {
        if (!isset($_SESSION['user_id'])) {
            return array('updated' => false, 'error' => 'User not logged in.');
        }
    
        $user_id = $_SESSION['user_id'];
    
        $cols = array();
        $params = array();
    
        if (isset($values['first_name']) && !empty($values['first_name'])) {
            $cols[] = "FirstName = ?";
            $params[] = trim($values['first_name']);
        }
        if (isset($values['last_name']) && !empty($values['last_name'])) {
            $cols[] = "LastName = ?";
            $params[] = trim($values['last_name']);
        }
        if (isset($values['email']) && !empty($values['email'])) {
            $cols[] = "Email = ?";
            $params[] = trim($values['email']);
        }
        if (isset($values['bio']) && !empty($values['bio'])) {
            $cols[] = "Description = ?";
            $params[] = trim($values['bio']);
        }

        if (isset($values['program']) && !empty($values['program'])) {
            $cols[] = "Program = ?";
            $params[] = trim($values['program']);
        }
    
        if (isset($values['profile_picture']) && !empty($values['profile_picture'])) {
            $base64Data = $values['profile_picture'];
            error_log("Received Profile Picture: " . substr($base64Data, 0, 100) . "..."); // Log first 100 chars
            $cols[] = "ProfilePicture = ?";
            $params[] = $base64Data;
        }
    
        if (empty($cols)) {
            return array('updated' => false, 'error' => 'No fields to update.');
        }
    
        $query = "UPDATE Users SET " . implode(", ", $cols) . " WHERE UserID = ?";
        error_log("Constructed Query: " . $query);
    
        $params[] = $user_id;
        error_log("Query Parameters: " . print_r($params, true));
    
        try {
            $result = DBHelper::manual(false, $query, $params);
            error_log("DBHelper::manual Result: " . print_r($result, true));
        } catch (Exception $e) {
            error_log("Error during DB operation: " . $e->getMessage());
            return array('updated' => false, 'error' => 'Database error: ' . $e->getMessage());
        }
    
        if ($result === false) {
            return array('updated' => false, 'error' => 'Unable to update user details.');
        }
    
        if (isset($values['skills']) && !empty($values['skills'])) {
            $this->save_skills($user_id, $values['skills']);
        }
        if (isset($values['experiences']) && !empty($values['experiences'])) {
            $this->save_experiences($user_id, $values['experiences']);
        }
        if (isset($values['linked_accounts']) && !empty($values['linked_accounts'])) {
            $this->save_linked_accounts($user_id, $values['linked_accounts']);
        }
    
        return array('updated' => true);
    }
       
            
    private function save_skills($user_id, $skills) {
        $existingSkills = DBHelper::fetch(true, 'Skills', '*', array('conditions' => array('UserID' => $user_id)));
        $existingSkillNames = array();
        foreach ($existingSkills as $skill) {
            $existingSkillNames[] = $skill['SkillName'];
        }

        $skillsToAdd = array_diff($skills, $existingSkillNames);
        $skillsToRemove = array_diff($existingSkillNames, $skills);
    
        foreach ($skillsToAdd as $skillName) {
            DBHelper::save('Skills', array('UserID' => $user_id, 'SkillName' => $skillName), '-1');
        }
    
        foreach ($skillsToRemove as $skillName) {
            DBHelper::manual(true, "DELETE FROM Skills WHERE UserID = ? AND SkillName = ?", array($user_id, $skillName));
        }
    }
    
    
    
    private function save_experiences($user_id, $experiences) {
        $existingExperiences = DBHelper::fetch(true, 'Experience', '*', array('conditions' => array('UserID' => $user_id)));
    
        $existingExperienceIDs = array();
        foreach ($existingExperiences as $exp) {
            $existingExperienceIDs[] = $exp['ExperienceID'];
        }
    
        $receivedExperienceIDs = array();
        foreach ($experiences as $experience) {
            $expID = isset($experience['experience_id']) ? $experience['experience_id'] : null;
            $receivedExperienceIDs[] = $expID;
    
            if ($expID && in_array($expID, $existingExperienceIDs)) {
                $cols = array(
                    'Company' => $experience['company'],
                    'Duration' => $experience['duration'],
                    'Location' => $experience['location'],
                    'Role' => $experience['role'],
                    'Description' => $experience['description']
                );
                DBHelper::save('Experience', $cols, $expID);
            } else {
                DBHelper::save('Experience', array(
                    'UserID' => $user_id,
                    'Company' => $experience['company'],
                    'Duration' => $experience['duration'],
                    'Location' => $experience['location'],
                    'Role' => $experience['role'],
                    'Description' => $experience['description']
                ), '-1');
            }
        }

        $experiencesToDelete = array_diff($existingExperienceIDs, $receivedExperienceIDs);
        foreach ($experiencesToDelete as $expID) {
            DBHelper::manual(true, "DELETE FROM Experience WHERE ExperienceID = ?", array($expID));
        }
    }
    
    
    
    private function save_linked_accounts($user_id, $linked_accounts) {
        $existingAccounts = DBHelper::fetch(true, 'LinkedProfiles', '*', array('conditions' => array('UserID' => $user_id)));
    
        $existingAccountIDs = array();
        foreach ($existingAccounts as $account) {
            $existingAccountIDs[] = $account['ProfileID'];
        }
    
        $receivedAccountIDs = array();
        foreach ($linked_accounts as $account) {
            $accountID = isset($account['profile_id']) ? $account['profile_id'] : null;
            $receivedAccountIDs[] = $accountID;
    
            if ($accountID && in_array($accountID, $existingAccountIDs)) {
                $cols = array(
                    'ProfileType' => $account['profile_type'],
                    'ProfileURL' => $account['profile_url']
                );
                DBHelper::save('LinkedProfiles', $cols, $accountID);
            } else {
                DBHelper::save('LinkedProfiles', array(
                    'UserID' => $user_id,
                    'ProfileType' => $account['profile_type'],
                    'ProfileURL' => $account['profile_url']
                ), '-1');
            }
        }
    
        $accountsToDelete = array_diff($existingAccountIDs, $receivedAccountIDs);
        foreach ($accountsToDelete as $accountID) {
            DBHelper::manual(true, "DELETE FROM LinkedProfiles WHERE ProfileID = ?", array($accountID));
        }
    }
    
    private function get_all_alumni($v) {
        $all = true;
        $table = 'Users';
        $list_cols = 'FirstName, LastName, Program, ProfilePicture';
        $params = array();

        $conditions = array();
    
        if (Utils::has_key('program', $v) && strtolower($v['program']) !== 'all') {
            $conditions['Program LIKE'] = '%' . $v['program'] . '%';
        }

        if (!empty($conditions)) {
            $params['conditions'] = $conditions;
        }
        
        if (Utils::has_key('order', $v)) {
            $order = strtolower($v['order']) === 'asc' ? 'ASC' : 'DESC';
            $params['order_by'] = "FirstName $order, LastName $order";
        }
    
        $result = DBHelper::fetch($all, $table, $list_cols, $params);
        return $result;
    }

    public function get_users_by_keyword($v) {
        if (!Utils::has_key('keyword', $v)) {
            return array('error' => 'Keyword is required');
        }
    
        $keyword = Utils::check_value($v['keyword']);
        if (empty($keyword)) {
            return array('error' => 'Invalid keyword provided');
        }
    
        $query = " SELECT FirstName, LastName, ProfilePicture, Program
            FROM Users
            WHERE (FirstName LIKE :keyword_firstname OR LastName LIKE :keyword_lastname OR  Program LIKE :keyword_program) 
            ORDER BY UserID DESC";

        $params = array(
            ':keyword_firstname' => "%$keyword%",
            ':keyword_lastname' => "%$keyword%",
            ':keyword_program' => "%$keyword%",
        );

        $db = new IPDO();
    
        $posts = $db->manual($query, $params, false, true); 
    
        if ($posts === false) {
            return array('error' => 'Database fetch failed');
        }
    
        return array('record' => $posts);
    }
    
    
	private function remove($v) {
     if(!isset($_SESSION['user_id']))
            return array("error" => "Not authorized");
		$all = true;
        $query="DELETE FROM tbl_accounts WHERE id=?";
		$values = array($_SESSION['user_id']);
        $result = DBHelper::manual($all, $query, $values);
        return $result;
    }
}