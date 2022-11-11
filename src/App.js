import React, {useEffect, useState} from 'react';
import { useQuery, gql } from '@apollo/client';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import './App.css';

ChartJS.register(ArcElement, 
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const GET_QUERY = gql`
{
    reserves {
        id
        symbol
        name
        totalLiquidity
    }
}
`;

function DisplayGraphs() {
    const { loading, error, data } = useQuery(GET_QUERY);

    const [linedata1, setLinedata1] = useState([]);
    const [linedata2, setLinedata2] = useState([]);

    useEffect(() => {
        Promise.all([
            fetch('https://aave-api-v2.aave.com/data/rates-history?reserveId=0x514910771af9ca656af840dff83e8264ecf986ca0xb53c1a33016b2dc2ff3653530bff1848a515c8c5&from=1667952000&resolutionInHours=6'),
            fetch('https://aave-api-v2.aave.com/data/rates-history?reserveId=0x0000000000085d4780b73119b644ae5ecd22b3760xb53c1a33016b2dc2ff3653530bff1848a515c8c5&from=1667952000&resolutionInHours=6'),
        ])
        .then(([resData1, resData2]) => 
            Promise.all([resData1.json(), resData2.json()])
        )
        .then(([data1, data2]) => {
            setLinedata1(data1);
            setLinedata2(data2);
        })
        .catch(([err1, err2]) => {
            console.log(err1.message, err2.message);
        });
    }, []);

    if (loading) return <p className="text">Loading...</p>;
    if (error) return <p className="text">Error :(</p>;

    let timestamps = linedata1.map(a => (a.x.year + '/' + a.x.month + '/' + a.x.date + ' ' + a.x.hours + ' hours'));
    let utilization1 = linedata1.map(a => a.utilizationRate_avg);
    let utilization2 = linedata2.map(a => a.utilizationRate_avg);

    timestamps.forEach((element, index) => {
        timestamps[index] = element.toString();
    });

    let names = data.reserves.map(a => a.name);
    let total = data.reserves.map(a => a.totalLiquidity);

    total.forEach((element, index) => {
        total[index] = element % 10^18;
    });

    const piedata = {
        labels: names,
        datasets: [
          {
            label: 'percentage',
            data: total,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 140, 64, 0.2)',
              'rgba(205, 159, 64, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(205, 159, 64, 1)',
              'rgba(255, 149, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
    };

    const optionsPieChart = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Total Liquidity',
          },
        },
    };

    const optionsLineChart = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Avg Utilization Rate',
          },
        },
    };
      
    const linedata = {
        labels: timestamps,
        datasets: [
          {
            label: 'ChainLink Token',
            data: utilization1,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'TrueUSD',
            data: utilization2,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
    };

    return (
        <div className="Chart-container">
            <div className="Pie-container">
                <Pie options={optionsPieChart} data={piedata} />
            </div>
            <div className="Line-container">
                <Line options={optionsLineChart} data={linedata} />
            </div> 
        </div>
    );
}

export default function App() {
return (
    <div className="App">
        <h2 className="App-header">AAVE Analytics</h2>
        <br/>
        <DisplayGraphs />
    </div>
);
}