<?php
header ("Content-Type:text/json");

error_reporting(E_ERROR | E_PARSE);

# define cache url
$path = $_SERVER['DOCUMENT_ROOT']."/data/articles/*";
$files = glob($path); // get all file names
foreach($files as $file){ // iterate files
  if(is_file($file)) {
    unlink($file); // delete file
  }
}

echo 'Successful!';
