<?php
header ("Content-Type:text/json");

error_reporting(E_ERROR | E_PARSE);

# define database search in PubMed
$db = 'pubmed';

# define base url
$base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';

# add authors to query
if(isset($_GET['author'])) {
    $author = $_GET['author'];
} else {
    # for testing
    $author = "Aguirre, Elisa";
}

# change for query
$author = str_replace(", ", "+", $author);
$author = str_replace(" ", "+", $author);
$author = strtolower($author);

# define cache url
$cacheUrl = $_SERVER['DOCUMENT_ROOT']."/data/articles/$author.json";
$xmlCacheUrl = $_SERVER['DOCUMENT_ROOT']."/data/articles/$author.xml";
$commandUrl = $_SERVER['DOCUMENT_ROOT']."/data/articles/$author" . "_command.json";

# check if cache available
if (file_exists($cacheUrl)) {
    # retrieve from cache
    $jsonText = file_get_contents($cacheUrl);
} else {
    # create search query
    $query = "dementia[mesh]+AND+$author" . "[AU]";

    #assemble the esearch URL
    $queryUrl = $base . "esearch.fcgi?db=$db&term=$query&usehistory=y";
    //    echo "$url<br/>";

    #post the esearch URL
    $ch = curl_init($queryUrl); // such as http://example.com/example.xml
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    $output = curl_exec($ch);
    curl_close($ch);

    try {
        # convert into xml structure
        $output = new SimpleXMLElement($output);

        #parse WebEnv and QueryKey
        $web = $output->{'WebEnv'};
        $key = $output->{'QueryKey'};

        ### include this code for ESearch-EFetch
        #assemble the efetch URL
        $url = $base . "efetch.fcgi?db=$db&query_key=$key&WebEnv=$web";
        $url .= "&rettype=abstract&retmode=xml";

        # post the eFetch URL
        $ch = curl_init($url); // such as http://example.com/example.xml
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        $data = curl_exec($ch);
        curl_close($ch);

        # convert into json
        $xml = simplexml_load_string($data);
        $jsonText = json_encode($xml);

        if ($jsonText != null && !strpos($data, 'error')) {
            $newFile = fopen($cacheUrl, "w");
            fwrite($newFile, $jsonText);
            fclose($newFile);
        } else {
            $newFile = fopen($xmlCacheUrl, "w");
            fwrite($newFile, $data);
            fclose($newFile);

            $newFile = fopen($commandUrl, "w");
            fwrite($newFile, '["' . $queryUrl . '", "' . $url . '"]');
            fclose($newFile);
        }
    } catch (Exception $e) {
        // no articles founds
        $jsonText = null;
    }
}

echo $jsonText;
