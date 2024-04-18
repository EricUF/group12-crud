import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
//import moment from 'moment';
import 'chartjs-adapter-moment';
import NumberOfTuples from '../../custom_components/num_of_tuples_comp.js';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale);


export default function MonthlySales() {
    return (
        <>
          <h1>Monthly Sales Trend</h1>
          <TimeOfYearQuery /> 
        </>
    );
}

function TimeOfYearQuery() {
    const base_url_str = "http://localhost:8080/queries/monthofyear/avgsales";

    // REACT States
    const [data, setData] = useState({ tuples: [] });
    const [sqlstr, setSqlstr] = useState(base_url_str);
    const [showsqlcommand, setShowsqlcommand] = useState("");
    const [types, setTypes] = useState([]);
    const [cities, setCities] = useState([]);
    const [colSelect, setColSelect] = useState("NUMOFSALES");

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
        fetch("http://localhost:8080/queries/monthofyear/types")
            .then(res => res.json())
            .then(json => setTypes(json))
            .catch(err => err);

        // Get all the cities
        fetch("http://localhost:8080/queries/monthofyear/cities")
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
                label: colSelect,
                //data: [{x: 0, y: 1}],
                data: data.tuples.map(el => {
                    return ({x: new Date(el.YEAR,  el.MONTH, el.DAY), y: el[colSelect]})
                }),
                backgroundColor: 'rgba(99, 255, 92, 1)',
            },
            {
                label: 'Avg. Temperature',
                data: data.tuples.map(el => {
                    return ({x: new Date(el.YEAR,  el.MONTH, el.DAY), y: el['AVGTEMP']})
                }),
                backgroundColor: 'rgba(9, 99, 132, 1)',
                pointStyle: 'rect',
            },
            {
                label: 'Min. Temperature',
                data: data.tuples.map(el => {
                    return ({x: new Date(el.YEAR,  el.MONTH, el.DAY), y: el['MINTEMP']})
                }),
                backgroundColor: 'rgba(0, 0, 255, 1)',
                pointStyle: 'rect',
            },
            {
                label: 'Max. Temperature',
                data: data.tuples.map(el => {
                    return ({x: new Date(el.YEAR,  el.MONTH, el.DAY), y: el['MAXTEMP']})
                }),
                backgroundColor: 'rgba(255, 99, 20, 1)',
                pointStyle: 'rect',
            },
            {
                label: 'Avg Snow Depth',
                data: data.tuples.map(el => {
                    return ({x: new Date(el.YEAR,  el.MONTH, el.DAY), y: el['AVGSNOWDEPTH']})
                }),
                backgroundColor: 'rgba(30, 150, 255, 1)',
                pointStyle: 'rect',
            },
            {
                label: 'Avg Precipitation',
                data: data.tuples.map(el => {
                    return ({x: new Date(el.YEAR,  el.MONTH, el.DAY), y: el['AVGPRECIPITATION']})
                }),
                backgroundColor: 'rgba(255, 99, 132, 1)',
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
            "minval"   : document.getElementById("min_val").value,
            "maxval"   : document.getElementById("max_val").value,
            "city"     : document.getElementById("city").value,
            "year"     : document.getElementById("year").checked,
            "month"    : document.getElementById("month").checked,
            "day"      : document.getElementById("day").checked,
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
            <label for="year">Year:</label>
            <input id="year" type="checkbox" name="year" defaultChecked={true} />
            <label for="month"> | month:</label>
            <input id="month" type="checkbox" name="month" defaultChecked={true} />
            <label for="day"> | day:</label>
            <input id="day" type="checkbox" name="day" defaultChecked={true} />
          </div>

          <div>
            <label for="fromdate">From: </label>
            <input id="fromdate" type="date" name="fromdate" />
            <label for="todate"> | To: </label>
            <input id="todate" type="date" name="todate" />
            <label for="min_val"> | Min Value: </label>
            <input id="min_val" type="number" name="min_val" placeholder="0" />
            <label for="max_val"> | Max Value: </label>
            <input id="max_val" type="number" name="max_val" />
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
                <option value="NUMOFSALES">NumOfSales</option>
            </select>
            <div>
              <button onClick={setQueryString}>Filter</button>
            </div>
          </div>
        </div>

        <div align="left">
          <pre>
            {showsqlcommand}
          </pre>
        </div>
        </>
    );
}
