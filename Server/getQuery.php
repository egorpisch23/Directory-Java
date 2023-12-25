<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$type = isset($_GET['type']) ? $_GET['type'] : null;
$title = isset($_GET['title']) ? trim(urldecode($_GET['title'])) : null;

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if ($type === 'contentChapters') {
            header('Content-Type: application/xml');
            $xml = simplexml_load_file('contentchapters.xml');
            $chapter = null;
            foreach ($xml->chapter as $chap) {
                $chapTitle = (string) $chap['title'];
                if (strcasecmp(trim($chapTitle), trim($title)) === 0) {
                    error_log("Chapter found: $chapTitle");
                    $chapter = $chap;
                    break;
                }
            }
            if ($chapter) {
                error_log("Chapter exists, echoing XML");
                echo $chapter->asXML();
            } else {
                error_log("Chapter not found, echoing error");
                echo "<error>Chapter not found</error>";
            } 
        } elseif ($type === 'fullXML') {
            header('Content-Type: application/xml');
            $xml = simplexml_load_file('contentchapters.xml');
            echo $xml->asXML();       
        } elseif ($type === 'mainChapters') {
            header('Content-Type: application/json');
            $data = file_get_contents('chapters.json');
            echo $data;
        } else {
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Invalid type']);
        }
        break;

    default:
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Unsupported method']);
        break;
}
?>