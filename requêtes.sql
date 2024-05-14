// all headers

PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX : <http://dbpedia.org/resource/>
PREFIX dbpedia2: <http://dbpedia.org/property/>
PREFIX dbpedia: <http://dbpedia.org/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX ps: <http://www.wikidata.org/prop/statement/>
PREFIX pq: <http://www.wikidata.org/prop/qualifier/>

    //endpoints
PREFIX endwikidata: <https://query.wikidata.org/sparql>
PREFIX endDBpedia: <http://dbpedia.org/sparql>
PREFIX endDBpediaFR: <http://fr.dbpedia.org/sparql>

//REQUETES 

//tous les labels sur dbpedia
SELECT ?object ?label
WHERE
{
	SERVICE enddbpedia: {
		?object 
			rdfs:label "Ancien Régime"@en;
			rdfs:label ?label.
	}
}

//info en français sur wikidata
SELECT ?label ?propriete ?range
WHERE
{
	SERVICE endwikidata: {
		?object 
			rdfs:label "Ancien Régime"@en;
			rdfs:label ?label.
    
    	
    	?object ?propriete ?range
    
    	FILTER (lang(?range) = 'fr')
    	FILTER (lang(?label) = 'fr')
    	FILTER (?range != ?label) 
	}
}


//propriete
SELECT distinct ?what
WHERE
{
	SERVICE endDBpediaFR: {
		?object 
			rdfs:label "Ancien Régime"@en.
    
    	?object ?what ?thing1.
    	?thing2 ?what ?object.
	}
}


//avoir des depiction (images)

SELECT distinct ?what
WHERE
{
	SERVICE endDBpediaFR: {
		?object 
			rdfs:label "Ancien Régime"@en.
    
    	?object foaf:depiction ?what
	}
}


SELECT ?event
WHERE
{
	SERVICE endDBpediaFR: {
		?object 
			rdfs:label "Ancien Régime"@en.
    	?object dbo:country ?country.
    	?event dbo:place ?country
	}
}


SELECT ?event
WHERE
{
	SERVICE endDBpediaFR: {
		?object 
			rdfs:label "Ancien Régime"@en.
    	?object dbo:country ?country.
    	?event dboFR:lieuDeSignature ?country
	}
}


	
<http://dbpedia.org/ontology/wikiPageWikiLink>
<http://dbpedia.org/ontology/country>