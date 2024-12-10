<?php
/**
 * Author: Alyssa Mari F. Albarda
 */
class IPDO {
   private static $self;
   public static $db;
   private static $dsn;

   public function __construct(array $credentials=array()){
		if( !$credentials ){
			$credentials = array(
					'MSQL'	=> 'mysql',
					'HOST'	=> '127.0.0.1',
					'DATA'	=> 'alumnisce',
					'USER'	=> 'root',
					'PASS'	=> 'manager',
					'PORT'	=> '3306'
			);
		}

		if (!defined('MSQL')) define('MSQL', $credentials['MSQL']);
		if (!defined('HOST')) define('HOST', $credentials['HOST']);
		if (!defined('DATA')) define('DATA', $credentials['DATA']);
		if (!defined('USER')) define('USER', $credentials['USER']);
		if (!defined('PASS')) define('PASS', $credentials['PASS']);
		if (!defined('PORT')) define('PORT', $credentials['PORT']);
		static::$self = $this;
		return static::connect();
   }

   private static function connect(){
		if( !static::$db ){
			static::$dsn = MSQL .':dbname='. DATA .';host='. HOST .';port='. PORT;
			try {
				static::$db = new PDO(static::$dsn, USER, PASS, array(
						PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
				));
			} catch( PDOException $e ){
				die('FAILED: connection to dbase ... <br> ERROR: '. $e->getMessage());
			}
			static::$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
			return static::$db;
		} else {
			static::$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
			return static::$db;
		}
   }
		
	function manual($query, $values = array(), $onedim_array = false, $all = false) {
		$data = array();
		$st = self::$db->prepare($query);
		$result = self::$self->executeWithDataTypes($st, $values);
		$is_insert = (preg_match('#^INSERT#i', $query) === 1);
		$is_update = (preg_match('#^UPDATE#i', $query) === 1);
		$is_delete = (preg_match('#^DELETE#i', $query) === 1);
		if($is_insert) return self::$db->lastInsertId();
		if($is_update || $is_delete) return $st->rowCount();
		if($onedim_array) {
			if($all) return $st->fetchAll(PDO::FETCH_COLUMN, 0);
			else return $st->fetch(PDO::FETCH_COLUMN, 0);
		} else {
			if($all) return $st->fetchAll();
			else return $st->fetch();
		}
	}

	function executeWithDataTypes(PDOStatement $sth, array $values) {
		try {
			foreach($values as $key => $value) {
				$type = PDO::PARAM_STR;
				switch (true) {
					case is_numeric($value): $type = PDO::PARAM_INT; break;
					case is_null($value): $type = PDO::PARAM_NULL; break;
					case is_bool($value): $type = PDO::PARAM_BOOL; break;
					default: break;
				}
				if (is_numeric($key)) {
					++$key;
				}
				$sth->bindValue($key, $value, $type);
			}
			return $sth->execute();
		} catch (PDOException $e) {
			error_log("Database Error: " . $e->getMessage());
			return false;
		}
	}
	

   function fetchAllData(array $reqData=array()){
		$table 		= ( isset($reqData['table']) 		 && $reqData['table']		) 			? $reqData['table'] .' '				: ' ';
		$query 		= ( isset($reqData['query']) 		 && $reqData['query']		) 			? $reqData['query'] .' '				: 'SELECT ';
		$columns 	= ( isset($reqData['columns']) 	 && $reqData['columns']		) 			? $reqData['columns'] .' '				: '* ';
		$conditions = ( isset($reqData['conditions']) && count($reqData['conditions'])) 	? $reqData['conditions'] 				: array();
		$where 		= ( isset($reqData['where']) 		 && $reqData['where']		) 			? 'WHERE '.  $reqData['where'] .' '	: 'WHERE 1 ';
		$groupBy 	= ( isset($reqData['group_by']) 	 && $reqData['group_by']	) 			? 'GROUP BY '.  $reqData['group_by'] .' '	: ' ';
		$orderBy 	= ( isset($reqData['order_by']) 	 && $reqData['order_by']	) 			? 'ORDER BY '.  $reqData['order_by'] .' '	: ' ';
		$limit 		= ( isset($reqData['limit']) 		 && $reqData['limit']		) 			? 'LIMIT '.  $reqData['limit'] .' '	: ' ';
		$offset 		= ( isset($reqData['offset'])		 && $reqData['offset']		) 			? 'OFFSET '. $reqData['offset'].' '	: ' ';

		$data			= array();
		$operations = self::setConditions($conditions, $data);
		$q = $query . $columns .'FROM '. $table . $where . $operations . $groupBy . $orderBy . $limit . $offset;
		$st = self::$db->prepare($q);
		self::$self->executeWithDataTypes($st, $data);
		$rows = $st->fetchAll();
		return $rows;
   }

	public function fetchOne(array $reqData = array()) {
		$table     = (isset($reqData['table']) && $reqData['table']) ? $reqData['table'] . ' ' : ' ';
		$query     = (isset($reqData['query']) && $reqData['query']) ? $reqData['query'] . ' ' : 'SELECT ';
		$columns   = (isset($reqData['columns']) && $reqData['columns']) ? $reqData['columns'] . ' ' : '* ';
		$conditions = (isset($reqData['conditions']) && count($reqData['conditions'])) ? $reqData['conditions'] : array();
		$where     = (isset($reqData['where']) && $reqData['where']) ? 'WHERE ' . $reqData['where'] . ' ' : 'WHERE 1 ';
		$groupBy   = (isset($reqData['group_by']) && $reqData['group_by']) ? 'GROUP BY ' . $reqData['group_by'] . ' ' : ' ';
		$limit     = 'LIMIT 1 ';
		$offset    = (isset($reqData['offset']) && $reqData['offset']) ? 'OFFSET ' . $reqData['offset'] . ' ' : ' ';

		$data      = array();
		$operations = self::setConditions($conditions, $data);
		
		$q = $query . $columns . 'FROM ' . $table . $where . $operations . $groupBy . $limit . $offset;
		
		$st = self::$db->prepare($q);
		self::$self->executeWithDataTypes($st, $data);
		$rows = $st->fetchAll();

		error_log("Fetched Rows: " . print_r($rows, true));

		return $rows;
	}


   private static function setConditions($conditions, &$data){
		$index = 0;
		$operations = ' ';
		if( !$conditions ){ return $operations; }
		$count = count($conditions);
		for( $i=0;  $i<$count; $i++){
			$operand = isset($conditions[$i]['operand']) ? $conditions[$i]['operand'] : 'AND';
			$key = $conditions[$i]['column'];
			$operator = isset($conditions[$i]['cond']) ? $conditions[$i]['cond'] : ' ';
			$value = isset($conditions[$i]['value']) ? $conditions[$i]['value'] : ' ';
			if ($key[0] === ':') {
				$column = substr($key, 1);
				if( strpos($operations, $key) !== false ){
					$key .= strval($index);
					$index++;
				}
				$operations .= $operand .' '. $column . $operator . $key . ' ';
				$data[$key] = $value;
			} else {
				$column = $key;
				$operations .= $operand .' '. $column . $operator . '? ';
				$data[] = $value;
			}
		}
		return $operations;
   }

   private static function setColumns($query, $mappedValues, &$data){
		$columns = '';
		$columnList = '';
		$mappedKeys = '';
		foreach( $mappedValues as $key => $val ){
			if( $key[0] == ':' ){
				$column = substr($key, 1);
				$pairedKey = $key;
				$data[$pairedKey] = $val;
			} else {
				$column = $key;
				$pairedKey = '?';
				$data[] = $val;
			}
			if( $query == 'INSERT' ){
				$columnList .= $column .', ';
				$mappedKeys .= $pairedKey .', ';
			}
			elseif( $query == 'UPDATE' ){
				$columnList .= $column .'=' . $pairedKey .', ';
			}
		}
		if( $query == 'INSERT' ){
			$conjucation = 'VALUES ';
			$columns = '( '. substr($columnList, 0, -2) .' ) '
					. $conjucation .' '
					.'( '. substr($mappedKeys, 0, -2) .' ) ';
		}
		elseif( $query == 'UPDATE' ){
			$conjucation = 'SET ';
			$columns = $conjucation . substr($columnList, 0, -2) .' ';
		}
		return $columns;
   }

   function putData(array $reqData){
		$columns 	= ' ';
		$from 		= ' ';
		$where 		= ' ';
		$operations	= ' ';
		$limit 		= ' ';
		$data			= array();

		$query = ( isset($reqData['query']) && $reqData['query'] )	? $reqData['query'] 	 		: 'INSERT ';	// default PUT = INSERT
		$table = ( isset($reqData['table']) && $reqData['table'] ) 	? $reqData['table'] .' ' 	: null;			// add a space to the end
		$action = $query;
		// - Exit, if there is NO query set.
		if( !$table ){ return false; }
		if( $query == 'UPSERT' ){
			$rData = $reqData;
			$fields = $rData['columns'];
			$rData['query'] = 'SELECT';
			$rData['columns'] = 'id';
			$rData['limit'] = 1;
			$rows = $this->fetchAllData($rData);
			if( $rows ){
				$id = $rows[0]['id'];
				$rData['query'] = 'UPDATE';
				$rData['conditions'][] = array( 'column' => ':id', 'cond' => ' = ', 'value' => $id);
			} else {
				$rData['query'] = 'INSERT';
			}
			$rData['columns'] = $fields;
			return $this->putData($rData);
		}
		if( $query != 'DELETE' ){
			// - Exit, if none of the columns are set
			if( !isset($reqData['columns']) ){ return false; }
			$columnArr = is_object($reqData['columns']) ? \TOOLS\objectToArray($reqData['columns']) : $reqData['columns'];
			if( !$columnArr ){ return false; }
			$columns = self::setColumns($query, $reqData['columns'], $data);
		}
		// - The following parameters only apply to NON INSERT operations.
		if( $query != 'INSERT' ){
			$conditions = ( isset($reqData['conditions']) && count($reqData['conditions'])) 	? $reqData['conditions'] 				: array();
			$where 		= ( isset($reqData['where']) 		 && $reqData['where']		) 			? 'WHERE '.  $reqData['where'] .' '	: 'WHERE 1 ';
			$limit 		= ( isset($reqData['limit']) 		 && $reqData['limit']		) 			? 'LIMIT '.  $reqData['limit'] .' '	: ' ';

			$operations = self::setConditions($conditions, $data);
		}
		if( $query == 'INSERT' ){ $query = 'INSERT INTO '; }
		elseif( $query == 'UPDATE' ){ $query = 'UPDATE '; }
		elseif( $query == 'DELETE' ){
			$query = 'DELETE ';
			$from = 'FROM ';
		}

		$q = $query . $from . $table . $columns . $where . $operations . $limit;
		$st = self::$db->prepare($q);
		$this->executeWithDataTypes($st, $data);
		// - If INSERT, then return the Id for row inserted.
		if( $action == 'INSERT' ){ return self::$db->lastInsertId(); }
		// - For UPDATE and DELETE return the number of rows affected.
		else { return $st->rowCount(); }
	}

}

?>