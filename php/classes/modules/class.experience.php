<?php
/**
 * Author: Alyssa Mari F. Albarda
 */
class Experience {
    private $db_table = 'Posts';
    public $ret_val = array();

    public function __construct($action, $values) {
        $ret_val = array();
        switch($action) {
            case 'post-save':
                $ret_val = $this->save($values);
                break;
            case 'posts-fetch':
                $ret_val = $this->fetchAll($values);
                break;
            case 'comment-save':
                $ret_val = $this->saveComment($values);
                break;
            case 'comments-fetch':
                $ret_val = $this->fetchComments($values);
                break;
            case 'keywords-fetch':
                $ret_val = $this->fetchAllByKeyword($values);
                break;
        }
        $this->ret_val = $ret_val;
    }

    public function save($v) {
        $user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
        $table = $this->db_table;
        $cols = array();

        if ($user_id !== null) {
            $cols['UserID'] = $user_id;
        } else {
            return array('inserted' => false, 'error' => 'UserID not found in session');
        }

        if(Utils::has_key('category', $v)) $cols['Category'] = Utils::check_value($v['category']);
        if(Utils::has_key('content', $v)) $cols['Content'] = Utils::check_value($v['content']);
        if(Utils::has_key('title', $v)) $cols['Title'] = Utils::check_value($v['title']);
        if(Utils::has_key('media', $v)) $cols['Picture'] = Utils::check_value($v['media']);

        $cols['PostDate'] = date('Y-m-d');

        $result = DBHelper::save($table, $cols, '-1');

        if($result['inserted']) {
            return array('inserted' => true, 'id' => $result['id']);
        } else {
            return array('inserted' => false, 'error' => 'Record insert failed');
        }
    }

    public function fetchAll($v) {
        $table = 'Posts p JOIN Users u ON p.UserID = u.UserID';
        $list_cols = 'p.PostID, p.UserID, p.Category, p.Content, p.Title, p.PostDate, p.Picture, u.FirstName, u.LastName, u.ProfilePicture';
        $params = array();
        $params['order_by'] = 'p.PostID DESC';

        if (Utils::has_key('category', $v) && $v['category'] !== 'all') {
            $params['conditions']['Category'] = $v['category'];
        }

        if (Utils::has_key('order', $v) && $v['order'] == 'asc') {
            $params['order_by'] = 'p.PostDate ASC';
        }

        $posts = DBHelper::fetch(true, $table, $list_cols, $params);

        $formattedResult = array();
        $formattedResult['record'] = array();

        if (!empty($posts)) {
            foreach ($posts as $post) {
                $formattedResult['record'][] = $post;
            }
        }

        return $formattedResult;
    }

    public function saveComment($v) {
        $user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
        if ($user_id === null) {
            return array('inserted' => false, 'error' => 'User not logged in');
        }

        $cols = array();
        $cols['UserID'] = $user_id;
        if (Utils::has_key('post_id', $v)) $cols['PostID'] = Utils::check_value($v['post_id']);
        if (Utils::has_key('content', $v)) $cols['Comment'] = Utils::check_value($v['content']);
        $cols['CommentDate'] = date('Y-m-d H:i:s');

        $result = DBHelper::save('Comments', $cols, '-1');

        if ($result['inserted']) {
            return array('inserted' => true, 'id' => $result['id']);
        } else {
            return array('inserted' => false, 'error' => 'Failed to save comment');
        }
    }   

    public function fetchComments($v) { 
        $post_id = isset($v['post_id']) ? Utils::check_value($v['post_id']) : null;

        if ($post_id === null) {
            return array('error' => 'Post ID is required to fetch comments');
        }

        $table = 'Comments c JOIN Users u ON c.UserID = u.UserID';
        $comment_cols = 'c.CommentID, c.PostID, c.UserID, c.Comment AS CommentContent, c.CommentDate, u.FirstName AS CommentFirstName, u.LastName AS CommentLastName, u.ProfilePicture';

        $params = array();
        $params['conditions']['PostID'] = $post_id;
        $params['order_by'] = 'c.CommentDate ASC';

        $comments = DBHelper::fetch(true, $table, $comment_cols, $params);

        $formattedResult = array();
        $formattedResult['record'] = array();

        if (!empty($comments)) {
            foreach ($comments as $comment) {
                $formattedResult['record'][] = $comment;
            }
        }

        return $formattedResult;
    }

    public function fetchAllByKeyword($v) {
        if (!Utils::has_key('keyword', $v)) {
            return array('error' => 'Keyword is required');
        }
    
        $keyword = Utils::check_value($v['keyword']);
        if (empty($keyword)) {
            return array('error' => 'Invalid keyword provided');
        }
    
        $query = " SELECT p.PostID, p.UserID, p.Category, p.Content, p.Title, p.PostDate, p.Picture, u.FirstName, u.LastName 
            FROM Posts p 
            JOIN Users u 
            ON p.UserID = u.UserID 
            WHERE (p.Title LIKE :keyword_title OR p.Content LIKE :keyword_content OR u.FirstName LIKE :keyword_firstname OR u.LastName LIKE :keyword_lastname) 
            ORDER BY p.PostID DESC";

        $params = array(
            ':keyword_title' => "%$keyword%",
            ':keyword_content' => "%$keyword%",
            ':keyword_firstname' => "%$keyword%",
            ':keyword_lastname' => "%$keyword%"
        );

        $db = new IPDO();
    
        $posts = $db->manual($query, $params, false, true); 
    
        if ($posts === false) {
            return array('error' => 'Database fetch failed');
        }
    
        return array('record' => $posts);
    }
    
}
