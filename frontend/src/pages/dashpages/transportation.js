import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
//import moment from 'moment';
import 'chartjs-adapter-moment';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale);


export default function Transportation() {
    return (
        <>
          <h1>Transportation Trend</h1>
          <TransportationQuery /> 
        </>
    );
}

function TransportationQuery() {
    const base_url_str = "http://localhost:8080/queries/transportation/traffic";

    // REACT States
    const [data, setData] = useState({ tuples: [] });
    const [sqlstr, setSqlstr] = useState(base_url_str);
    const [showsqlcommand, setShowsqlcommand] = useState("");
    const [types, setTypes] = useState([]);
    const [cities, setCities] = useState([]);
    const [colSelect, setColSelect] = useState("AVGTRAFFICJAMDURATIONSEC");

    // Used to dynmically update the screen when the React state sqlstr is changed
    useEffect(() => {
        // Get the data from the backend
        fetch(sqlstr)
            .then(res => res.json())
            .then(json => setData({ tuples: json }))
            .catch(err => err);
        
        // Used to append the showquerystr regardless if there are already
        // GET params or not.
        var http_join_char = (sqlstr.includes('?') ? '&' : '?');
        
        // Get the query string and save it to a React state
        fetch(sqlstr + http_join_char + "showquerystr=1")
            //.then(res => setShowsqlcommand(res.body))
            .then(res => res.json())
            .then(json => setShowsqlcommand(json["query_str"]))
            .catch(err => err);

        return () => {}
    }, [sqlstr]);

    // Get the different real estate types from the db
    useEffect(() => {
        fetch("http://localhost:8080/queries/transportation/types")
            .then(res => res.json())
            .then(json => setTypes(json))
            .catch(err => err);

        // Get all the cities
        fetch("http://localhost:8080/queries/transportation/cities")
            .then(res => res.json())
            .then(json => setCities(json))
            .catch(err => err);

        return () => {}
    }, []);
    
    // Options for the chartjs graph
    const options = {
        scales: {
            y: {
                beginAtZero: true,
            },
            x: {
                type: 'time',
            },
        },
    };

    // Data for the chartjs graph
    const chart_data = {
        datasets: [
            {
                label: "Number of Properties Sold",
                data: data.tuples.map(el => {
                    return ({x: el['PROPERTYSALEDATE'], y: el['NUMOFSALES']})
                }),
                backgroundColor: 'rgba(255, 99, 132, 1)',
            },
            {
                label: colSelect,
                data: data.tuples.map(el => {
                    //return ({x: el["TRAFFICEVENTDATE"], y: el['AVGTRAFFICJAMDURATIONSEC']})
                    return ({x: el["TRAFFICEVENTDATE"], y: el[colSelect]})
                }),
                backgroundColor: 'rgba(9, 99, 132, 1)',
                pointStyle: 'rect',
            },
        ],
    };

    // Set the GET query (i.e. url?type=apartment&minval=2)
    function setQueryString() {
        //console.log(document.getElementById("fromdate").value);
        var url_str = base_url_str + "?";

        var query_params = {
            "fromdate" : document.getElementById("fromdate").value,
            "todate"   : document.getElementById("todate").value,
            "type"     : document.getElementById("property_type").value,
            "column"   : document.getElementById("column_select").value,
            "city"     : document.getElementById("city").value,
        };

        // A flag to only include a question mark at the beginning
        var is_first = true;
        // Add all the params that have a value
        for (var k in query_params) {
            var temp_str = "";
            
            if (query_params[k] !== "") {
                if (!is_first) {
                    temp_str += "&";
                }
                is_first = false;
                
                // Add name of param and the value
                temp_str += k + "=" + query_params[k];
                
                url_str += temp_str;
            }

        }
        
        // Update the React state
        setSqlstr(url_str);
    }
    
    // Helper function to update the column for the chart data based on
    // what the user chose
    function setColumn() {
        setColSelect(document.getElementById("column_select").value);
    }
    
    // Add the types to a js array so we can loop over them in a map later
    var property_type_rows = [];
    for (var i = 0; i < types.length; ++i) {
        property_type_rows.push(types[i]["TYPE"]);
    }

    var city_rows = [];
    for (var i = 0; i < cities.length; ++i) {
        city_rows.push(cities[i]["CITY"]);
        city_rows.sort();
    }
    

    // render
    return (
     <>

       <Scatter options={options} data={chart_data} />
        <div>
          <div>
            <label for="fromdate">From: </label>
            <input id="fromdate" type="date" name="fromdate" />
            <label for="todate"> | To: </label>
            <input id="todate" type="date" name="todate" />
            <label for="property_type"> | Property Type: </label>
            <select name="property_type" id="property_type">
                <option value=""></option>
                {property_type_rows.map(p_type => (
                    <option value={p_type}>{p_type}</option>
                ))}
            </select>
            <label for="city"> | City: </label>
            <select name="city" id="city">
                <option value=""></option>
                {city_rows.map(city => (
                    <option value={city}>{city}</option>
                ))}
            </select>

            <label for="column_select"> | Column: </label>
            <select name="column_select" id="column_select" onChange={setColumn}>
                <option value="AVGTRAFFICJAMDURATIONSEC">AVGTRAFFICJAMDURATIONSEC</option>
                <option value="AVGTRAFFICJAMDURATIONMINUTES">AVGTRAFFICJAMDURATIONMINUTES</option>
            </select>
            <div>
              <button onClick={setQueryString}>Filter</button>
            </div>
          </div>
        </div>

        <div class="queryBox">
          <div align="left" class="sqlQuery">
            <h2>Dynamic SQL Query</h2>
            <pre>
              {showsqlcommand}
            </pre>
          </div>
          <div class="queryEx">
            <h2>Colloquial Query</h2>
            <p>How has the total number of properties sold daily in a given town affected the average traffic congestion time over time? Does the property type sold, residential or commercial, affect traffic congestion differently? What, if any, change has occurred over time?</p>
            <p>An important factor when purchasing a house is the traffic infrastructure around it. A highly correlated relationship between average congestion times and the number of properties sold could suggest the city is not meeting the necessary infrastructure demand. Moreover, comparing the property type gives the user information on which type contributes to the congestion, if any. This query could also be used as a selling feature by real-estate agents for potential home or business seekers.</p>
          </div>
        </div>
        </>
    );
}
