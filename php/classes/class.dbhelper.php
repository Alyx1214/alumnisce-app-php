<?php
/**
 * Author: Alyssa Mari F. Albarda
 */
require_once('../config.php');
require_once('db.class.php');
class DBHelper {
    public static function construct_condition($column, $value) {
        $arr = explode(' ', $column);
        $cond = ' = ';
        if (count($arr) > 1) $cond = ' ' . $arr[1] . ' ';
    
        $condition = array(
            'column' => ':' . $arr[0],
            'cond' => $cond,
            'value' => $value
        );
        return $condition;
    }

    private static function sanitize_columns($cols) {
        foreach ($cols as $key => $value) {
            if (is_string($value)) {
                $cols[$key] = strip_tags($value);
            } elseif (is_null($value)) {
                $cols[$key] = '';
            } else {
                $cols[$key] = strip_tags((string)$value);
            }
        }
        return $cols;
    }
    
    
    
    public static function fetch_manual($all, $query, $values, $one_dim_arr = false) {
        $db = new IPDO();
        $result = $db->manual($all, $query, $values, $one_dim_arr);
        if($result) {
            if($all) return $result;
            else return array('fetched' => true, 'record' => $result);
        } else {
            if($all) return array();
            else return array('fetched' => false, 'error' => 'Record not found.');
        }
    }
    
    public static function fetch($all, $table, $list_cols, $params) {
        $db = new IPDO();
        $fetch_data = array();
        $fetch_data['table'] = $table;
        $fetch_data['query'] = 'SELECT';
        $fetch_data_conditions = array();
    
        $conditions = array();
        if (Utils::has_key('conditions', $params)) {
            $conditions = $params['conditions'];
        }
        foreach ($conditions as $k => $v) {
            $fetch_data_conditions[] = self::construct_condition($k, $v);
        }
        
        $fetch_data['conditions'] = $fetch_data_conditions;
    
        if (Utils::has_key('group_by', $params)) {
            $fetch_data['group_by'] = $params['group_by'];
        }
        if (Utils::has_key('order_by', $params)) {
            $fetch_data['order_by'] = $params['order_by'];
        }
    
        if ($all) { // fetch all
            $fetch_data['columns'] = $list_cols;
    
            $records = $db->fetchAllData($fetch_data);
            if ($records) return $records;
            return array();
        }
    
        // fetch one
        $record = $db->fetchOne($fetch_data);
        if ($record) {
            return array('fetched' => true, 'record' => $record[0]);
        }
    
        return array('fetched' => false, 'error' => 'Record not found.');
    }
    
    
    public static function save($table, $cols, $id) {
        $cols = self::sanitize_columns($cols);
        $db = new IPDO();
        $save_data = array();
        $save_data['table'] 	= $table;
        $save_data['query'] 	= 'INSERT';
        $save_data['columns']	= $cols;
        
        if(ctype_digit((string)$id)) { // update
            $save_data['query'] = 'UPDATE';
            
            $fetch_data = array();
            $fetch_data['table'] = $table;
            $fetch_data['query'] = 'SELECT';
            $fetch_data_conditions = array();
            $fetch_data_conditions[] = self::construct_condition('id', $id);
            $fetch_data['conditions']= $fetch_data_conditions;
            
            $record = $db->fetchOne($fetch_data);
            if($record) $save_data['conditions']= $fetch_data_conditions;
            else return array('updated' => false, 'error' => 'Record not found.');
        }
        
        $result = $db->putData($save_data);
        if($save_data['query'] == 'INSERT') {
            if($result) 
                return array('inserted' => true, 'id' => $result);
            
            return array('inserted' => false, 'error' => 'Record insert failed.');
        } else {
            if($result) 
                return array('updated' => true, 'id' => $id);

            return array('updated' => false, 'error' => 'No changes made.', 'id' => $id);
        }
    }
    
    public static function put_data($table, $query, $cols, $conditions = array()) {
        $cols = self::sanitize_columns($cols);
        $db = new IPDO();
        $put_data = array();
        $put_data['table'] = $table;
        $put_data['query'] = $query;
        $put_data['columns']	= $cols;
        $put_data['conditions'] = $conditions;
        return $db->putData($put_data);
    }
    
    public static function manual($all, $query, $values, $one_dim_arr = false) {
        $db = new IPDO();
        return $db->manual($query, $values, $one_dim_arr, $all);
    }    
}