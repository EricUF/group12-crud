import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
//import moment from 'moment';
import 'chartjs-adapter-moment';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale);


export default function ResidentalDevelopment() {
    return (
            <div>
              <h1>Residential Development</h1>
              <ResDevQuery />
            </div>
    );
}

function ResDevQuery() {
    const base_url_str = "http://localhost:8080/queries/resdev";

    // REACT States
    const [data, setData] = useState({ tuples: [] });
    const [sqlstr, setSqlstr] = useState(base_url_str);
    const [showsqlcommand, setShowsqlcommand] = useState("");
    const [cities, setCities] = useState([]);

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
                label: "Condo Num. of Sales",
                data: data.tuples.map(el => {
                    return ({x: new Date(el.YEAR,  el.MONTH, el.DAY), y: el["CONDO_SALES"]})
                }),
                backgroundColor: 'rgba(20, 200, 35, 1)',
            },
            {
                label: "Multi-Family Num. of Sales",
                data: data.tuples.map(el => {
                    return ({x: new Date(el.YEAR,  el.MONTH, el.DAY), y: el["MULTIFAM_SALES"]})
                }),
                backgroundColor: 'rgba(20, 127, 255, 1)',
            },
            {
                label: "Single-Family Num. of Sales",
                data: data.tuples.map(el => {
                    return ({x: new Date(el.YEAR,  el.MONTH, el.DAY), y: el["SINGLEFAM_SALES"]})
                }),
                backgroundColor: 'rgba(255, 127, 20, 1)',
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
            <label for="city"> | City: </label>
            <select name="city" id="city">
                <option value=""></option>
                {city_rows.map(city => (
                    <option value={city}>{city}</option>
                ))}
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
            <p>If we consider different residential types (such as single family, two family, and condo), what has been the development of different residential types in different towns in Connecticut over time?  What was the highest category in each town? Has this changed over time?</p>
            <p>A family looking for a new place to live will be interested in the rate at which residential types are being developed. This trend can also indirectly show the amount of growth in an area that may be of interest to business owners or commercial real estate seekers. Additionally, this query will allow users to view the average price of each type and a comparison between towns. This is critical for home seekers to analyze as it will enable them to make a more informed decision about which housing type they can afford in that town. Also, this will allow real estate agents to interpret the trends and conclude where the demand for residential types is located.</p>
          </div>
        </div>
        </>
    );
}
