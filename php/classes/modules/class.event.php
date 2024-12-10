<?php
/**
 * Author: Alyssa Mari F. Albarda
 */
class Event {
    private $db_table = 'Events';
    private $user_interests_table = 'IsInterested';
    public $ret_val = array();

    public function __construct($action, $values) {

        $this->ret_val = array();
        switch ($action) {
            case 'event-fetch':
                $ret_val = $this->fetchAll($values);
                break;
            case 'interested-save':
                $ret_val = $this->save_interested($values);
                break;
            case 'get-current-user':
                $ret_val = $this->getCurrentUser($values);
                break;
        }

        $this->ret_val = $ret_val;
    }

    public function fetchAll($values) {
        $user_id = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : 0;

        $event_alias = 'e';
        $ui_alias = 'ui';
        $cui_alias = 'cui';

        $table = "{$this->db_table} AS {$event_alias}";
        $table .= " LEFT JOIN {$this->user_interests_table} AS {$ui_alias} ON {$event_alias}.EventID = {$ui_alias}.EventID";

        if ($user_id > 0) {
            $table .= " LEFT JOIN {$this->user_interests_table} AS {$cui_alias} ON {$event_alias}.EventID = {$cui_alias}.EventID AND {$cui_alias}.UserID = {$user_id}";
        }

        $list_cols = "
            {$event_alias}.EventID,
            {$event_alias}.Title,
            {$event_alias}.EventDate,
            {$event_alias}.Location,
            {$event_alias}.Description,
            COUNT(DISTINCT {$ui_alias}.UserID) AS interested_count,
            " . ($user_id > 0 ? "CASE WHEN {$cui_alias}.UserID IS NULL THEN FALSE ELSE TRUE END AS is_interested" : "FALSE AS is_interested") . "
        ";

        $params = array();
        $params['order_by'] = "{$event_alias}.EventDate ASC"; 
        $params['group_by'] = "{$event_alias}.EventID";

        $events = DBHelper::fetch(true, $table, $list_cols, $params);

        if (is_array($events) && count($events) > 0) {
            $formattedResult = array();
            $formattedResult['record'] = array();

            foreach ($events as $event) {
                $event['interested_count'] = intval($event['interested_count']);
                $event['is_interested'] = boolval($event['is_interested']);
                $formattedResult['record'][] = $event;
            }

            return $formattedResult;
        } else {
            return array('record' => array());
        }
    }

    public function save_interested($values) {
        if (!isset($values['EventID'])) {
            error_log("save_interested: EventID is missing.");
            echo json_encode(['saved' => false, 'error' => 'Invalid input. EventID is missing.']);
            exit;
        }
    
        $event_id = intval($values['EventID']);
    
        $user_id = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : 0;
    
        if ($user_id <= 0) {
            error_log("save_interested: User not logged in.");
            echo json_encode(['saved' => false, 'error' => 'User not logged in.']);
            exit;
        }

        $params = [
            'conditions' => [
                'UserID' => $user_id,
                'EventID' => $event_id
            ]
        ];
    
        $existing = DBHelper::fetch(false, $this->user_interests_table, '*', $params);
    
        if (isset($existing['fetched']) && $existing['fetched']) {
            error_log("save_interested: User already marked as interested.");
            echo json_encode(['saved' => false, 'error' => 'Already marked as interested.']);
            exit;
        }
    
        $cols = [
            'UserID' => $user_id,
            'EventID' => $event_id,
            'IsInterested' => 1
        ];
    
        $result = DBHelper::save($this->user_interests_table, $cols, '-1');
    
        $insertCheck = DBHelper::fetch(false, $this->user_interests_table, '*', $params);
    
        if (isset($insertCheck['fetched']) && $insertCheck['fetched']) {
            echo json_encode(['saved' => true]);
            exit;
        } else {
            error_log("save_interested: Failed to save interest.");
            echo json_encode(['saved' => false, 'error' => 'Record insert failed.']);
            exit;
        }
    }
    
    
    public function getCurrentUser() {
        $currentUserId = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : 0;
        return array('user_id' => $currentUserId);
    }
}

