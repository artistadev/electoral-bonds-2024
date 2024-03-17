import './App.css';
import { useEffect, useState } from 'react';
import BondsByParty from '../src/assets/electoral-bonds-by-party.txt';
import BondsByCompany from '../src/assets/electoral-bonds-by-company.txt';
import {
  Chart as ChartJS,
  registerables
} from 'chart.js'
import { Chart } from 'react-chartjs-2';
import { Doughnut } from "react-chartjs-2";
import { Pie } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
import "chartjs-plugin-datalabels";
import { type } from '@testing-library/user-event/dist/type';

ChartJS.register(
  ...registerables
)

const MapRenderer = ({ myMap }) => {
  console.log(Array.from(myMap.keys()))
  // Convert Map entries into an array of React elements
  const mapEntries = Array.from(myMap).map(([key, value]) => (
    <div key={key}>
      <span>{key}</span>
      <span>{value}</span>
    </div>
  ));

  return (
    <div>
      {mapEntries}
    </div>
  );
};


function App() {
  const [partyData, setPartyData] = useState();
  const [companyData, setCompanyData] = useState([]);
  const [chartData, setChartData] = useState();
  function rupeesToText(num) {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Lakh', 'Crore'];
  
    function convertLessThanThousand(num) {
      if (num === 0) {
        return '';
      } else if (num < 10) {
        return units[num];
      } else if (num < 20) {
        return teens[num - 10];
      } else if (num < 100) {
        return tens[Math.floor(num / 10)] + ' ' + convertLessThanThousand(num % 10);
      } else {
        return units[Math.floor(num / 100)] + ' Hundred ' + convertLessThanThousand(num % 100);
      }
    }
  
    function convert(num) {
      if (num === 0) {
        return '0';
      }
  
      let result = '';
      let i = 0;
      while (num > 0) {
        if (num % 1000 !== 0) {
          result = convertLessThanThousand(num % 1000) + ' ' + thousands[i] + ' ' + result;
        }
        num = Math.floor(num / 1000);
        i++;
      }
  
      return result.trim();
    }
  
    if (num >= 10000000) {
      return (num / 10000000) + ' Cr';
    } else if(num == 0){
      return '0';
    } else {
      return convert(num) + ' Rupees';
    }
  }
  
  const options = {
    responsive: true,
    scales: {
      x: {
        grid: {
          display: true,
          drawBorder: false
        }
      },
      y: {
        grid: {
          display: true,
          drawBorder: false
        },
        ticks: {
          callback: function(label, index, labels) {
              return rupeesToText(label);
          }
      },
      scaleLabel: {
          display: true,
          labelString: '1cr = 10000000'
      }
      }
    },
    pointLabel: {
      type: 'pointLabel'
    },
    plugins: {
      legend: {
        display: true
      },
      title: {
        display: true,
        text: "Electoral Bond Donated to Each Party",
        padding: {
          bottom: 20
        },
        weight: "bold",
        color: "#00325c",
        font: {
          size: 13
        },
        align: "center"
      },
      datalabels: {
        display: true,
        color: "white",
        align: "bottom",
        padding: {
          right: 0
        },
        labels: {
          padding: { top: 1 },
          title: {
            font: {
              weight: "bold",
              size: 24
            }
          },
          value: {
            color: "green"
          }
        }
      }
    }
  };
  async function loadPdf(fileName) {

    try {
      const response = await fetch(BondsByParty);
      if (!response.ok) {
        throw new Error('Failed to fetch text file');
      }

      // Read the response as text
      const text = await response.text();

      // Split the text into lines
      const lines = text.split('\n');
      // Print each line
      var finalData = [];
      let id = 1;
      lines.forEach((line, index) => {
        if (line && line != null && line !== undefined && line !== '') {
          var splits = line.split(',');

          var data = {
            "key": id++,
            "partyName": splits[1],
            "amount": parseFloat(splits[2]),
            "date": splits[0]
          }

          finalData.push(data);
        }
        //console.log(`Line ${index + 1}: ${line}`);
      });
      setPartyData(finalData);
      getDonationByParty(finalData);
      console.log([...finalData.keys()]);
      console.log([...finalData.values()]);

    } catch (error) {
      console.error('Error reading text file:', error.message);
    }
  }

  function getDonationByParty(finalData) {
    const myMap = new Map();
    for (var i = 0; i < finalData.length; i++) {
      if (myMap.has(finalData[i].partyName)) {
        if (parseFloat(finalData[i].amount)) {
          myMap.set(finalData[i].partyName, myMap.get(finalData[i].partyName) + finalData[i].amount);
        }
      }
      else {
        if (parseFloat(finalData[i].amount)) {
          myMap.set(finalData[i].partyName, finalData[i].amount);
        }
      }
    }

    console.log('', [...myMap.values()].map(value => rupeesToText(value)))
    setPartyData(myMap);

    setChartData({
      labels: [...myMap.keys()],
      datasets: [
        {
          categoryPercentage: 1,
          label: "Amount Received in INR",
          data: [...myMap.values()],
          backgroundColor: [
            "rgba(99, 99, 234, 1)",
            "rgba(99, 99, 234, 0.7)",
            "rgba(99, 99, 234, 0.4)",
            "rgba(99, 99, 234, 0.1)",
            "rgba(236, 91, 86, 1)"
          ],
          borderWidth: 0
        }
      ]
    })
    myMap.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
  }

  useEffect(() => {
    loadPdf(BondsByParty);
  }, [])

  return (
    <div className="App">
      <h2 style={{ textAlign: "center" }}>Electoral Bond Data</h2>
      <header className="App-header">
      </header>

      <div className="chart-container">
        
        {partyData && <div style={{ height: "1000px" }}>
          <Bar data={chartData} options={options} />
        </div>}
      </div>
    </div>
  );
}

export default App;
