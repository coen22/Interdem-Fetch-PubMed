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
$author = strtolower(str_replace(", ", "+", $author));
$author = strtolower(str_replace(" ", "+", $author));

# define cache url
$cacheUrl = $_SERVER['DOCUMENT_ROOT']."/data/articles/$author.json";

# check if cache available
if (file_exists($cacheUrl)) {
    # retrieve from cache
    $jsonText = file_get_contents($cacheUrl);
} else {
    # split author name
    $authorSplit = explode('+', $author);

    # create search query
    $query = "dementia[mesh]+AND+$author" . "[AU]";

    #assemble the esearch URL
    $url = $base . "esearch.fcgi?db=$db&term=$query&usehistory=y";
    //    echo "$url<br/>";

    #post the esearch URL
    $ch = curl_init($url); // such as http://example.com/example.xml
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    $output = curl_exec($ch);
    curl_close($ch);
    //    echo "$output<br/>";

    try {
        # convert into xml structure
        $output = new SimpleXMLElement($output);

        #parse WebEnv and QueryKey
        $web = $output->{'WebEnv'};
        $key = $output->{'QueryKey'};

        ### include this code for ESearch-ESummary
        #assemble the esummary URL
        $url = $base . "esummary.fcgi?db=$db&query_key=$key&WebEnv=$web";

        #post the esummary URL
        $docsums = file_get_contents($url);
        //echo "$docsums";

        ### include this code for ESearch-EFetch
        #assemble the efetch URL
        $url = $base . "efetch.fcgi?db=$db&query_key=$key&WebEnv=$web";
        $url .= "&rettype=abstract&retmode=xml";

        #post the efetch URL
        $data = file_get_contents($url);
        $xml = simplexml_load_string($data);
        $jsonText = json_encode($xml);

        if ($jsonText != null) {
            $newFile = fopen($cacheUrl, "w");
            fwrite($newFile, $jsonText);
            fclose($newFile);
        }
    } catch (Exception $e) {
        // no articles founds
        $jsonText = null;
    }
}

echo $jsonText;
