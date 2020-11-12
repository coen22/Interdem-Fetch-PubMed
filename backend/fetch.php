<?php
header ("Content-Type:text/json");

error_reporting(E_ERROR | E_PARSE);

# define database search in PubMed
$db = 'pubmed';

# define base url
$base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';

# load authors
$url = "../data/names.json";
$authors = json_decode(file_get_contents($url));

# init json
$json = null;

# add authors to query
foreach ($authors as $author) {
    $author = str_replace(", ", "+", $author);

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

        if ($json == null)
            $json = json_decode($jsonText, TRUE);
        else
            array_push($json['PubmedArticle'], json_decode($jsonText, TRUE)['PubmedArticle']);
    } catch (Exception $e) {
        // no articles founds
    }
}

echo "json_encode($json)";
