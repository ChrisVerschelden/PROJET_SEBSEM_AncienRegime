const anneeMin = 1660;
const anneeMax = 1800;

//group list
var groups = new vis.DataSet([
    { id: 0, content: 'Evenements', value: 1 },
    { id: 1, content: '[|||||||||||]', value: 2 },
]);

//item list
var items = new vis.DataSet();

var container = document.getElementById('visualization');
var options = {
    groupOrder: function(a, b) {
        return b.value - a.value;
    },
    editable: false,
    stack: false,
    min: new Date(anneeMin, 1, 1),
    max: new Date(anneeMax, 1, 1),
    dataAttributes: ['id']
};

var timeline = new vis.Timeline(container);
timeline.setOptions(options);
timeline.setGroups(groups);
timeline.setItems(items);
timeline.fit()

timeline.on("doubleClick", function(properties) {
    var eventProps = timeline.getEventProperties(properties.event);

    if (eventProps.what === "custom-time") {
        timeline.removeCustomTime(eventProps.customTime);
    } else {
        var id = new Date().getTime();
        timeline.addCustomTime(eventProps.time, id);
        timeline.setCustomTimeMarker("Modifier votre texte", id, true);
    }
})



function reset_dates() {
    tabVal2 = new Array;
    for (var val = anneeMin; val <= anneeMax; val = val + 10) {
        tabVal2.push(val);
    }
    slider2.noUiSlider.updateOptions({
        range: {
            'min': anneeMin,
            'max': anneeMax
        },
        pips: {
            mode: 'values',
            values: tabVal2,
            density: 2,
        }
    });
    slider.noUiSlider.updateOptions({ start: [anneeMin, anneeMax] });
    slider2.noUiSlider.updateOptions({ start: [anneeMin, anneeMax] });
    options['min'] = new Date(anneeMin, 1, 1);
    options['max'] = new Date(anneeMax, 1, 1);
    items.remove('background_item');
    timeline.setOptions(options);
    timeline.fit();
}

var slider = document.getElementById('slider');
var sliderval = document.getElementById('slidervalue');

var tabVal = new Array();
var tabVal2 = new Array();

for (var val = anneeMin; val <= anneeMax; val = val + 10) {
    tabVal.push(val);
    tabVal2.push(val);
}


// Configuration for the Timeline
var options = { stack: false, min: anneeMin + '-01-01', max: anneeMax + '-01-01' };

noUiSlider.create(slider, {
    start: [anneeMin, anneeMax],
    connect: true,
    tooltips: true,
    step: 1,
    range: {
        'min': anneeMin,
        'max': anneeMax
    },
    format: {
        to: function(value) {
            return value;
        },
        from: function(value) {
            return value.replace();
        }
    },
    pips: {
        mode: 'values',
        values: tabVal,
        density: 2,
    }
});

slider.noUiSlider.on('slide', function() {
    var min = slider.noUiSlider.get()[0];
    var max = slider.noUiSlider.get()[1];
    tabVal2 = new Array;
    for (var val = min; val <= max; val = val + 10) {
        tabVal2.push(val);
    }
    slider2.noUiSlider.updateOptions({
        range: {
            'min': min,
            'max': max
        },
        pips: {
            mode: 'values',
            values: tabVal2,
            density: 2,
        }
    });
    options['min'] = new Date(min, 1, 1);
    options['max'] = new Date(max, 1, 1);
    timeline.setOptions(options);
    timeline.fit();
})

//slider highLight
var slider2 = document.getElementById("slider2");

noUiSlider.create(slider2, {
    start: [anneeMin, anneeMax],
    connect: true,
    tooltips: true,
    step: 1,
    range: {
        'min': anneeMin,
        'max': anneeMax
    },
    format: {
        to: function(value) {
            return value;
        },
        from: function(value) {
            return value.replace();
        }
    },
    pips: {
        mode: 'values',
        values: tabVal2,
        density: 2,
    }
});

slider2.noUiSlider.on('slide', function() {
    items.update({ id: 'background_item', content: "", start: slider2.noUiSlider.get()[0] + "-01-01", end: slider2.noUiSlider.get()[1] + "-01-01", type: "background", style: "background-color: orange" });
    console.log(items.get('background_item'))
    console.log(items.get(1))
});

(async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const url_param_nom = urlParams.get('nom');
    const url_param_niveau = urlParams.get('niveau');

    let query="PREFIX : <http://www.semanticweb.org/lucas/ontologies/2021/11/HHT_Ontology#>PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX time: <http://www.w3.org/2006/time#> select DISTINCT ?x ?groupe ?nom ?debut ?fin ?upunit where {?x a :Area .?x :isMemberOf ?groupe . ?x :referencePeriod ?date . ?x rdfs:label ?nom .?x rdfs:label \""+url_param_nom+"\". ?groupe rdfs:label \""+ url_param_niveau +"\". ?niveau a :LevelVersion . ?date time:hasBeginning ?debut . ?date time:hasEnd ?fin .OPTIONAL { ?x :hasUpperUnit ?upunit } } "
    let url = 'http://localhost:7200/repositories/test?query=' + encodeURIComponent(query) + '&output=json';

    

    $.ajax({
        url: url,
        dataType: "json",
        success: function (data) {
        $('#results').show();
        $('#raw_output').text(JSON.stringify(data, null, 3));
        let data_array = data.results.bindings;
        for (var i = 0; i < data_array.length; i++) {
            console.log(data_array[i].debut.value.split('#')[1]);
            console.log(data_array[i])
            items.add({ id: i, group: 0, content: data_array[i].nom.value, start: new Date(data_array[i].debut.value.split('#')[1] + "-01-01"), end: new Date(data_array[i].fin.value.split('#')[1] + "-01-01"), className: "not-selected" });
        }
        
        if (urlParams.has('id')) {
            var item_selected = items.get(parseInt(urlParams.get('id')));
            items.update({ id: item_selected['id'], group: item_selected["group"], content: item_selected["content"], className: 'green' });
            document.getElementById('item_id').innerHTML = item_selected.id;
            document.getElementById('item_content').innerHTML = item_selected.content;
            document.getElementById('item_date').innerHTML = item_selected.start.getFullYear() + " / " + item_selected.end.getFullYear();
            timeline.fit(parseInt(urlParams.get('id')));
        }
    
        timeline.setItems(items);
        timeline.redraw();
        timeline.fit();
    
    
        $(document).ready(function() {
            $('.vis-item').on('click', function() {
                var e = $(this);
                var id = e.attr('data-id')
                var item = items.get(parseInt(id, 10))
                items.forEach((item) => {
                    if (item.id != id) {
                        items.update({ id: item["id"], group: item["group"], content: item["content"], className: 'not-selected' });
                    } else {
                        var item_selected = item;
                        items.update({ id: item_selected['id'], group: item["group"], content: item["content"], className: 'green' });
                    }
                })
                var url_propre = window.location.search.split('?')[0];
                window.open(url_propre + '?id=' + id + "&id_frise=" + id_frise, '_blank').focus();
            });
        });
        
        },
        error: function(e) {console.log("Query error");}
    });


    

})();