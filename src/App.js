import './App.css';
import { useEffect, useState } from 'react';
import BondsByParty from '../src/assets/electoral-bonds-by-party.txt';
import BondsByCompany from '../src/assets/electoral-bonds-by-company.txt';
import PieChart from './components/PieChart';
import BarChart from './components/BarChart';
import {
  Chart as ChartJS,
  registerables
} from 'chart.js'

import "chartjs-plugin-datalabels";


ChartJS.register(
  ...registerables
)

function App() {
  const [partyData, setPartyData] = useState();
  const [companyData, setCompanyData] = useState([]);
  const [chartData, setChartData] = useState();
  const [companyChartData, setCompanyChartData] = useState();
  const [topPartyByAmount, setTopPartyByAmount] = useState([]);

  const [topCompanyByAmount, setTopCompanyByAmount] = useState([]);

  const [allPartyChartData, setAllPartyChartData] = useState();

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
    } else if(num === 0){
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
        },
        ticks: {
          maxRotation: 75,
          minRotation: 75
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
        display: true,
        position: 'bottom'
      },
      title: {
        display: true,
        text: "Parties with Donations via Electoral Bond",
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

  const pieChartOptionsForParty = {
    responsive: true,
    pointLabel: {
      type: 'pointLabel'
    },
    plugins: {
      legend: {
        position: 'bottom',
        display: true
      },
      title: {
        display: true,
        text: "Top 10 Parties with Most Donations via Electoral Bond Purchase",
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

  const pieChartOptionsForCompany = {
    responsive: true,
    pointLabel: {
      type: 'pointLabel'
    },
    plugins: {
      legend: {
        position: 'bottom',
        display: true
      },
      title: {
        display: true,
        text: "Top 10 Companies with Most Electoral Bond Purchase",
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
  async function loadDataByParty() {
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
      });
      setPartyData(finalData);
      getDonationByParty(finalData);
    } catch (error) {
      console.error('Error reading text file:', error.message);
    }
  }

  async function loadDataByCompany() {
    try {
      const response = await fetch(BondsByCompany);
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
            "companyName": splits[1],
            "amount": parseFloat(splits[2]),
            "date": splits[0]
          }
          finalData.push(data);
        }
      });
      setCompanyData(finalData);
      getDonationByCompany(finalData);
    } catch (error) {
      console.error('Error reading text file:', error.message);
    }
  }

  function getTopTenPartyWithHighestDonation(dataByParty) {
    const sortedEntries = Array.from(dataByParty.entries()).sort((a, b) => b[1] - a[1]);
    const top10Entries = sortedEntries.slice(0, 10);

    setTopPartyByAmount(top10Entries);
  }

  function getTopTenCompanyWithHighestDonation(dataByCompany) {
    const sortedEntries = Array.from(dataByCompany.entries()).sort((a, b) => b[1] - a[1]);
    const top10Entries = sortedEntries.slice(0, 10);

    setTopCompanyByAmount(top10Entries);
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

    setPartyData(myMap);
    getTopTenPartyWithHighestDonation(myMap);
    setAllPartyChartData({
      labels: [...myMap.keys()],
      datasets: [
        {
          categoryPercentage: 1,
          label: "Amount Received in INR",
          data: [...myMap.values()],
          backgroundColor: ["#e67e22", "#3498db", "#2ecc71", "#7f8c8d", "#34495e", "#9b59b6", "#FFDC00", "#001f3f", "#39CCCC", "#01FF70", "#85144b", "#F012BE", "#3D9970", "#111111", "#AAAAAA"],
          borderWidth: 0
        }
      ]
    })
  }

  function getDonationByCompany(finalData) {
    const myMap = new Map();
    for (var i = 0; i < finalData.length; i++) {
      if (myMap.has(finalData[i].companyName)) {
        if (parseFloat(finalData[i].amount)) {
          myMap.set(finalData[i].companyName, myMap.get(finalData[i].companyName) + finalData[i].amount);
        }
      }
      else {
        if (parseFloat(finalData[i].amount)) {
          myMap.set(finalData[i].companyName, finalData[i].amount);
        }
      }
    }

    setCompanyData(myMap);
    getTopTenCompanyWithHighestDonation(myMap);
  }

  

  useEffect(() => {
    loadDataByParty();
    loadDataByCompany();
  }, [])

  useEffect(() => {
    setChartData({
      labels: [...topPartyByAmount.map(([first]) => first)],
      datasets: [
        {
          categoryPercentage: 1,
          label: "Amount Received in INR",
          data: [...topPartyByAmount.map(([, second]) => second)],
          backgroundColor: ["#e67e22", "#3498db", "#2ecc71", "#7f8c8d", "#34495e", "#9b59b6", "#FFDC00", "#001f3f", "#39CCCC", "#01FF70", "#85144b", "#F012BE", "#3D9970", "#111111", "#AAAAAA"],
          borderWidth: 0
        }
      ]
    })
  }, [topPartyByAmount]);

  useEffect(() => {
    setCompanyChartData({
      labels: [...topCompanyByAmount.map(([first]) => first)],
      datasets: [
        {
          categoryPercentage: 1,
          label: "Amount Received in INR",
          data: [...topCompanyByAmount.map(([, second]) => second)],
          backgroundColor: ["#e67e22", "#3498db", "#2ecc71", "#7f8c8d", "#34495e", "#9b59b6", "#FFDC00", "#001f3f", "#39CCCC", "#01FF70", "#85144b", "#F012BE", "#3D9970", "#111111", "#AAAAAA"],
          borderWidth: 0
        }
      ]
    })
  }, [topCompanyByAmount])

  return (
    <div className="App">
      <h2 style={{ textAlign: "center" }}>Electoral Bond Data</h2>
      <header className="App-header">
      </header>
      <div className="chart-container">
      </div>
      { partyData &&
        <div style={{display: 'flex', width: '100%', flex: 1}}>
          <div style={{display: 'flex', flex: 0.5, alignItems: 'center'}}>
          { topPartyByAmount && <PieChart data={chartData} options={pieChartOptionsForParty}/> }
          </div>
          <div style={{display: 'flex', flex: 0.5, alignItems: 'center'}}>
          { topCompanyByAmount && <PieChart data={companyChartData} options={pieChartOptionsForCompany}/> }
          </div>
        </div>
      }
      <br/><br/>
      {
        allPartyChartData && <BarChart data={allPartyChartData} options={options}/>
      }
    </div>
  );
}

export default App;
