<?php
/**
 * Author: Alyssa Mari F. Albarda
 */
class Opportunity {
    private $db_table = 'Opportunities';
    public $ret_val = array();

    public function __construct($action, $values) {
        $this->ret_val = array();
        switch ($action) {
            case 'opportunities-fetch':
                $ret_val = $this->fetchAll($values);
                break;
        }
        $this->ret_val = $ret_val;
    }

    public function fetchAll($values) {
        $table = "{$this->db_table}";
        $list_cols = "OpportunityID AS id, Title AS title, Description AS description, ApplyLink AS apply_link";
        $records = DBHelper::fetch(true, $table, $list_cols, $values);
        return ['record' => $records]; 
    }
    
}